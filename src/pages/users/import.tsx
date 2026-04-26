import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import useSwr from 'swr';
import { Alert, Badge, Button, Card, Form, ProgressBar } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import { faCheckCircle, faExclamationCircle, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../components/layout/Header';
import { TextLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import { usersFetcher } from '../../lib/fetchers';
import { ErrorPage } from '../../components/layout/ErrorPage';
import { Role } from '../../models/enums/Role';
import { MemberStatus } from '../../models/enums/MemberStatus';
import { getResponseContentOrError, getMemberStatusName, getRoleName } from '../../lib/utils';
import { useNotifications } from '../../lib/useNotifications';
import { IUserObjectionModel } from '../../models/objection-models/UserObjectionModel';
import { KeyValue } from '../../models/interfaces/KeyValue';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.ADMIN);
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Importera användare från spreadsheet';
const breadcrumbs = [
    { link: '/users', displayName: 'Användare' },
    { link: '/users/import', displayName: pageTitle },
];

const parseMemberStatus = (value: string): MemberStatus | null => {
    switch (value.trim().toUpperCase()) {
        case 'CHEF':
            return MemberStatus.CHEF;
        case 'AKTIV':
            return MemberStatus.AKTIV;
        case 'ASP':
            return MemberStatus.ASP;
        case 'RESURS':
            return MemberStatus.RESURS;
        case 'GLÖMD':
            return MemberStatus.GLÖMD;
        default:
            return null;
    }
};

const parseRole = (value: string): Role | null => {
    if (!value || value.trim() === '') return Role.USER;
    switch (value.trim().toUpperCase()) {
        case 'ADMIN':
            return Role.ADMIN;
        case 'USER':
            return Role.USER;
        case 'READONLY':
            return Role.READONLY;
        case 'CASH_PAYMENT_MANAGER':
            return Role.CASH_PAYMENT_MANAGER;
        default:
            return null;
    }
};

interface ParsedUserRow {
    id: number;
    name: string;
    nameTag: string;
    memberStatus: MemberStatus | null;
    emailAddress: string;
    phoneNumber: string;
    slackId: string;
    username: string;
    password: string;
    role: Role | null;
    rawLine: string;
    isValid: boolean;
}

const parseCSV = (csv: string): ParsedUserRow[] => {
    const lines = csv.split('\n').filter((line) => line.trim() !== '');
    const dataLinesWithoutHeader = lines.slice(1);
    return dataLinesWithoutHeader.map((line, index) => {
        const cols = line.split('\t');
        const name = (cols[0] ?? '').trim();
        const nameTag = (cols[1] ?? '').trim();
        const memberStatusRaw = (cols[2] ?? '').trim();
        const emailAddress = (cols[3] ?? '').trim();
        const phoneNumber = (cols[4] ?? '').trim();
        const slackId = (cols[5] ?? '').trim();
        const username = (cols[6] ?? '').trim();
        const password = (cols[7] ?? '').trim();
        const roleRaw = (cols[8] ?? '').trim();

        const memberStatus = parseMemberStatus(memberStatusRaw);
        const role = parseRole(roleRaw);

        const isValid =
            name.length > 0 && nameTag.length > 0 && emailAddress.length > 0 && memberStatus !== null && role !== null;

        return {
            id: index,
            name,
            nameTag,
            memberStatus,
            emailAddress,
            phoneNumber,
            slackId,
            username,
            password,
            role,
            rawLine: line,
            isValid,
        };
    });
};

const UserCsvImportPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const {
        data: users,
        error,
        isValidating,
    } = useSwr('/api/users', usersFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    const [csv, setCsv] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [numberOfImportedUsers, setNumberOfImportedUsers] = useState(0);
    const [importHasStarted, setImportHasStarted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [done, setDone] = useState(false);
    const { showCreateSuccessNotification, showCreateFailedNotification } = useNotifications();

    if (error) {
        return (
            <ErrorPage
                errorMessage={error.message}
                fixedWidth={true}
                currentUser={currentUser}
                globalSettings={globalSettings}
            />
        );
    }

    if (isValidating || !users) {
        return <TextLoadingPage fixedWidth={false} currentUser={currentUser} globalSettings={globalSettings} />;
    }

    // Parse CSV
    //
    let parsedRows: ParsedUserRow[] = [];
    let usersToImport: ParsedUserRow[] = [];
    let csvError: string | null = null;
    let adminRoleWarningNames: string[] = [];
    let duplicateUsernamesInCsv: string[] = [];
    let usernamesTakenByExistingUsers: string[] = [];

    try {
        if (csv.trim().length > 0) {
            parsedRows = parseCSV(csv);

            if (parsedRows.length === 0) {
                csvError = 'Inga rader kunde tolkas';
            } else {
                // Filter out users that already exist (matched by name)
                usersToImport = parsedRows.filter((row) => row.isValid && !users.some((u) => u.name === row.name));

                adminRoleWarningNames = usersToImport
                    .filter((row) => row.role === Role.ADMIN && (row.username || row.password))
                    .map((row) => row.name);

                // Duplicate usernames within the CSV
                const nonEmptyUsernames = usersToImport.map((row) => row.username).filter((u) => u.length > 0);
                duplicateUsernamesInCsv = nonEmptyUsernames.filter((u, i, arr) => arr.indexOf(u) !== i);

                // Usernames already taken by existing users
                usernamesTakenByExistingUsers = usersToImport
                    .map((row) => row.username)
                    .filter((u) => u.length > 0 && users.some((existing) => existing.username === u));
            }
        } else {
            csvError = 'Tom';
        }
    } catch {
        csvError = 'Kunde inte tolka CSV';
    }

    const invalidRows = parsedRows.filter((row) => !row.isValid);
    const skippedRows = parsedRows.filter((row) => row.isValid && users.some((u) => u.name === row.name));
    const hasUsernameConflicts = duplicateUsernamesInCsv.length > 0 || usernamesTakenByExistingUsers.length > 0;
    const allRowsValid = parsedRows.length > 0 && invalidRows.length === 0 && !hasUsernameConflicts;

    // Import logic
    //
    const importAll = async () => {
        setImportHasStarted(true);

        try {
            for (const row of usersToImport) {
                setNumberOfImportedUsers((x) => x + 1);
                await addUser(row);
            }
            setDone(true);
        } catch (e) {
            if (!(e instanceof Error)) return;
            setErrorMessage(e.message);
        }
    };

    const addUser = async (row: ParsedUserRow) => {
        const userPayload = {
            name: row.name,
            nameTag: row.nameTag,
            memberStatus: row.memberStatus,
            emailAddress: row.emailAddress,
            phoneNumber: row.phoneNumber,
            slackId: row.slackId,
        };

        const createRequest = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: userPayload }),
        };

        let createdUser: IUserObjectionModel;
        try {
            createdUser = await fetch('/api/users', createRequest).then((res) =>
                getResponseContentOrError<IUserObjectionModel>(res),
            );
        } catch (error: unknown) {
            console.error(error);
            showCreateFailedNotification(row.name);
            throw new Error(`Misslyckades med att skapa användaren "${row.name}"`);
        }

        showCreateSuccessNotification(createdUser.name);

        // If credentials are provided, set them up
        if (row.username || row.password) {
            const authPayload = {
                existingPassword: adminPassword,
                userId: createdUser.id,
                username: row.username,
                password: row.password,
                role: row.role ?? Role.USER,
            };

            const authRequest = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ changePasswordRequest: authPayload }),
            };

            try {
                await fetch(`/api/users/userauth/${createdUser.id}`, authRequest).then((res) =>
                    getResponseContentOrError(res),
                );
            } catch (error: unknown) {
                console.error(error);
                showCreateFailedNotification(`${row.name} (inloggningsuppgifter)`);
                throw new Error(`Misslyckades med att sätta inloggningsuppgifter för "${row.name}"`);
            }
        }
    };

    const tableSettings: TableConfiguration<ParsedUserRow> = {
        entityTypeDisplayName: 'användare',
        hideTableFilter: true,
        hideTableCountControls: true,
        defaultSortPropertyName: 'name',
        defaultSortAscending: true,
        columns: [
            {
                key: 'name',
                displayName: 'Namn',
                getValue: (row) => row.name,
                getContentOverride: (row) => row.name || <em className="text-danger">saknas</em>,
            },
            {
                key: 'nameTag',
                displayName: 'Tagg',
                getValue: (row) => row.nameTag,
                getContentOverride: (row) => row.nameTag || <em className="text-danger">saknas</em>,
            },
            {
                key: 'memberStatus',
                displayName: 'Medlemsstatus',
                getValue: (row) => (row.memberStatus !== null ? getMemberStatusName(row.memberStatus) : ''),
                getContentOverride: (row) =>
                    row.memberStatus !== null ? (
                        getMemberStatusName(row.memberStatus)
                    ) : (
                        <em className="text-danger">ogiltigt</em>
                    ),
            },
            {
                key: 'emailAddress',
                displayName: 'Email',
                getValue: (row) => row.emailAddress,
                getContentOverride: (row) => row.emailAddress || <em className="text-danger">saknas</em>,
            },
            {
                key: 'phoneNumber',
                displayName: 'Telefon',
                getValue: (row) => row.phoneNumber,
            },
            {
                key: 'slackId',
                displayName: 'Slack-id',
                getValue: (row) => row.slackId,
            },
            {
                key: 'username',
                displayName: 'Användarnamn',
                getValue: (row) => row.username,
            },
            {
                key: 'password',
                displayName: 'Lösenord',
                getValue: (row) => (row.password ? '••••••' : ''),
            },
            {
                key: 'role',
                displayName: 'Behörighet',
                getValue: (row) => (row.username || row.password ? getRoleName(row.role ?? undefined) : ''),
                getContentOverride: (row) => {
                    if (!(row.username || row.password)) {
                        return (
                            <em
                                className="text-muted"
                                title="Inloggningsuppgifter skapas inte – ingen behörighet sätts"
                            >
                                Ingen inloggning
                            </em>
                        );
                    }
                    return row.role !== null ? getRoleName(row.role) : <em className="text-danger">ogiltigt</em>;
                },
            },
            {
                key: 'status',
                displayName: 'Status',
                getValue: (row) => {
                    const isSkipped = row.isValid && users.some((u) => u.name === row.name);
                    if (!row.isValid) return 'Ogiltig rad';
                    if (isSkipped) return 'Finns redan';
                    const isUsernameConflict =
                        row.username.length > 0 &&
                        (duplicateUsernamesInCsv.includes(row.username) ||
                            usernamesTakenByExistingUsers.includes(row.username));
                    if (isUsernameConflict) return 'Konflikt';
                    if (row.role === Role.ADMIN && (row.username || row.password)) return 'Admin';
                    return 'Importeras';
                },
                getContentOverride: (row) => {
                    const isSkipped = row.isValid && users.some((u) => u.name === row.name);
                    if (!row.isValid) return <Badge variant="danger">Ogiltig rad</Badge>;
                    if (isSkipped) return <Badge variant="secondary">Finns redan</Badge>;
                    const isUsernameConflict =
                        row.username.length > 0 &&
                        (duplicateUsernamesInCsv.includes(row.username) ||
                            usernamesTakenByExistingUsers.includes(row.username));
                    if (isUsernameConflict)
                        return (
                            <Badge variant="danger">
                                {duplicateUsernamesInCsv.includes(row.username)
                                    ? 'Dublett användarnamn'
                                    : 'Användarnamn upptaget'}
                            </Badge>
                        );
                    return <Badge variant="success">Importeras</Badge>;
                },
            },
        ],
    };

    const canImport =
        !csvError && usersToImport.length > 0 && allRowsValid && !importHasStarted && adminPassword.length > 0;

    return (
        <Layout title={pageTitle} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button variant="primary" disabled={!canImport} onClick={() => importAll()}>
                    <FontAwesomeIcon icon={faFileImport} className="mr-1" /> Importera
                </Button>
            </Header>

            <Card className="mb-3">
                <Card.Header>Status</Card.Header>
                <Card.Body>
                    {csv.trim().length === 0 ? <p>Klistra in tab-separerad data nedan för att börja.</p> : null}

                    {csv.trim().length > 0 && csvError && csvError !== 'Tom' ? (
                        <p className="text-danger">
                            <FontAwesomeIcon icon={faExclamationCircle} /> {csvError}
                        </p>
                    ) : null}

                    {errorMessage ? (
                        <p className="text-danger">
                            <FontAwesomeIcon icon={faExclamationCircle} /> {errorMessage}
                        </p>
                    ) : null}

                    {!csvError && !importHasStarted ? (
                        <>
                            <p>
                                Användare att importera: {usersToImport.length} st
                                {skippedRows.length > 0
                                    ? ` (${skippedRows.length} st finns redan och har ignorerats)`
                                    : ''}
                            </p>
                            <p>
                                Varav med inloggningsuppgifter:{' '}
                                {usersToImport.filter((row) => row.username || row.password).length} st
                            </p>
                            {invalidRows.length > 0 ? (
                                <p className="text-danger">
                                    <FontAwesomeIcon icon={faExclamationCircle} /> {invalidRows.length} rad(er) är
                                    ogiltiga och kommer inte importeras. Kontrollera att Namn, Tagg, Email och
                                    Medlemsstatus är ifyllda och att Medlemsstatus/Roll är giltiga värden.
                                </p>
                            ) : null}
                            {duplicateUsernamesInCsv.length > 0 ? (
                                <p className="text-danger">
                                    <FontAwesomeIcon icon={faExclamationCircle} /> Duplicerade användarnamn i CSV:{' '}
                                    <strong>{duplicateUsernamesInCsv.join(', ')}</strong>
                                </p>
                            ) : null}
                            {usernamesTakenByExistingUsers.length > 0 ? (
                                <p className="text-danger">
                                    <FontAwesomeIcon icon={faExclamationCircle} /> Följande användarnamn är redan
                                    upptagna: <strong>{usernamesTakenByExistingUsers.join(', ')}</strong>
                                </p>
                            ) : null}
                            <p>
                                Valideringsstatus:{' '}
                                {allRowsValid ? <span>Ok</span> : <span className="text-danger">Felaktig</span>}
                            </p>

                            <TableDisplay entities={parsedRows} configuration={tableSettings} />

                            {adminRoleWarningNames.length > 0 ? (
                                <Alert variant="warning">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                                    Följande användare kommer få rollen <strong>Admin</strong>:{' '}
                                    {adminRoleWarningNames.join(', ')}
                                </Alert>
                            ) : null}
                        </>
                    ) : null}

                    {!csvError && importHasStarted ? (
                        <>
                            <p>
                                Användare: {numberOfImportedUsers} / {usersToImport.length}
                            </p>
                            <ProgressBar
                                className="mb-3"
                                now={
                                    usersToImport.length === 0
                                        ? 100
                                        : (numberOfImportedUsers / usersToImport.length) * 100
                                }
                            />
                        </>
                    ) : null}

                    {done ? (
                        <p className="text-success">
                            <FontAwesomeIcon icon={faCheckCircle} /> Import klar!
                        </p>
                    ) : null}
                </Card.Body>
            </Card>

            <Form.Group controlId="formCsv">
                <Form.Label>Data</Form.Label>
                <Form.Control
                    as="textarea"
                    placeholder={
                        'Namn\tTagg\tMedlemsstatus\tEmail\tTelefon\tSlack-id\tAnvändarnamn\tLösenord\tRoll\nAnna Andersson\tanna\tAKTIV\tanna@example.com\t...\t...\tanna\themligtkod\tUSER'
                    }
                    rows={12}
                    name="csv"
                    onChange={(e) => setCsv(e.target.value)}
                    value={csv}
                    disabled={importHasStarted}
                />
                <Form.Text className="text-muted">
                    Första raden är alltid en rubrikrad och hoppas över. Kolumner (tab-separerade):{' '}
                    <strong>
                        Namn | Tagg | Medlemsstatus | Email | Telefon | Slack-id | Användarnamn | Lösenord | Roll
                    </strong>
                    <br />
                    Giltiga värden för Medlemsstatus: CHEF, AKTIV, ASP, RESURS, GLÖMD
                    <br />
                    Giltiga värden för Roll: ADMIN, USER, READONLY, CASH_PAYMENT_MANAGER (lämna tomt för USER)
                </Form.Text>
            </Form.Group>

            <Form.Group controlId="formAdminPassword" className="mb-3">
                <Form.Label>Ditt lösenord</Form.Label>
                <Form.Control
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={importHasStarted}
                />
                <Form.Text className="text-muted">
                    Bekräfta din identitet genom att ange ditt nuvarande lösenord. Behövs för att kunna sätta
                    inloggningsuppgifter.
                </Form.Text>
            </Form.Group>
        </Layout>
    );
};

export default UserCsvImportPage;

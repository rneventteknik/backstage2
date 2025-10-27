import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../../lib/useUser';
import { bookingFetcher } from '../../../lib/fetchers';
import Header from '../../../components/layout/Header';
import { TwoColLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { Role } from '../../../models/enums/Role';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { KeyValue } from '../../../models/interfaces/KeyValue';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.USER);
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const BookingPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const [title, setTitle] = useState('Dokument');
    const [legalTitle, setLegalTitle] = useState('Titel');
    const [legalContent, setLegalContent] = useState('Innehåll');
    const [showLegalLink, setShowLegalLink] = useState(true);
    const [debouncedUrl, setDebouncedUrl] = useState('');

    const router = useRouter();
    const {
        data: booking,
        error,
        isValidating,
    } = useSwr('/api/bookings/' + router.query.id, bookingFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    

    useEffect(() => {
        const getDocumentUrl = () =>
            `/api/documents/price-estimate/${booking?.language}/${booking?.id}?override-price-estimate.title=${title}&override-price-estimate.legal-note.title=${legalTitle}&override-price-estimate.legal-note.content=${legalContent}` +
            (showLegalLink ? '' : '&override-price-estimate.legal-note.shown-url=');

        const handler = setTimeout(() => setDebouncedUrl(getDocumentUrl()), 500);
    
        return () => clearTimeout(handler);
      }, [booking, title, legalTitle, legalContent, showLegalLink]);

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

    if (isValidating || !booking) {
        return <TwoColLoadingPage fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings} />;
    }

    // The page itself
    //
    const pageTitle = booking?.name;
    const breadcrumbs = [
        { link: '/bookings', displayName: 'Bokningar' },
        { link: '/bookings/' + booking.id, displayName: pageTitle },
        { link: '/bookings/' + booking.id + '/custom-document-export', displayName: 'Anpassad dokumentexport' },
    ];



    return (
        <Layout title={pageTitle} fixedWidth={false} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button variant="primary" href={debouncedUrl} target="_blank">
                    <FontAwesomeIcon icon={faSave} className="mr-1" /> Exportera
                </Button>
            </Header>
            <Row className="mb-3">
                <Col xl={8}>
                    <Form.Group>
                        <Form.Label>Titel</Form.Label>

                        <Form.Control type="text" defaultValue={title} onChange={(e) => setTitle(e.target.value)} />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Titel villkor</Form.Label>

                        <Form.Control
                            type="text"
                            defaultValue={legalTitle}
                            onChange={(e) => setLegalTitle(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Innehåll villkor</Form.Label>

                        <Form.Control
                            as="textarea"
                            rows={6}
                            defaultValue={legalContent}
                            onChange={(e) => setLegalContent(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="resetNames">
                        <Form.Check
                            type="checkbox"
                            label="Visa länk till villkor"
                            checked={showLegalLink}
                            onChange={() => setShowLegalLink(!showLegalLink)}
                        />
                    </Form.Group>
                </Col>
                <Col xl={4}>
                    <Card>
                        <Card.Header>Förhandsgranskning</Card.Header>

                        <Card.Body>
                            <div className="w-full m-auto" style={{ maxWidth: '550px' }}>
                                <embed src={debouncedUrl} type="application/pdf" width="100%" height="750" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Layout>
    );
};

export default BookingPage;

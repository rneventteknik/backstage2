import React from 'react';
import Layout from '../components/layout/Layout';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../lib/useUser';
import Header from '../components/layout/Header';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const pageTitle = 'Hjälp';
const breadcrumbs = [{ link: 'about', displayName: pageTitle }];

const AboutPage: React.FC<Props> = ({ user }: Props) => (
    <Layout title={pageTitle} fixedWidth={true} currentUser={user}>
        <Header title={pageTitle} breadcrumbs={breadcrumbs}></Header>

        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam aliquam interdum sapien et pellentesque.
            Suspendisse potenti. Donec quis efficitur lacus, non finibus justo. Sed et ornare nunc, at ultrices purus.
            Aliquam volutpat nunc fringilla ligula placerat rhoncus. Nunc fermentum porta aliquet. Donec enim ex,
            placerat non posuere nec, aliquet et magna. Suspendisse nec purus nec nulla fermentum fringilla nec sit amet
            ligula.
        </p>

        <p>
            Nunc ipsum ipsum, cursus ut nisi vel, ultricies lobortis metus. Orci varius natoque penatibus et magnis dis
            parturient montes, nascetur ridiculus mus. Cras ac molestie felis. Praesent vehicula tortor vitae tortor
            pellentesque fringilla. Donec maximus egestas eros a tempor. Suspendisse eget pulvinar dui, in tincidunt
            tellus. Nullam at metus mollis, fringilla urna a, elementum turpis. Praesent sed turpis non erat tincidunt
            interdum. Morbi in ultricies neque, a volutpat neque. Vestibulum id dui justo. Donec elementum egestas felis
            sodales rutrum.
        </p>

        <p>
            Nulla facilisi. Sed lectus risus, aliquet quis molestie ac, venenatis hendrerit elit. Praesent vel nunc sed
            nunc scelerisque interdum. Nunc porttitor semper massa id sagittis. Aenean vel tincidunt metus, sit amet
            accumsan urna. Maecenas gravida suscipit euismod. Nulla sodales, enim ac dapibus porta, quam ligula pharetra
            velit, eget dignissim risus odio luctus lacus. Ut varius auctor tristique. Integer eleifend, lectus sed
            interdum luctus, lectus tortor cursus diam, et placerat lorem ante ac augue.
        </p>

        <p>
            Sed eleifend, libero ac molestie vestibulum, neque mauris aliquet eros, eget semper ipsum purus suscipit
            magna. Nam viverra sit amet lacus nec varius. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
            risus velit, tincidunt non lorem quis, vulputate pulvinar purus. Pellentesque massa tellus, dapibus vel
            augue a, consectetur tempus ipsum. Fusce dictum tempus odio eu aliquet. Suspendisse a blandit orci. Mauris
            vitae urna quis neque tincidunt maximus at eu ligula.
        </p>

        <p>
            Maecenas nisl massa, accumsan nec varius sit amet, pulvinar a nisl. Nam pharetra nec tellus at tempus.
            Pellentesque ut luctus tortor, sit amet gravida enim. Nullam risus ligula, aliquet eget porta in, pretium
            eget ligula. Maecenas ac euismod ante. Aenean a nulla consectetur, tempor elit sit amet, luctus ex. Donec
            volutpat posuere ante quis dictum. Vestibulum vitae tellus mauris. Ut non felis commodo, molestie velit
            quis, eleifend nisl.{' '}
        </p>
    </Layout>
);

export default AboutPage;

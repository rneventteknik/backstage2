/// <reference types="cypress" />

context('Login', () => {
    it('Login witout any credentials', () => {
        cy.request({ method: 'POST', url: '/api/users/login', failOnStatusCode: false }).should((response) => {
            expect(response.status).to.eq(403);
            expect(response.body.message).to.eq('Missing login');
        });
    });

    it('Login with invalid credentials', () => {
        cy.request({
            method: 'POST',
            url: '/api/users/login',
            failOnStatusCode: false,
            body: {
                username: 'albert',
                password: 'Something wrong',
            },
        }).should((response) => {
            expect(response.status).to.eq(403);
            expect(response.body.message).to.eq('Invalid login');
        });
    });

    it('Login with correct credentials', () => {
        cy.request({
            method: 'POST',
            url: '/api/users/login',
            body: {
                username: 'albert',
                password: 'dmx',
            },
        });
        cy.getCookie('backstage2').should('exist');
    });
});

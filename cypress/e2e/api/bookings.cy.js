/// <reference types="cypress" />

context('Bookings with user', () => {
    const username = 'albert';
    const password = 'dmx';

    beforeEach(function () {
        cy.login(username, password);
    });

    it('List all bookings', () => {
        cy.request({ url: '/api/bookings' }).should((response) => {
            expect(response.body.length).to.eq(8);
        });
    });
});

context('Bookings without user', () => {
    it('List all bookings', () => {
        cy.request({ url: '/api/bookings', failOnStatusCode: false }).should((response) => {
            expect(response.status).to.eq(403);
            expect(response.body.message).to.eq('Access Denied');
        });
    });
});

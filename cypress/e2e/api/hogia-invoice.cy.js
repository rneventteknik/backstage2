/// <reference types="cypress" />

context('Hogia invoice with user', () => {
    const username = 'albert';
    const password = 'dmx';

    beforeEach(function () {
        cy.login(username, password);
    });

    it('Get bookingid 6 in hogia invoice format', () => {
        cy.fixture('../fixtures/hogia-invoice-bookingid-6.txt').then((userFixture) => {
            cy.request({ url: '/api/documents/invoice/hogia/sv/6' }).should((response) => {
                expect(response.body, 'the same data').to.deep.equal(userFixture);
            });
        });
    });
});

context('Hogia invoice without user', () => {
    it('Get bookingid 6 in hogia invoice format', () => {
        cy.request({ url: '/api/documents/invoice/hogia/sv/6', failOnStatusCode: false }).should((response) => {
            expect(response.status).to.eq(403);
            expect(response.body.message).to.eq('Access Denied');
        });
    });
});

export {};

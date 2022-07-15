/// <reference types="cypress" />

Cypress.Commands.add('login', (username, password) => {
    return cy.request({
        method: 'POST',
        url: '/api/users/login',
        body: {
            username,
            password,
        },
    });
});

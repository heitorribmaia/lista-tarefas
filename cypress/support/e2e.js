// Suporte global do Cypress.
// Antes de cada teste, zera o estado da API para garantir isolamento.
beforeEach(() => {
  cy.request('POST', '/api/_reset');
});

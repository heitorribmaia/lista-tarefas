/// <reference types="cypress" />

// Testes do FRONTEND: interagem com a interface no navegador.
describe('Frontend - Interface da Lista de Tarefas', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('carrega a página com os elementos principais', () => {
    cy.contains('h1', 'Minhas Tarefas').should('be.visible');
    cy.get('[data-cy=campo-titulo]').should('be.visible');
    cy.get('[data-cy=btn-adicionar]').should('be.visible');
    cy.get('[data-cy=lista-vazia]').should('be.visible');
  });

  it('mostra estado vazio quando não há tarefas', () => {
    cy.get('[data-cy=lista-vazia]').should('be.visible');
    cy.get('[data-cy=contador]').should('contain', '0 tarefa');
  });

  it('adiciona uma nova tarefa pela interface', () => {
    cy.get('[data-cy=campo-titulo]').type('Comprar pão');
    cy.get('[data-cy=btn-adicionar]').click();

    cy.get('[data-cy=item-tarefa]').should('have.length', 1);
    cy.get('[data-cy=titulo-tarefa]').should('contain', 'Comprar pão');
    cy.get('[data-cy=lista-vazia]').should('not.be.visible');
    cy.get('[data-cy=contador]').should('contain', '1 tarefa');
  });

  it('adiciona tarefa pressionando Enter', () => {
    cy.get('[data-cy=campo-titulo]').type('Tarefa via Enter{enter}');
    cy.get('[data-cy=item-tarefa]').should('have.length', 1);
    cy.get('[data-cy=campo-titulo]').should('have.value', '');
  });

  it('exibe erro ao tentar adicionar tarefa vazia', () => {
    cy.get('[data-cy=btn-adicionar]').click();
    cy.get('[data-cy=mensagem-erro]').should('be.visible');
    cy.get('[data-cy=item-tarefa]').should('not.exist');
  });

  it('marca uma tarefa como concluída', () => {
    cy.get('[data-cy=campo-titulo]').type('Lavar o carro');
    cy.get('[data-cy=btn-adicionar]').click();

    cy.get('[data-cy=check-tarefa]').check();
    cy.get('[data-cy=item-tarefa]').should('have.class', 'concluida');
  });

  it('desmarca uma tarefa concluída', () => {
    cy.get('[data-cy=campo-titulo]').type('Estudar Cypress');
    cy.get('[data-cy=btn-adicionar]').click();

    cy.get('[data-cy=check-tarefa]').check();
    cy.get('[data-cy=item-tarefa]').should('have.class', 'concluida');
    cy.get('[data-cy=check-tarefa]').uncheck();
    cy.get('[data-cy=item-tarefa]').should('not.have.class', 'concluida');
  });

  it('remove uma tarefa pela interface', () => {
    cy.get('[data-cy=campo-titulo]').type('Tarefa temporária');
    cy.get('[data-cy=btn-adicionar]').click();
    cy.get('[data-cy=item-tarefa]').should('have.length', 1);

    cy.get('[data-cy=btn-remover]').click();
    cy.get('[data-cy=item-tarefa]').should('not.exist');
    cy.get('[data-cy=lista-vazia]').should('be.visible');
  });

  it('adiciona várias tarefas e atualiza o contador', () => {
    const tarefas = ['Tarefa 1', 'Tarefa 2', 'Tarefa 3'];
    tarefas.forEach((t) => {
      cy.get('[data-cy=campo-titulo]').type(t);
      cy.get('[data-cy=btn-adicionar]').click();
    });
    cy.get('[data-cy=item-tarefa]').should('have.length', 3);
    cy.get('[data-cy=contador]').should('contain', '3 tarefa');
  });

  it('não executa HTML/JS injetado no título (proteção contra XSS)', () => {
    const malicioso = '<img src=x onerror=alert(1)>';
    cy.get('[data-cy=campo-titulo]').type(malicioso);
    cy.get('[data-cy=btn-adicionar]').click();
    // O texto deve aparecer literalmente, sem criar elementos HTML.
    cy.get('[data-cy=titulo-tarefa]').should('have.text', malicioso);
    cy.get('[data-cy=titulo-tarefa] img').should('not.exist');
  });
});

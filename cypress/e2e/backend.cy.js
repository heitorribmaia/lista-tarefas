/// <reference types="cypress" />

// Testes do BACKEND: validam diretamente os endpoints da API via cy.request.
describe('Backend - API de Tarefas', () => {
  const API = '/api/tarefas';

  it('lista vazia ao iniciar', () => {
    cy.request('GET', API).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array').that.is.empty;
    });
  });

  it('cria uma tarefa com sucesso', () => {
    cy.request('POST', API, { titulo: 'Estudar para a prova' }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.include({ titulo: 'Estudar para a prova', concluida: false });
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('criadaEm');
    });
  });

  it('rejeita criação com título vazio (400)', () => {
    cy.request({
      method: 'POST',
      url: API,
      body: { titulo: '   ' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body).to.have.property('erro');
    });
  });

  it('rejeita criação sem título (400)', () => {
    cy.request({
      method: 'POST',
      url: API,
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('rejeita título acima de 120 caracteres (400)', () => {
    cy.request({
      method: 'POST',
      url: API,
      body: { titulo: 'a'.repeat(121) },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('atualiza o status de conclusão (PUT)', () => {
    cy.request('POST', API, { titulo: 'Tarefa a concluir' }).then((criada) => {
      const id = criada.body.id;
      cy.request('PUT', `${API}/${id}`, { concluida: true }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.concluida).to.eq(true);
      });
    });
  });

  it('atualiza o título (PUT)', () => {
    cy.request('POST', API, { titulo: 'Título antigo' }).then((criada) => {
      const id = criada.body.id;
      cy.request('PUT', `${API}/${id}`, { titulo: 'Título novo' }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.titulo).to.eq('Título novo');
      });
    });
  });

  it('retorna 404 ao atualizar tarefa inexistente', () => {
    cy.request({
      method: 'PUT',
      url: `${API}/999999`,
      body: { concluida: true },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it('remove uma tarefa (DELETE)', () => {
    cy.request('POST', API, { titulo: 'Tarefa a remover' }).then((criada) => {
      const id = criada.body.id;
      cy.request('DELETE', `${API}/${id}`).then((res) => {
        expect(res.status).to.eq(204);
      });
      cy.request('GET', API).then((res) => {
        expect(res.body).to.be.an('array').that.is.empty;
      });
    });
  });

  it('retorna 404 ao remover tarefa inexistente', () => {
    cy.request({
      method: 'DELETE',
      url: `${API}/999999`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it('retorna 404 para endpoint de API inexistente', () => {
    cy.request({
      method: 'GET',
      url: '/api/nao-existe',
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });
});

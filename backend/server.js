'use strict';

const { criarApp } = require('./app');

const PORTA = process.env.PORT || 3000;
const app = criarApp();

const servidor = app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});

// Encerramento gracioso
process.on('SIGTERM', () => servidor.close());
process.on('SIGINT', () => servidor.close());

module.exports = servidor;

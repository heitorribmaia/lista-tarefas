'use strict';

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

/**
 * Cria e configura a aplicação Express.
 *
 * O app é exportado separado do servidor (server.js) para que os testes
 * possam importá-lo sem precisar abrir uma porta de rede.
 */
function criarApp() {
  const app = express();

  // ----------------------------------------------------------------------
  // SEGURANÇA
  // ----------------------------------------------------------------------

  // Headers de segurança (XSS, clickjacking, sniffing de MIME, etc.).
  // Define também uma Content-Security-Policy restritiva para o frontend.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'same-origin' },
    })
  );

  // CORS controlado por variável de ambiente. Em produção, defina ORIGENS_PERMITIDAS.
  // Sem a variável, libera apenas mesma origem (comportamento seguro por padrão).
  const origensPermitidas = (process.env.ORIGENS_PERMITIDAS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: origensPermitidas.length > 0 ? origensPermitidas : false,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
  );

  // Limita o tamanho do corpo da requisição para evitar payloads abusivos.
  app.use(express.json({ limit: '10kb' }));

  // Rate limiting: protege a API contra abuso e ataques de força bruta.
  const limitador = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 300, // máximo de requisições por IP na janela
    standardHeaders: true,
    legacyHeaders: false,
    message: { erro: 'Muitas requisições. Tente novamente mais tarde.' },
  });
  app.use('/api', limitador);

  // ----------------------------------------------------------------------
  // ARMAZENAMENTO EM MEMÓRIA
  // ----------------------------------------------------------------------
  // Para fins acadêmicos os dados ficam em memória (resetam ao reiniciar).
  // A camada de rotas não muda caso troque por um banco de dados real.
  let tarefas = [];
  let proximoId = 1;

  // Reset usado pelos testes para garantir isolamento entre cenários.
  app.post('/api/_reset', (_req, res) => {
    tarefas = [];
    proximoId = 1;
    res.status(204).end();
  });

  // ----------------------------------------------------------------------
  // VALIDAÇÃO / SANITIZAÇÃO
  // ----------------------------------------------------------------------
  function validarTitulo(valor) {
    if (typeof valor !== 'string') {
      return { ok: false, erro: 'O título deve ser um texto.' };
    }
    const titulo = valor.trim();
    if (titulo.length === 0) {
      return { ok: false, erro: 'O título não pode ser vazio.' };
    }
    if (titulo.length > 120) {
      return { ok: false, erro: 'O título deve ter no máximo 120 caracteres.' };
    }
    return { ok: true, valor: titulo };
  }

  // ----------------------------------------------------------------------
  // ROTAS DA API
  // ----------------------------------------------------------------------

  // Listar todas as tarefas
  app.get('/api/tarefas', (_req, res) => {
    res.json(tarefas);
  });

  // Criar uma nova tarefa
  app.post('/api/tarefas', (req, res) => {
    const { titulo } = req.body || {};
    const resultado = validarTitulo(titulo);
    if (!resultado.ok) {
      return res.status(400).json({ erro: resultado.erro });
    }

    const tarefa = {
      id: proximoId++,
      titulo: resultado.valor,
      concluida: false,
      criadaEm: new Date().toISOString(),
    };
    tarefas.push(tarefa);
    res.status(201).json(tarefa);
  });

  // Atualizar uma tarefa (título e/ou status de conclusão)
  app.put('/api/tarefas/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const tarefa = tarefas.find((t) => t.id === id);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    const { titulo, concluida } = req.body || {};

    if (titulo !== undefined) {
      const resultado = validarTitulo(titulo);
      if (!resultado.ok) {
        return res.status(400).json({ erro: resultado.erro });
      }
      tarefa.titulo = resultado.valor;
    }

    if (concluida !== undefined) {
      if (typeof concluida !== 'boolean') {
        return res.status(400).json({ erro: 'O campo "concluida" deve ser booleano.' });
      }
      tarefa.concluida = concluida;
    }

    res.json(tarefa);
  });

  // Remover uma tarefa
  app.delete('/api/tarefas/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const indice = tarefas.findIndex((t) => t.id === id);
    if (indice === -1) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    tarefas.splice(indice, 1);
    res.status(204).end();
  });

  // ----------------------------------------------------------------------
  // FRONTEND ESTÁTICO
  // ----------------------------------------------------------------------
  const pastaFrontend = path.join(__dirname, '..', 'frontend');
  app.use(express.static(pastaFrontend));

  // ----------------------------------------------------------------------
  // TRATAMENTO DE ERROS
  // ----------------------------------------------------------------------

  // 404 para rotas de API inexistentes
  app.use('/api', (_req, res) => {
    res.status(404).json({ erro: 'Endpoint não encontrado.' });
  });

  // Handler de erros: não vaza stack trace para o cliente
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err && err.type === 'entity.parse.failed') {
      return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
    }
    console.error('Erro interno:', err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  });

  return app;
}

module.exports = { criarApp };

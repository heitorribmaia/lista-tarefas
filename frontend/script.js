'use strict';

(function () { 
  const API = '/api/tarefas';

  const campoTitulo = document.getElementById('campo-titulo');
  const btnAdicionar = document.getElementById('btn-adicionar');
  const lista = document.getElementById('lista-tarefas');
  const listaVazia = document.getElementById('lista-vazia');
  const mensagemErro = document.getElementById('mensagem-erro');
  const contador = document.getElementById('contador');

  function mostrarErro(texto) {
    mensagemErro.textContent = texto;
    mensagemErro.hidden = false;
  }

  function limparErro() {
    mensagemErro.textContent = '';
    mensagemErro.hidden = true;
  }

  async function requisitar(url, opcoes) {
    const resposta = await fetch(url, opcoes);
    if (!resposta.ok) {
      let mensagem = 'Ocorreu um erro.';
      try {
        const corpo = await resposta.json();
        if (corpo && corpo.erro) mensagem = corpo.erro;
      } catch (_) {
        /* resposta sem corpo JSON */
      }
      throw new Error(mensagem);
    }
    if (resposta.status === 204) return null;
    return resposta.json();
  }

  function atualizarContador(qtd) {
    contador.textContent = `${qtd} tarefa(s)`;
  }

  // Cria um item da lista usando textContent (nunca innerHTML) para evitar XSS.
  function criarElementoTarefa(tarefa) {
    const li = document.createElement('li');
    li.className = 'item' + (tarefa.concluida ? ' concluida' : '');
    li.dataset.id = String(tarefa.id);
    li.setAttribute('data-cy', 'item-tarefa');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = tarefa.concluida;
    checkbox.setAttribute('data-cy', 'check-tarefa');
    checkbox.addEventListener('change', () =>
      alternarConclusao(tarefa.id, checkbox.checked)
    );

    const span = document.createElement('span');
    span.className = 'titulo';
    span.setAttribute('data-cy', 'titulo-tarefa');
    span.textContent = tarefa.titulo; // seguro contra HTML/JS injetado

    const botaoRemover = document.createElement('button');
    botaoRemover.type = 'button';
    botaoRemover.className = 'btn-remover';
    botaoRemover.textContent = 'Remover';
    botaoRemover.setAttribute('data-cy', 'btn-remover');
    botaoRemover.addEventListener('click', () => removerTarefa(tarefa.id));

    li.append(checkbox, span, botaoRemover);
    return li;
  }

  function renderizar(tarefas) {
    lista.innerHTML = '';
    if (tarefas.length === 0) {
      listaVazia.hidden = false;
    } else {
      listaVazia.hidden = true;
      tarefas.forEach((t) => lista.appendChild(criarElementoTarefa(t)));
    }
    atualizarContador(tarefas.length);
  }

  async function carregarTarefas() {
    try {
      const tarefas = await requisitar(API);
      renderizar(tarefas);
    } catch (e) {
      mostrarErro(e.message);
    }
  }

  async function adicionarTarefa() {
    limparErro();
    const titulo = campoTitulo.value.trim();
    if (titulo.length === 0) {
      mostrarErro('Digite um título para a tarefa.');
      return;
    }
    try {
      await requisitar(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo }),
      });
      campoTitulo.value = '';
      await carregarTarefas();
    } catch (e) {
      mostrarErro(e.message);
    }
  }

  async function alternarConclusao(id, concluida) {
    limparErro();
    try {
      await requisitar(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concluida }),
      });
      await carregarTarefas();
    } catch (e) {
      mostrarErro(e.message);
    }
  }

  async function removerTarefa(id) {
    limparErro();
    try {
      await requisitar(`${API}/${id}`, { method: 'DELETE' });
      await carregarTarefas();
    } catch (e) {
      mostrarErro(e.message);
    }
  }

  btnAdicionar.addEventListener('click', adicionarTarefa);
  campoTitulo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') adicionarTarefa();
  });

  carregarTarefas();
})();

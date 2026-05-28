#!/usr/bin/env bash
#
# Script auxiliar para publicar o projeto no GitHub e convidar o avaliador.
#
# Requisito: GitHub CLI (gh) instalado e autenticado.
#   - Instalar: https://cli.github.com/
#   - Autenticar: gh auth login
#
# Uso:
#   chmod +x setup-github.sh
#   ./setup-github.sh
#
set -euo pipefail

NOME_REPO="lista-tarefas"
AVALIADOR="regis.simao"   # usuário/handle do avaliador (ajuste se necessário)
EMAIL_AVALIADOR="regis.simao@unifor.br"

echo "==> Inicializando repositório git local..."
git init -b main
git add .
git commit -m "Aplicação web com Express, testes Cypress e CI (GitHub Actions)"

echo "==> Criando o repositório no GitHub e enviando o código..."
# Cria o repositório (privado) na sua conta e faz o push.
gh repo create "$NOME_REPO" --private --source=. --remote=origin --push

echo "==> Convidando o avaliador como colaborador..."
# O convite por e-mail/usuário é feito pela API de colaboradores.
# Se o handle do usuário for diferente, o GitHub tentará resolver pelo e-mail.
gh api -X PUT "repos/{owner}/$NOME_REPO/collaborators/$AVALIADOR" \
  -f permission=push \
  || echo "Se falhar, convide manualmente em Settings > Collaborators usando $EMAIL_AVALIADOR"

echo ""
echo "==> Pronto! Verifique:"
echo "    - Repositório criado na sua conta GitHub."
echo "    - Convite enviado ao avaliador ($EMAIL_AVALIADOR)."
echo "    - Aba 'Actions' do repositório: os 2 workflows rodam no push."

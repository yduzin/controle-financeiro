# Meu Controle Financeiro

Aplicativo web para registrar receitas e despesas, acompanhar o saldo e consultar movimentações por mês e tipo.

## Funcionalidades

- Cadastro de receitas e despesas com descrição, valor, categoria e data
- Resumo de receitas, despesas e saldo
- Filtros por mês e por tipo de movimentação
- Remoção de lançamentos
- Salvamento dos dados no navegador com `localStorage`
- Interface adaptada para celular e preparada para instalação como PWA
- Cache da interface para uso offline após a primeira visita

## Como executar localmente

Abra `index.html` no navegador. Para testar instalação e funcionamento offline, use um servidor local, como a extensão Live Server do Visual Studio Code. Service workers e instalação PWA exigem HTTPS ou `localhost`.

## Armazenamento dos dados

Os lançamentos ficam no `localStorage` do navegador e aparelho em que foram cadastrados. Eles não são sincronizados automaticamente com outros aparelhos nem com uma conta.

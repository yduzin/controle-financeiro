const CHAVE_STORAGE = "meu-controle-financeiro-v1";

let movimentacoes = carregarMovimentacoes();

const formulario = document.querySelector("#formulario");
const campoDescricao = document.querySelector("#descricao");
const campoValor = document.querySelector("#valor");
const campoTipo = document.querySelector("#tipo");
const campoCategoria = document.querySelector("#categoria");
const campoData = document.querySelector("#data");
const filtroTipo = document.querySelector("#filtro-tipo");
const filtroMes = document.querySelector("#filtro-mes");
const lista = document.querySelector("#lista-movimentacoes");
const mensagemVazia = document.querySelector("#mensagem-vazia");

campoData.value = dataLocalHoje();
filtroMes.value = dataLocalHoje().slice(0, 7);

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const novaMovimentacao = {
        id: criarId(),
        descricao: campoDescricao.value.trim(),
        valor: Number(campoValor.value),
        tipo: campoTipo.value,
        categoria: campoCategoria.value,
        data: campoData.value,
    };

    if (!novaMovimentacao.descricao || novaMovimentacao.valor <= 0 || !novaMovimentacao.data) {
        return;
    }

    movimentacoes.push(novaMovimentacao);
    salvarMovimentacoes();
    atualizarTela();

    formulario.reset();
    campoData.value = dataLocalHoje();
    campoDescricao.focus();
});

filtroTipo.addEventListener("change", renderizarLista);
filtroMes.addEventListener("change", atualizarTela);

lista.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-remover]");
    if (!botao) return;

    movimentacoes = movimentacoes.filter((item) => item.id !== botao.dataset.remover);
    salvarMovimentacoes();
    atualizarTela();
});

function carregarMovimentacoes() {
    try {
        const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);
        return dadosSalvos ? JSON.parse(dadosSalvos) : [];
    } catch (erro) {
        console.error("Não foi possível carregar os lançamentos:", erro);
        return [];
    }
}

function salvarMovimentacoes() {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(movimentacoes));
}

function atualizarTela() {
    atualizarResumo();
    renderizarLista();
}

function atualizarResumo() {
    const movimentacoesDoMes = obterMovimentacoesDoMes();
    const receitas = movimentacoesDoMes
        .filter((item) => item.tipo === "receita")
        .reduce((soma, item) => soma + item.valor, 0);
    const despesas = movimentacoesDoMes
        .filter((item) => item.tipo === "despesa")
        .reduce((soma, item) => soma + item.valor, 0);

    document.querySelector("#total-receitas").textContent = formatarMoeda(receitas);
    document.querySelector("#total-despesas").textContent = formatarMoeda(despesas);
    document.querySelector("#saldo").textContent = formatarMoeda(receitas - despesas);
}

function renderizarLista() {
    const tipoEscolhido = filtroTipo.value;
    const itensVisiveis = obterMovimentacoesDoMes()
        .filter((item) => tipoEscolhido === "todas" || item.tipo === tipoEscolhido)
        .sort((a, b) => b.data.localeCompare(a.data));

    lista.replaceChildren();
    mensagemVazia.hidden = itensVisiveis.length > 0;

    itensVisiveis.forEach((item) => {
        const linha = document.createElement("li");
        linha.className = "movimentacao";

        const icone = document.createElement("span");
        icone.className = "icone-categoria";
        icone.setAttribute("aria-hidden", "true");
        icone.textContent = iconeDaCategoria(item.categoria);

        const detalhes = document.createElement("div");
        detalhes.className = "detalhes-movimentacao";

        const descricao = document.createElement("strong");
        descricao.textContent = item.descricao;
        const categoriaData = document.createElement("span");
        categoriaData.textContent = `${item.categoria} · ${formatarData(item.data)}`;
        detalhes.append(descricao, categoriaData);

        const valor = document.createElement("span");
        valor.className = `valor-movimentacao ${item.tipo}`;
        valor.textContent = `${item.tipo === "receita" ? "+" : "−"} ${formatarMoeda(item.valor)}`;

        const remover = document.createElement("button");
        remover.className = "botao-remover";
        remover.type = "button";
        remover.dataset.remover = item.id;
        remover.setAttribute("aria-label", `Remover ${item.descricao}`);
        remover.title = "Remover lançamento";
        remover.textContent = "×";

        linha.append(icone, detalhes, valor, remover);
        lista.append(linha);
    });
}

function obterMovimentacoesDoMes() {
    const mesEscolhido = filtroMes.value;
    if (!mesEscolhido) return movimentacoes;
    return movimentacoes.filter((item) => item.data.slice(0, 7) === mesEscolhido);
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function formatarData(data) {
    const [ano, mes, dia] = data.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR").format(new Date(ano, mes - 1, dia));
}

function dataLocalHoje() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function criarId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function iconeDaCategoria(categoria) {
    const icones = {
        Alimentação: "🍽️",
        Moradia: "🏠",
        Transporte: "🚌",
        Lazer: "🎉",
        Saúde: "💊",
        Salário: "💼",
        Outros: "📌",
    };
    return icones[categoria] || "📌";
}

atualizarTela();

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js").catch((erro) => {
            console.error("Não foi possível preparar o modo offline:", erro);
        });
    });
}

let promptInstalacao;
const botaoInstalar = document.querySelector("#instalar-app");

window.addEventListener("beforeinstallprompt", (evento) => {
    evento.preventDefault();
    promptInstalacao = evento;
    botaoInstalar.hidden = false;
});

botaoInstalar.addEventListener("click", async () => {
    if (!promptInstalacao) return;
    promptInstalacao.prompt();
    await promptInstalacao.userChoice;
    promptInstalacao = null;
    botaoInstalar.hidden = true;
});

window.addEventListener("appinstalled", () => {
    botaoInstalar.hidden = true;
    promptInstalacao = null;
});

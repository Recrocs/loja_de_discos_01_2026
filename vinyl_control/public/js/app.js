const pagina = document.body.dataset.page;

async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(url, {
    ...opcoes,
    headers: { "Content-Type": "application/json", ...(opcoes.headers || {}) }
  });
  const dados = await resposta.json().catch(() => ({}));
  if (resposta.status === 401) {
    window.location.href = "/";
    throw new Error("Sessão encerrada.");
  }
  if (!resposta.ok) throw new Error(dados.erro || "Ocorreu um erro.");
  return dados;
}

function mostrarMensagem(elemento, texto, erro = false) {
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.classList.toggle("erro", erro);
}

function moeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dataBR(valor) {
  if (!valor) return "—";
  return new Date(valor).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

async function iniciar() {
  try {
    const sessao = await requisicao("/api/sessao");
    if (!sessao.usuario) {
      if (pagina !== "login") window.location.href = "/";
      return;
    }
    document.querySelectorAll("#nome-usuario").forEach((el) => el.textContent = sessao.usuario.nome);
    const sair = document.getElementById("btn-sair");
    if (sair) sair.addEventListener("click", async () => {
      try { await requisicao("/api/logout", { method: "POST" }); } catch (erro) {}
      window.location.href = "/";
    });

    if (pagina === "home") await carregarResumo();
    if (pagina === "discos") configurarDiscos();
    if (pagina === "estoque") configurarEstoque();
  } catch (erro) {
    if (pagina !== "login") window.location.href = "/";
  }
}

async function carregarResumo() {
  try {
    const resumo = await requisicao("/api/resumo");
    document.getElementById("total-discos").textContent = resumo.totalDiscos;
    document.getElementById("total-unidades").textContent = resumo.totalUnidades;
    document.getElementById("total-movimentacoes").textContent = resumo.totalMovimentacoes;
    document.getElementById("discos-zerados").textContent = resumo.discosZerados;
  } catch (erro) { console.error(erro); }
}

function configurarDiscos() {
  const lista = document.getElementById("lista-discos");
  const mensagem = document.getElementById("mensagem");
  const areaFormulario = document.getElementById("area-formulario");
  const form = document.getElementById("form-disco");
  const campos = ["titulo", "artista", "genero", "preco_custo", "preco_venda", "quantidade_estoque", "estoque_minimo"];

  async function carregarDiscos(busca = "") {
    try {
      const discos = await requisicao("/api/discos?busca=" + encodeURIComponent(busca));
      lista.innerHTML = "";
      if (!discos.length) {
        lista.innerHTML = '<tr><td colspan="6">Nenhum disco encontrado.</td></tr>';
        return;
      }
      discos.forEach((disco) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
          <td>${escapar(disco.titulo)}</td><td>${escapar(disco.artista)}</td>
          <td>${escapar(disco.genero)}</td><td>${moeda(disco.preco_venda)}</td>
          <td>${disco.quantidade_estoque}</td>
          <td><button class="btn btn-light btn-small" data-editar="${disco.id_disco}">Editar</button>
          <button class="btn btn-danger btn-small" data-excluir="${disco.id_disco}">Excluir</button></td>`;
        lista.appendChild(linha);
      });
    } catch (erro) { mostrarMensagem(mensagem, erro.message, true); }
  }

  function novoDisco() {
    form.reset();
    document.getElementById("id_disco").value = "";
    document.getElementById("titulo-formulario").textContent = "Novo disco";
    areaFormulario.classList.remove("hidden");
    areaFormulario.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.getElementById("btn-novo").addEventListener("click", novoDisco);
  document.getElementById("btn-cancelar").addEventListener("click", () => areaFormulario.classList.add("hidden"));
  document.getElementById("btn-buscar").addEventListener("click", () => carregarDiscos(document.getElementById("busca").value));
  document.getElementById("busca").addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") { evento.preventDefault(); carregarDiscos(evento.target.value); }
  });
  document.getElementById("btn-limpar").addEventListener("click", () => {
    document.getElementById("busca").value = "";
    carregarDiscos();
  });

  lista.addEventListener("click", async (evento) => {
    const botaoEditar = evento.target.closest("[data-editar]");
    const botaoExcluir = evento.target.closest("[data-excluir]");
    if (botaoEditar) {
      try {
        const discos = await requisicao("/api/discos");
        const disco = discos.find((item) => item.id_disco === Number(botaoEditar.dataset.editar));
        if (!disco) return;
        document.getElementById("id_disco").value = disco.id_disco;
        campos.forEach((campo) => document.getElementById(campo).value = disco[campo]);
        document.getElementById("titulo-formulario").textContent = "Editar disco";
        areaFormulario.classList.remove("hidden");
        areaFormulario.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (erro) { mostrarMensagem(mensagem, erro.message, true); }
    }
    if (botaoExcluir) {
      if (!confirm("Deseja realmente excluir este disco?")) return;
      try {
        const resultado = await requisicao("/api/discos/" + botaoExcluir.dataset.excluir, { method: "DELETE" });
        mostrarMensagem(mensagem, resultado.mensagem);
        carregarDiscos(document.getElementById("busca").value);
      } catch (erro) { mostrarMensagem(mensagem, erro.message, true); }
    }
  });

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (!form.reportValidity()) return;
    const id = document.getElementById("id_disco").value;
    const dados = {};
    campos.forEach((campo) => dados[campo] = document.getElementById(campo).value);
    dados.quantidade_estoque = Number(dados.quantidade_estoque);
    dados.estoque_minimo = Number(dados.estoque_minimo);
    dados.preco_custo = Number(dados.preco_custo);
    dados.preco_venda = Number(dados.preco_venda);
    try {
      const resultado = await requisicao(id ? "/api/discos/" + id : "/api/discos", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(dados)
      });
      mostrarMensagem(mensagem, resultado.mensagem);
      areaFormulario.classList.add("hidden");
      form.reset();
      carregarDiscos(document.getElementById("busca").value);
    } catch (erro) { mostrarMensagem(mensagem, erro.message, true); }
  });

  carregarDiscos();
}

function configurarEstoque() {
  const selectDisco = document.getElementById("id_disco");
  const listaEstoque = document.getElementById("lista-estoque");
  const listaMovimentacoes = document.getElementById("lista-movimentacoes");
  const form = document.getElementById("form-movimentacao");
  const mensagem = document.getElementById("mensagem-movimentacao");
  document.getElementById("data_movimentacao").value = new Date().toLocaleDateString("en-CA");

  async function carregarDiscos() {
    const discos = await requisicao("/api/discos");
    selectDisco.innerHTML = '<option value="">Selecione um disco</option>';
    discos.forEach((disco) => {
      const opcao = document.createElement("option");
      opcao.value = disco.id_disco;
      opcao.textContent = `${disco.titulo} — ${disco.artista} (estoque: ${disco.quantidade_estoque})`;
      selectDisco.appendChild(opcao);
    });
    listaEstoque.innerHTML = "";
    if (!discos.length) listaEstoque.innerHTML = '<tr><td colspan="5">Nenhum disco cadastrado.</td></tr>';
    discos.forEach((disco) => {
      let situacao = '<span class="badge badge-ok">Estoque adequado</span>';
      if (disco.quantidade_estoque === 0) situacao = '<span class="badge badge-baixo">Sem estoque</span>';
      else if (disco.quantidade_estoque < disco.estoque_minimo) situacao = '<span class="badge badge-alerta">Abaixo do mínimo</span>';
      else if (disco.quantidade_estoque === disco.estoque_minimo) situacao = '<span class="badge badge-alerta">No limite mínimo</span>';
      const linha = document.createElement("tr");
      linha.innerHTML = `<td>${escapar(disco.titulo)}</td><td>${escapar(disco.artista)}</td><td>${disco.quantidade_estoque}</td><td>${disco.estoque_minimo}</td><td>${situacao}</td>`;
      listaEstoque.appendChild(linha);
    });
  }

  async function carregarMovimentacoes() {
    const movimentacoes = await requisicao("/api/movimentacoes");
    listaMovimentacoes.innerHTML = "";
    if (!movimentacoes.length) {
      listaMovimentacoes.innerHTML = '<tr><td colspan="6">Nenhuma movimentação registrada.</td></tr>';
      return;
    }
    movimentacoes.forEach((mov) => {
      const tipo = mov.tipo_movimentacao === "entrada" ? "Entrada / reposição" : "Saída / venda";
      const linha = document.createElement("tr");
      linha.innerHTML = `<td>${dataBR(mov.data_movimentacao)}</td><td>${escapar(mov.disco.titulo)}</td><td>${tipo}</td><td>${mov.quantidade}</td><td>${escapar(mov.usuario.nome)}</td><td>${escapar(mov.observacao || "—")}</td>`;
      listaMovimentacoes.appendChild(linha);
    });
  }

  async function atualizar() {
    try { await carregarDiscos(); await carregarMovimentacoes(); }
    catch (erro) { mostrarMensagem(mensagem, erro.message, true); }
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (!form.reportValidity()) return;
    const dados = {
      id_disco: Number(selectDisco.value),
      tipo_movimentacao: document.getElementById("tipo_movimentacao").value,
      quantidade: Number(document.getElementById("quantidade").value),
      data_movimentacao: document.getElementById("data_movimentacao").value,
      observacao: document.getElementById("observacao").value
    };
    try {
      const resultado = await requisicao("/api/movimentacoes", { method: "POST", body: JSON.stringify(dados) });
      mostrarMensagem(mensagem, resultado.alertaEstoque ? resultado.mensagem + " " + resultado.alertaEstoque : resultado.mensagem);
      if (resultado.alertaEstoque) alert(resultado.alertaEstoque);
      form.reset();
      document.getElementById("data_movimentacao").value = new Date().toLocaleDateString("en-CA");
      await atualizar();
    } catch (erro) { mostrarMensagem(mensagem, erro.message, true); }
  });

  document.getElementById("btn-atualizar").addEventListener("click", atualizar);
  atualizar();
}

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[caractere]));
}

iniciar();
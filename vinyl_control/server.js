require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const path = require("path");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"), { index: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || "chave-local-vinyl-control",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 4 }
}));

function exigirLogin(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: "Sua sessão expirou. Entre novamente." });
  }
  next();
}

function validarDisco(dados) {
  const titulo = String(dados.titulo || "").trim();
  const artista = String(dados.artista || "").trim();
  const genero = String(dados.genero || "").trim();
  const custo = Number(dados.preco_custo);
  const venda = Number(dados.preco_venda);
  const estoque = Number(dados.quantidade_estoque);
  const minimo = Number(dados.estoque_minimo);

  if (!titulo || !artista || !genero) return "Preencha título, artista e gênero.";
  if (titulo.length > 150 || artista.length > 100 || genero.length > 50) return "Um dos textos ultrapassou o limite permitido.";
  if (!Number.isFinite(custo) || custo < 0 || !Number.isFinite(venda) || venda < 0) return "Os preços devem ser números iguais ou maiores que zero.";
  if (!Number.isInteger(estoque) || estoque < 0 || !Number.isInteger(minimo) || minimo < 0) return "Estoque e estoque mínimo devem ser números inteiros iguais ou maiores que zero.";
  return null;
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/api/sessao", (req, res) => {
  res.json({ usuario: req.session.usuario || null });
});

app.post("/api/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "");
    if (!email || !senha) return res.status(400).json({ erro: "Informe o e-mail e a senha." });

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(401).json({ erro: "E-mail não cadastrado." });

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ erro: "Senha incorreta." });

    req.session.regenerate((erro) => {
      if (erro) return res.status(500).json({ erro: "Não foi possível iniciar a sessão." });
      req.session.usuario = { id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email };
      res.json({ mensagem: "Login realizado com sucesso.", usuario: req.session.usuario });
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao realizar login. Verifique o servidor e o banco de dados." });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((erro) => {
    if (erro) return res.status(500).json({ erro: "Não foi possível encerrar a sessão." });
    res.clearCookie("connect.sid");
    res.json({ mensagem: "Você saiu do sistema." });
  });
});

app.get("/api/discos", exigirLogin, async (req, res) => {
  try {
    const busca = String(req.query.busca || "").trim();
    const discos = await prisma.disco.findMany({
      where: busca ? {
        OR: [
          { titulo: { contains: busca } },
          { artista: { contains: busca } },
          { genero: { contains: busca } }
        ]
      } : undefined,
      orderBy: { titulo: "asc" }
    });
    res.json(discos);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Não foi possível carregar os discos." });
  }
});

app.post("/api/discos", exigirLogin, async (req, res) => {
  const erroValidacao = validarDisco(req.body);
  if (erroValidacao) return res.status(400).json({ erro: erroValidacao });

  try {
    const disco = await prisma.disco.create({
      data: {
        titulo: req.body.titulo.trim(),
        artista: req.body.artista.trim(),
        genero: req.body.genero.trim(),
        preco_custo: Number(req.body.preco_custo),
        preco_venda: Number(req.body.preco_venda),
        quantidade_estoque: Number(req.body.quantidade_estoque),
        estoque_minimo: Number(req.body.estoque_minimo)
      }
    });
    res.status(201).json({ mensagem: "Disco cadastrado com sucesso.", disco });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Não foi possível cadastrar o disco." });
  }
});

app.put("/api/discos/:id", exigirLogin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "Código de disco inválido." });
  const erroValidacao = validarDisco(req.body);
  if (erroValidacao) return res.status(400).json({ erro: erroValidacao });

  try {
    const disco = await prisma.disco.update({
      where: { id_disco: id },
      data: {
        titulo: req.body.titulo.trim(),
        artista: req.body.artista.trim(),
        genero: req.body.genero.trim(),
        preco_custo: Number(req.body.preco_custo),
        preco_venda: Number(req.body.preco_venda),
        quantidade_estoque: Number(req.body.quantidade_estoque),
        estoque_minimo: Number(req.body.estoque_minimo)
      }
    });
    res.json({ mensagem: "Disco atualizado com sucesso.", disco });
  } catch (erro) {
    console.error(erro);
    res.status(404).json({ erro: "Disco não encontrado ou não foi possível atualizar." });
  }
});

app.delete("/api/discos/:id", exigirLogin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "Código de disco inválido." });
  try {
    await prisma.disco.delete({ where: { id_disco: id } });
    res.json({ mensagem: "Disco excluído com sucesso." });
  } catch (erro) {
    if (erro.code === "P2003" || erro.code === "P2014") {
      return res.status(409).json({ erro: "Este disco possui movimentações registradas e não pode ser excluído." });
    }
    res.status(404).json({ erro: "Disco não encontrado." });
  }
});

app.get("/api/movimentacoes", exigirLogin, async (req, res) => {
  try {
    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      include: { disco: true, usuario: { select: { nome: true } } },
      orderBy: [{ data_movimentacao: "desc" }, { id_movimentacao: "desc" }]
    });
    res.json(movimentacoes);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Não foi possível carregar as movimentações." });
  }
});

app.post("/api/movimentacoes", exigirLogin, async (req, res) => {
  const idDisco = Number(req.body.id_disco);
  const quantidade = Number(req.body.quantidade);
  const tipo = String(req.body.tipo_movimentacao || "");
  const dataTexto = String(req.body.data_movimentacao || "");
  const observacao = String(req.body.observacao || "").trim();

  if (!Number.isInteger(idDisco) || idDisco <= 0) return res.status(400).json({ erro: "Selecione um disco válido." });
  if (!Number.isInteger(quantidade) || quantidade <= 0) return res.status(400).json({ erro: "A quantidade deve ser um inteiro maior que zero." });
  if (!["entrada", "saida"].includes(tipo)) return res.status(400).json({ erro: "Selecione entrada/reposição ou saída/venda." });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataTexto) || Number.isNaN(Date.parse(dataTexto + "T00:00:00Z"))) {
    return res.status(400).json({ erro: "Informe uma data válida para a movimentação." });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const disco = await tx.disco.findUnique({ where: { id_disco: idDisco } });
      if (!disco) throw new Error("DISCO_NAO_ENCONTRADO");
      if (tipo === "saida" && disco.quantidade_estoque < quantidade) throw new Error("ESTOQUE_INSUFICIENTE");

      const novoEstoque = tipo === "entrada"
        ? disco.quantidade_estoque + quantidade
        : disco.quantidade_estoque - quantidade;

      await tx.disco.update({
        where: { id_disco: idDisco },
        data: { quantidade_estoque: novoEstoque }
      });

      const movimentacao = await tx.movimentacaoEstoque.create({
        data: {
          id_disco: idDisco,
          id_usuario: req.session.usuario.id_usuario,
          tipo_movimentacao: tipo,
          quantidade,
          data_movimentacao: new Date(dataTexto + "T00:00:00.000Z"),
          observacao: observacao || null
        }
      });
      return { movimentacao, novoEstoque, estoqueMinimo: disco.estoque_minimo };
    });

    const alerta = tipo === "saida" && resultado.novoEstoque < resultado.estoqueMinimo;
    res.status(201).json({
      mensagem: tipo === "entrada" ? "Reposição registrada com sucesso." : "Venda registrada com sucesso.",
      alertaEstoque: alerta ? `Atenção: estoque abaixo do mínimo! Quantidade atual: ${resultado.novoEstoque}. Mínimo configurado: ${resultado.estoqueMinimo}.` : null,
      novoEstoque: resultado.novoEstoque
    });
  } catch (erro) {
    if (erro.message === "ESTOQUE_INSUFICIENTE") return res.status(400).json({ erro: "Estoque insuficiente para realizar essa venda." });
    if (erro.message === "DISCO_NAO_ENCONTRADO") return res.status(404).json({ erro: "Disco não encontrado." });
    console.error(erro);
    res.status(500).json({ erro: "Não foi possível registrar a movimentação." });
  }
});

app.get("/api/resumo", exigirLogin, async (req, res) => {
  try {
    const [totalDiscos, totalUnidades, totalMovimentacoes, discosBaixos] = await Promise.all([
      prisma.disco.count(),
      prisma.disco.aggregate({ _sum: { quantidade_estoque: true } }),
      prisma.movimentacaoEstoque.count(),
      prisma.disco.count({ where: { quantidade_estoque: { lt: 1 } } })
    ]);
    res.json({
      totalDiscos,
      totalUnidades: totalUnidades._sum.quantidade_estoque || 0,
      totalMovimentacoes,
      discosZerados: discosBaixos
    });
  } catch (erro) {
    res.status(500).json({ erro: "Não foi possível carregar o resumo." });
  }
});

app.listen(PORT, () => {
  console.log(`Vinyl Control disponível em http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
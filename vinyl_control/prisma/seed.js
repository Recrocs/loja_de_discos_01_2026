const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const senha = await bcrypt.hash("Vinyl123!", 10);

  const usuarios = [
    { nome: "Administrador", email: "admin@vinyl.com", senha },
    { nome: "Ana Operadora", email: "ana@vinyl.com", senha },
    { nome: "Carlos Operador", email: "carlos@vinyl.com", senha }
  ];

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: { nome: usuario.nome, senha: usuario.senha },
      create: usuario
    });
  }

  const discos = [
    { titulo: "Abbey Road", artista: "The Beatles", genero: "Rock", preco_custo: "65.00", preco_venda: "110.00", quantidade_estoque: 12, estoque_minimo: 4 },
    { titulo: "Clube da Esquina", artista: "Milton Nascimento e Lô Borges", genero: "MPB", preco_custo: "55.00", preco_venda: "95.00", quantidade_estoque: 7, estoque_minimo: 3 },
    { titulo: "The Dark Side of the Moon", artista: "Pink Floyd", genero: "Rock Progressivo", preco_custo: "70.00", preco_venda: "125.00", quantidade_estoque: 2, estoque_minimo: 5 },
    { titulo: "Thriller", artista: "Michael Jackson", genero: "Pop", preco_custo: "60.00", preco_venda: "105.00", quantidade_estoque: 9, estoque_minimo: 3 },
    { titulo: "Transa", artista: "Caetano Veloso", genero: "MPB", preco_custo: "50.00", preco_venda: "90.00", quantidade_estoque: 6, estoque_minimo: 2 }
  ];

  for (const disco of discos) {
    const existente = await prisma.disco.findFirst({ where: { titulo: disco.titulo, artista: disco.artista } });
    if (!existente) await prisma.disco.create({ data: disco });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email: "admin@vinyl.com" } });
  const listaDiscos = await prisma.disco.findMany({ orderBy: { id_disco: "asc" } });

  if (await prisma.movimentacaoEstoque.count() === 0) {
    const hoje = new Date();
    const data = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
    for (let i = 0; i < 3; i++) {
      await prisma.movimentacaoEstoque.create({
        data: {
          id_disco: listaDiscos[i].id_disco,
          id_usuario: usuario.id_usuario,
          tipo_movimentacao: i === 1 ? "saida" : "entrada",
          quantidade: i + 1,
          data_movimentacao: data,
          observacao: "Movimentação de exemplo para testes"
        }
      });
    }
  }

  console.log("Banco populado. Login: admin@vinyl.com | Senha: Vinyl123!");
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
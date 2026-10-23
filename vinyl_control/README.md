# Vinyl Control

Sistema Web Full Stack para gestão do acervo, estoque e vendas de uma loja de discos de vinil. Projeto acadêmico do simulado SAEP — Técnico em Desenvolvimento de Sistemas.

## Tecnologias
- HTML, CSS e JavaScript
- Node.js e Express
- Prisma ORM 6
- MySQL
- Express Session e bcryptjs

## Funcionalidades
- Login com sessão e logout.
- Painel principal com resumo do catálogo.
- Cadastro, listagem, busca, edição e exclusão de discos.
- Movimentação de entrada/reposição e saída/venda.
- Histórico com data e usuário responsável.
- Atualização automática do estoque.
- Bloqueio de venda com estoque insuficiente.
- Alerta quando o estoque fica abaixo do mínimo.

## Requisitos
- Node.js instalado.
- MySQL instalado e iniciado.
- npm instalado.

## Como configurar

1. Crie o banco no MySQL executando o arquivo `database.sql`, **ou** deixe o Prisma criar as tabelas.
2. Instale as dependências na pasta do projeto:

   ```bash
   npm install
   ```

3. Copie `.env.example` para `.env`.
4. Edite `DATABASE_URL` com os dados do seu MySQL. Exemplo para instalação local sem senha:

   ```env
   DATABASE_URL="mysql://root:@localhost:3306/loja_discos_db"
   SESSION_SECRET="uma-chave-local-diferente"
   PORT=3000
   ```

   Se o MySQL tiver senha, coloque-a na URL. Caracteres especiais na senha devem ser codificados para URL.

5. Gere o Prisma Client:

   ```bash
   npx prisma generate
   ```

6. Crie as tabelas e insira os dados de exemplo:

   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

   **Alternativa:** execute `database.sql` para criar as tabelas e os registros iniciais. Depois de instalar as dependências e configurar `.env`, rode `npx prisma generate` e `npm run prisma:seed`. O seed atualiza as senhas para hashes válidos e garante o login de demonstração. Não precisa rodar `db push` nesse caso.

7. Inicie o servidor:

   ```bash
   npm run dev
   ```

8. Acesse `http://localhost:3000`.

## Login para demonstração
- **E-mail:** `admin@vinyl.com`
- **Senha:** `Vinyl123!`

O seed cria também `ana@vinyl.com` e `carlos@vinyl.com`, ambos com a mesma senha de demonstração. Troque as credenciais antes de qualquer uso real.

## Estrutura de pastas

```text
vinyl_control/
├── assets/
│   └── der_vinyl_control.png
├── documentacao/
│   ├── 01-requisitos-funcionais.md
│   ├── 02-der.md
│   ├── 03-banco-de-dados.md
│   ├── 04-login.md
│   ├── 05-pagina-principal.md
│   ├── 06-cadastro-discos.md
│   ├── 07-gestao-estoque.md
│   ├── 08-casos-de-teste.md
│   └── 09-infraestrutura.md
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── public/
│   ├── css/style.css
│   ├── js/
│   │   ├── app.js
│   │   └── login.js
│   ├── discos.html
│   ├── estoque.html
│   ├── index.html
│   └── login.html
├── .env.example
├── database.sql
├── package.json
├── README.md
└── server.js
```

## Testes
Consulte `documentacao/08-casos-de-teste.md`. Execute os casos no navegador e, se desejar, teste as rotas da API pelo Insomnia.

## Observações acadêmicas
- O projeto utiliza validações no frontend e no backend.
- As movimentações e a atualização do estoque são realizadas em uma transação de banco de dados.
- O histórico impede a exclusão de discos já movimentados.
- A sessão padrão em memória é adequada para demonstração local, mas deve ser substituída por armazenamento de sessão persistente em produção.

## GitHub
Nome sugerido do repositório: `loja_de_discos_01_2026`.

## Autores
- Luis Scorcer
- Kaique Pavan
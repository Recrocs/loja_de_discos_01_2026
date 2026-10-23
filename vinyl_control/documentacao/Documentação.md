# Documentação — Vinyl Control
## Sistema de Gestão de Acervo e Vendas de Discos de Vinil

**Projeto:** Vinyl Control  
**Objetivo:** controlar o cadastro de discos, o estoque e as movimentações de entrada e saída, com acesso restrito a usuários autenticados.

---

# ENTREGA 01 — Requisitos funcionais

## RF01 — Autenticação de usuários
- **RF01.1:** Solicitar e-mail e senha.
- **RF01.2:** Validar o preenchimento dos campos obrigatórios.
- **RF01.3:** Verificar se o e-mail está cadastrado e validar a senha informada.
- **RF01.4:** Informar a falha de autenticação sem expor dados sensíveis. A mensagem pode distinguir e-mail não cadastrado de senha incorreta conforme o comportamento definido para o projeto.
- **RF01.5:** Criar uma sessão no servidor após autenticação válida.
- **RF01.6:** Redirecionar o usuário autenticado para a página principal.
- **RF01.7:** Permitir o encerramento da sessão por meio do logout.

## RF02 — Página principal
- **RF02.1:** Exibir o nome do usuário autenticado.
- **RF02.2:** Exibir um resumo do catálogo, das unidades em estoque e das movimentações.
- **RF02.3:** Disponibilizar acesso ao cadastro e à consulta de discos.
- **RF02.4:** Disponibilizar acesso à gestão de acervo e vendas.
- **RF02.5:** Permitir sair do sistema.

## RF03 — Cadastro e consulta de discos
- **RF03.1:** Listar automaticamente os discos cadastrados em uma tabela.
- **RF03.2:** Permitir pesquisar discos por título, artista ou gênero.
- **RF03.3:** Permitir cadastrar discos com título, artista, gênero, preço de custo, preço de venda, quantidade em estoque e estoque mínimo.
- **RF03.4:** Permitir editar os dados de um disco existente.
- **RF03.5:** Permitir excluir um disco somente quando não houver movimentações vinculadas.
- **RF03.6:** Validar campos obrigatórios e limites de tamanho definidos para cada campo.
- **RF03.7:** Impedir preços negativos e quantidades negativas ou fracionárias quando o campo representar unidades.
- **RF03.8:** Exibir mensagens de sucesso ou erro após as operações.
- **RF03.9:** Permitir retornar à página principal.

## RF04 — Gestão de acervo e vendas
- **RF04.1:** Listar os discos em ordem alfabética crescente pelo título.
- **RF04.2:** Permitir selecionar o disco relacionado à movimentação.
- **RF04.3:** Permitir escolher entre entrada/reposição e saída/venda.
- **RF04.4:** Solicitar uma quantidade inteira maior que zero.
- **RF04.5:** Solicitar a data da movimentação e rejeitar datas ausentes ou inválidas.
- **RF04.6:** Associar automaticamente a movimentação ao usuário autenticado.
- **RF04.7:** Atualizar o estoque automaticamente ao registrar uma movimentação.
- **RF04.8:** Impedir uma saída/venda quando o estoque disponível for insuficiente.
- **RF04.9:** Alertar quando o estoque resultante ficar **abaixo** do estoque mínimo configurado.
- **RF04.10:** Exibir o histórico com data, disco, tipo, quantidade e usuário responsável.
- **RF04.11:** Permitir retornar à página principal.

## RF05 — Banco de dados
- **RF05.1:** Armazenar os dados de usuários, discos e movimentações.
- **RF05.2:** Relacionar cada movimentação a exatamente um usuário e a exatamente um disco.
- **RF05.3:** Preservar a integridade referencial e impedir a exclusão de discos que possuam movimentações vinculadas.

## RF06 — Segurança e controle de acesso
- **RF06.1:** Restringir páginas e rotas de dados a usuários autenticados.
- **RF06.2:** Armazenar senhas usando hash seguro, como bcrypt, nunca em texto puro.
- **RF06.3:** Invalidar a sessão no servidor ao realizar logout.
- **RF06.4:** Validar os dados recebidos também no servidor, sem depender exclusivamente das validações do navegador.

---

# ENTREGA 02 — Diagrama Entidade-Relacionamento (DER)

O diagrama conceitual/lógico do projeto está representado na imagem `assets/der_vinyl_control.png`. O diagrama deve corresponder aos campos e relacionamentos descritos nesta seção.

## Entidades e atributos

### USUARIO
- `id_usuario` — chave primária (PK), inteiro.
- `nome` — texto obrigatório.
- `email` — texto obrigatório e único.
- `senha` — hash da senha, texto obrigatório.

### DISCO
- `id_disco` — chave primária (PK), inteiro.
- `titulo` — texto obrigatório.
- `artista` — texto obrigatório.
- `genero` — texto obrigatório.
- `preco_custo` — decimal com duas casas.
- `preco_venda` — decimal com duas casas.
- `quantidade_estoque` — inteiro não negativo.
- `estoque_minimo` — inteiro não negativo.

### MOVIMENTACAO_ESTOQUE
- `id_movimentacao` — chave primária (PK), inteiro.
- `id_disco` — chave estrangeira (FK) obrigatória para `DISCO`.
- `id_usuario` — chave estrangeira (FK) obrigatória para `USUARIO`.
- `tipo_movimentacao` — valor controlado: `entrada` ou `saida`.
- `quantidade` — inteiro maior que zero.
- `data_movimentacao` — data obrigatória.
- `observacao` — texto opcional.

## Relacionamentos e cardinalidade
- **USUARIO 1:N MOVIMENTACAO_ESTOQUE:** um usuário pode registrar nenhuma, uma ou várias movimentações; cada movimentação pertence a um único usuário.
- **DISCO 1:N MOVIMENTACAO_ESTOQUE:** um disco pode ter nenhuma, uma ou várias movimentações; cada movimentação pertence a um único disco.

**PK** significa chave primária; **FK** significa chave estrangeira. As chaves estrangeiras da movimentação são obrigatórias. A exclusão de um disco com movimentações associadas deve ser bloqueada para preservar o histórico.

---

# ENTREGA 03 — Banco de dados

- **Banco:** `loja_discos_db`
- **SGBD:** MySQL 8.0 ou versão compatível.

## Opção A — Criação por script SQL
Execute `database.sql` no MySQL Workbench, phpMyAdmin ou terminal MySQL. O script deve criar o banco, as três tabelas, as restrições necessárias e pelo menos três registros em cada tabela, conforme o requisito da atividade.

## Opção B — Criação com Prisma
1. Copie `.env.example` para `.env`.
2. Configure `DATABASE_URL` com o endereço, a porta, o banco, o usuário e a senha do MySQL local.
3. Instale as dependências com `npm install`.
4. Gere o Prisma Client com `npx prisma generate`.
5. Crie/atualize as tabelas com `npx prisma db push`.
6. Popule os dados com `npm run prisma:seed`.

O seed do projeto cria ou atualiza três usuários, cinco discos e garante três movimentações de exemplo. Credenciais de demonstração:

- **E-mail:** `admin@vinyl.com`
- **Senha:** `Vinyl123!`

Use **uma** das opções para criar as tabelas; não é necessário executar os dois métodos. Se as tabelas forem criadas pelo script SQL, execute também o seed para preparar os usuários de demonstração com os hashes de senha esperados pelo sistema. Para o fluxo de desenvolvimento deste projeto, recomenda-se Prisma.

> **Observação:** mantenha `.env` e credenciais reais fora do repositório. O arquivo `.env.example` deve conter apenas valores ilustrativos.

---

# ENTREGA 04 — Interface de autenticação

- **Página:** `public/login.html`
- **Lógica de autenticação no navegador:** `public/js/login.js`

A interface de autenticação deve:
- Apresentar campos de e-mail e senha e o botão de entrada.
- Validar o preenchimento dos campos.
- Exibir uma mensagem quando a autenticação falhar.
- Enviar as credenciais à API e iniciar uma sessão no servidor após validação.
- Redirecionar para a página principal quando o login for bem-sucedido.

**Credenciais de demonstração**
- E-mail: `admin@vinyl.com`
- Senha: `Vinyl123!`

A senha deve ser armazenada no banco como hash usando `bcryptjs`, e não como texto puro.

---

# ENTREGA 05 — Interface principal

- **Arquivo:** `public/index.html`

A página principal deve:
- Mostrar o nome do usuário autenticado.
- Apresentar um resumo do catálogo, do estoque e das movimentações.
- Oferecer acesso ao cadastro/consulta de discos.
- Oferecer acesso à gestão de acervo e vendas.
- Disponibilizar um botão para encerrar a sessão e retornar ao login.

---

# ENTREGA 06 — Cadastro de discos

- **Arquivo:** `public/discos.html`

A interface deve listar automaticamente os discos cadastrados em uma tabela e permitir:
- Pesquisar por título, artista ou gênero.
- Cadastrar um disco.
- Editar os dados de um disco existente.
- Excluir discos sem movimentações vinculadas.
- Validar campos obrigatórios, limites de texto, preços e quantidades.
- Exibir mensagens de confirmação ou erro.
- Retornar à página principal.

A API também deve validar os dados no servidor. A validação do navegador melhora a experiência, mas não substitui a validação da API.

---

# ENTREGA 07 — Gestão de acervo e vendas

- **Arquivo:** `public/estoque.html`

A interface deve:
- Listar os discos em ordem alfabética pelo título.
- Permitir selecionar o disco e o tipo de movimentação.
- Registrar quantidade, data e observação.
- Associar a movimentação ao usuário autenticado.
- Atualizar o estoque e registrar a movimentação na mesma transação do banco de dados.
- Bloquear vendas com estoque insuficiente.
- Alertar quando a quantidade final ficar abaixo do estoque mínimo.
- Exibir o histórico das movimentações.

O alerta é exibido quando o estoque final fica **menor que** o valor configurado em `estoque_minimo`. Se ficar exatamente igual ao mínimo, não atende à condição “abaixo do mínimo”.

---

# ENTREGA 08 — Casos de teste de software

## Ferramentas e ambiente
- Sistema operacional: Windows 11 (registrar edição, versão e build reais do computador utilizado).
- Navegador: Google Chrome ou Microsoft Edge atualizado.
- Editor: Visual Studio Code.
- Backend: Node.js e Express.
- Banco de dados: MySQL 8.0 ou compatível.
- ORM: Prisma 6, conforme as dependências do projeto.
- Testes manuais: navegador.
- Testes de API: Insomnia, quando utilizado.
- Endereço local esperado: `http://localhost:3000`.

## Dados de teste
- **Usuário:** `admin@vinyl.com`
- **Senha:** `Vinyl123!`

O servidor deve estar iniciado e o banco criado e populado antes dos testes. Os resultados abaixo são **resultados esperados**, não evidência de execução. Preencha o registro de execução somente depois de realizar cada teste.

## Casos de teste

### CT01 — RF01.1: campos de autenticação
**Pré-condição:** servidor iniciado.  
**Passos:** abrir a página de login e verificar os campos de e-mail e senha e o botão Entrar.  
**Resultado esperado:** os dois campos e o botão são exibidos.

### CT02 — RF01.3 e RF01.5: login válido
**Pré-condição:** usuário de demonstração cadastrado.  
**Passos:** informar `admin@vinyl.com` e `Vinyl123!` e clicar em Entrar.  
**Resultado esperado:** autenticação bem-sucedida, sessão criada e página principal aberta.

### CT03 — RF01.4: senha incorreta
**Passos:** informar o e-mail válido e uma senha incorreta.  
**Resultado esperado:** autenticação recusada, mensagem de erro exibida e permanência na tela de login.

### CT04 — RF01.5 e RF01.7: sessão e logout
**Passos:** entrar no sistema, verificar o nome no cabeçalho e clicar em Sair.  
**Resultado esperado:** sessão invalidada e redirecionamento para o login.

### CT05 — RF02.1 a RF02.5: página principal
**Pré-condição:** usuário autenticado.  
**Passos:** abrir a página principal e verificar o nome, os indicadores e os links.  
**Resultado esperado:** nome e resumo visíveis; links para as duas interfaces funcionam.

### CT06 — RF03.1: listagem automática
**Pré-condição:** banco com discos de exemplo.  
**Passos:** abrir Cadastro de discos.  
**Resultado esperado:** tabela preenchida com os discos cadastrados.

### CT07 — RF03.2: busca
**Passos:** pesquisar por `Beatles` e depois por um termo inexistente.  
**Resultado esperado:** a primeira busca apresenta os registros correspondentes, se houver; a segunda apresenta uma lista vazia ou mensagem equivalente.

### CT08 — RF03.3: cadastrar disco
**Passos:** cadastrar um disco com todos os campos válidos.  
**Resultado esperado:** confirmação e novo registro exibido na tabela.

### CT09 — RF03.4: editar disco
**Pré-condição:** existir um disco cadastrado.  
**Passos:** clicar em Editar, alterar o gênero e salvar.  
**Resultado esperado:** alteração persistida no banco e apresentada na tabela.

### CT10 — RF03.5: excluir disco
**Pré-condição:** existir um disco sem movimentações vinculadas.  
**Passos:** clicar em Excluir e confirmar.  
**Resultado esperado:** disco removido. Para um disco com movimentações, a exclusão deve ser recusada e o histórico preservado.

### CT11 — RF03.6 e RF03.7: validação de dados
**Passos:** tentar salvar campos obrigatórios vazios, preço negativo e quantidade fracionária.  
**Resultado esperado:** formulário/API rejeita os dados inválidos e informa o problema.

### CT12 — RF04.1: ordem alfabética
**Passos:** abrir Gestão de acervo e vendas.  
**Resultado esperado:** discos listados pelo título em ordem alfabética crescente.

### CT13 — RF04.2 a RF04.7: entrada/reposição
**Passos:** selecionar um disco, escolher entrada, informar quantidade 2 e uma data válida e registrar.  
**Resultado esperado:** estoque aumenta em duas unidades e o histórico mostra data, disco, tipo, quantidade e usuário.

### CT14 — RF04.2 a RF04.8: venda válida
**Pré-condição:** disco com estoque suficiente.  
**Passos:** registrar a venda de uma unidade.  
**Resultado esperado:** estoque diminui em uma unidade e a movimentação é registrada.

### CT15 — RF04.8: estoque insuficiente
**Passos:** tentar vender uma quantidade maior que o estoque disponível.  
**Resultado esperado:** operação recusada e estoque inalterado.

### CT16 — RF04.5: data inválida
**Passos:** enviar uma movimentação com data ausente ou inválida pela interface/API.  
**Resultado esperado:** movimentação recusada e nenhum registro criado.

### CT17 — RF04.9: estoque abaixo do mínimo
**Pré-condição:** disco com estoque 4 e estoque mínimo 3.  
**Passos:** registrar venda de 2 unidades.  
**Resultado esperado:** estoque passa a 2, movimentação é registrada e alerta de estoque abaixo do mínimo é exibido.

### CT18 — RF04.10: histórico
**Passos:** realizar uma entrada e uma saída e atualizar o histórico.  
**Resultado esperado:** as duas movimentações aparecem com data, disco, tipo, quantidade e usuário.

### CT19 — RF06.1: proteção de rotas
**Passos:** sair do sistema e tentar acessar uma rota protegida, como `/api/discos`, sem sessão.  
**Resultado esperado:** a API recusa o acesso, normalmente com HTTP 401. A rota exata deve corresponder à implementação do projeto.

### CT20 — RF05.2 e RF05.3: integridade referencial
**Passos:** tentar excluir um disco com movimentações vinculadas.  
**Resultado esperado:** exclusão impedida e histórico preservado.

## Registro dos resultados
Preencha para cada caso executado:
- **Executado:** Sim/Não.
- **Resultado obtido:** comportamento observado.
- **Status:** Aprovado/Reprovado.
- **Observações:** erros, evidências ou condições relevantes.

Não marque um caso como executado ou aprovado sem realizar o teste. Recomenda-se anexar capturas de tela das evidências.

---

# ENTREGA 09 — Requisitos de infraestrutura

## Ambiente de desenvolvimento
- **Sistema operacional:** Windows 11. Registrar edição, versão e build exatas utilizadas.
- **Linguagem do backend:** JavaScript executado no Node.js.
- **Node.js:** versão compatível com as dependências do projeto; registrar a versão real com `node -v`.
- **Gerenciador de pacotes:** npm; registrar a versão com `npm -v`.
- **Frontend:** HTML5, CSS3 e JavaScript.
- **Servidor:** Express 4, conforme as dependências do projeto.
- **ORM:** Prisma 6.19.0, conforme a versão instalada no projeto.
- **SGBD:** MySQL 8.0 ou versão compatível.
- **Navegador:** Google Chrome ou Microsoft Edge atualizado.
- **Editor:** Visual Studio Code.

## Recursos necessários
- Computador com Windows, Linux ou macOS compatível com Node.js.
- Terminal para instalar dependências e iniciar o servidor.
- Servidor MySQL local ou remoto acessível.
- Navegador web moderno.
- Arquivo `.env` configurado corretamente e mantido fora do controle de versão.

## Comandos úteis para registrar versões
```bash
node -v
npm -v
npx prisma -v
```

**Importante:** confirme e registre as versões reais no computador utilizado na avaliação. Não declare uma versão que não tenha sido verificada.

---

# Observações finais

1. Os nomes de arquivos e rotas descritos nesta documentação devem ser conferidos com a estrutura real do repositório.
2. Os requisitos funcionais descrevem o comportamento esperado; os casos de teste precisam ser executados para confirmar a implementação.
3. O banco deve manter as movimentações vinculadas ao disco e ao usuário correspondentes.
4. A senha de demonstração é destinada apenas ao ambiente acadêmico/local. Não reutilize essa senha em ambientes públicos ou de produção.

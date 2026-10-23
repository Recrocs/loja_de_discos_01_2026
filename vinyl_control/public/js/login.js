const formLogin = document.getElementById("form-login");
const mensagemLogin = document.getElementById("mensagem");

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagemLogin.textContent = "";
  mensagemLogin.classList.remove("erro");

  try {
    const resposta = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value
      })
    });
    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagemLogin.textContent = dados.erro || "Não foi possível entrar.";
      mensagemLogin.classList.add("erro");
      return;
    }

    window.location.href = "/index.html";
  } catch (erro) {
    mensagemLogin.textContent = "Não foi possível conectar ao servidor.";
    mensagemLogin.classList.add("erro");
  }
});
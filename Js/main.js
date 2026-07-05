// main.js — ponto de entrada: busca os dados e preenche a tela

const EMOJI_POR_CATEGORIA = {
  ensolarado: "☀️",
  nublado: "☁️",
  chuva: "🌧️",
  tempestade: "⛈️",
  frio: "🧣",
  neve: "❄️",
};

function definirSaudacao() {
  const hora = new Date().getHours();
  const elSaudacao = document.getElementById("saudacao");
  const elSubtitulo = document.getElementById("subtitulo");

  let texto = "Bom dia, meu amor";
  if (hora >= 12 && hora < 18) texto = "Boa tarde, meu amor";
  if (hora >= 18 || hora < 5) texto = "Boa noite, meu amor";

  elSaudacao.innerHTML = `${texto} <span class="brilho">✨</span>`;
  elSubtitulo.textContent = "Que seu dia seja tão lindo quanto você! 💕";
}

function atualizarCirculoPrincipal(diaAmanha) {
  document.getElementById("temperatura").textContent = `${diaAmanha.tempMax}°`;
  document.getElementById("condicao").textContent = diaAmanha.condicaoTexto;
  document.getElementById("chuva-info").textContent = diaAmanha.vaiChover
    ? `☔ ${diaAmanha.chanceChuva}% de chance de chuva`
    : "☔ Não vai chover";
}

function atualizarLocalizacao(nomeCidade) {
  document.getElementById("localizacao").textContent = `📍 ${nomeCidade}`;
}

function atualizarFrase(categoria) {
  const frase = Frases.sortearFrase(categoria);
  document.getElementById("frase-inspiradora").textContent = frase;
}

async function atualizarGif(categoria) {
  const elIcone = document.getElementById("icone-tempo");
  try {
    const gif = await Gif.buscarGifGato(categoria);
    elIcone.innerHTML = `
      <img src="${gif.url}" alt="Gatinho ilustrando o clima de amanhã" class="gif-gato" />
      <span class="giphy-credito">${gif.attribution}</span>
    `;
  } catch (erro) {
    console.warn("Não foi possível carregar o gif do gato:", erro);
    // Mantém o ícone padrão que já está no HTML caso o gif falhe
  }
}

function renderizarProximosDias(dias) {
  const lista = document.getElementById("dias-lista");
  lista.innerHTML = "";

  dias.forEach((dia) => {
    const card = document.createElement("article");
    card.className = "dia-card";

    card.innerHTML = `
      <div class="dia-nome-data">
        <p class="dia-nome">${dia.diaSemana}</p>
        <p class="dia-data">${dia.dataFormatada}</p>
      </div>
      <div class="dia-icone" aria-hidden="true">
        <span class="dia-icone-emoji">${EMOJI_POR_CATEGORIA[dia.condicaoCategoria] || "☁️"}</span>
      </div>
      <p class="dia-chuva">${dia.vaiChover ? "Vai chover" : "Não vai chover"}</p>
      <p class="dia-temps">
        <span class="dia-max">${dia.tempMax}°</span>
        <span class="dia-min">/ ${dia.tempMin}°</span>
      </p>
    `;

    lista.appendChild(card);
  });
}

function mostrarErro(mensagem) {
  document.getElementById("condicao").textContent = "Ops!";
  document.getElementById("chuva-info").textContent = mensagem;
  document.getElementById("dias-lista").innerHTML =
    `<p class="dias-carregando">Não foi possível carregar a previsão agora. Tente atualizar a página. 💕</p>`;
}

async function iniciarApp() {
  definirSaudacao();

  try {
    const previsao = await Clima.buscarPrevisao();
    const diaAmanha = previsao.dias[0];

    atualizarLocalizacao(previsao.cidade);
    atualizarCirculoPrincipal(diaAmanha);
    atualizarFrase(diaAmanha.condicaoCategoria);
    renderizarProximosDias(previsao.dias);
    await atualizarGif(diaAmanha.condicaoCategoria);
  } catch (erro) {
    console.error("Erro ao carregar o app do tempo:", erro);
    mostrarErro("Não conseguimos buscar a previsão do tempo agora 🥺");
  }
}

document.addEventListener("DOMContentLoaded", iniciarApp);

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

  const ehNoite = hora >= 18 || hora < 6;
  document.body.setAttribute("data-periodo", ehNoite ? "noite" : "dia");

  elSaudacao.innerHTML = `${texto} <span class="brilho">✨</span>`;
  elSubtitulo.textContent = "Que seu dia seja tão lindo quanto você! 💕";
}

function atualizarCirculoPrincipal(diaAmanha) {
  document.getElementById("temperatura").textContent = `${diaAmanha.tempMax}°`;
  document.getElementById("condicao").textContent = diaAmanha.condicaoTexto;
  document.getElementById("sensacao").textContent = `Sensação de ${diaAmanha.sensacao}°`;
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

function renderizarFaixaHoraria(horaria) {
  const lista = document.getElementById("horaria-lista");
  const svgLinha = document.getElementById("horaria-linha");
  lista.innerHTML = "";
  svgLinha.innerHTML = "";

  if (!horaria || horaria.length === 0) {
    document.getElementById("previsao-horaria").style.display = "none";
    return;
  }

  const temps = horaria.map((p) => p.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const largura = 320;
  const altura = 40;
  const passo = largura / (horaria.length - 1 || 1);

  const pontos = horaria.map((ponto, i) => {
    const x = i * passo;
    const y = max === min ? altura / 2 : altura - ((ponto.temp - min) / (max - min)) * (altura - 8) - 4;
    return `${x},${y}`;
  });

  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("points", pontos.join(" "));
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", "#e0257e");
  polyline.setAttribute("stroke-width", "2");
  polyline.setAttribute("stroke-linecap", "round");
  polyline.setAttribute("stroke-linejoin", "round");
  svgLinha.appendChild(polyline);

  horaria.forEach((ponto) => {
    const item = document.createElement("div");
    item.className = "hora-item";
    item.innerHTML = `
      <span class="hora-label">${String(ponto.hora).padStart(2, "0")}h</span>
      <span class="hora-emoji">${EMOJI_POR_CATEGORIA[ponto.categoria] || "☁️"}</span>
      <span class="hora-temp">${ponto.temp}°</span>
    `;
    lista.appendChild(item);
  });
}

function renderizarDestaqueChuva(diaDestaque) {
  const elFrase = document.getElementById("chuva-destaque-frase");
  const elPercentual = document.getElementById("chuva-destaque-percentual");

  elPercentual.textContent = `${diaDestaque.chanceChuva}%`;

  if (diaDestaque.chanceChuva < 30) {
    elFrase.textContent = "Sem previsão de chuva nos próximos dias 🌸";
  } else {
    elFrase.textContent = `Possível chuva ${diaDestaque.diaSemana.toLowerCase()} 💗`;
  }
}


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
    renderizarFaixaHoraria(previsao.horaria);
    renderizarDestaqueChuva(previsao.destaqueChuva);
    await atualizarGif(diaAmanha.condicaoCategoria);
  } catch (erro) {
    console.error("Erro ao carregar o app do tempo:", erro);
    mostrarErro("Não conseguimos buscar a previsão do tempo agora 🥺");
  }
}

document.addEventListener("DOMContentLoaded", iniciarApp);

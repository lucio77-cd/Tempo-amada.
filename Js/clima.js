// clima.js — busca a previsão do tempo (Open-Meteo, sem necessidade de chave)

const Clima = (() => {

  // Traduz o "weathercode" da Open-Meteo para uma categoria interna do app
  // (usada para escolher a frase inspiradora e o gif do gato)
  function categoriaPorCodigo(codigo) {
    if (codigo === 0) return "ensolarado";
    if (codigo === 1 || codigo === 2) return "ensolarado";
    if (codigo === 3 || codigo === 45 || codigo === 48) return "nublado";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) return "chuva";
    if ([71, 73, 75, 77, 85, 86].includes(codigo)) return "neve";
    if ([95, 96, 99].includes(codigo)) return "tempestade";
    return "nublado";
  }

  // Texto amigável em português para exibir na tela
  function textoPorCodigo(codigo) {
    const mapa = {
      0: "Céu limpo",
      1: "Predominantemente limpo",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Neblina",
      48: "Neblina com geada",
      51: "Garoa fraca",
      53: "Garoa",
      55: "Garoa forte",
      56: "Garoa congelante",
      57: "Garoa congelante forte",
      61: "Chuva fraca",
      63: "Chuva",
      65: "Chuva forte",
      66: "Chuva congelante",
      67: "Chuva congelante forte",
      71: "Neve fraca",
      73: "Neve",
      75: "Neve forte",
      77: "Grãos de neve",
      80: "Pancadas de chuva fracas",
      81: "Pancadas de chuva",
      82: "Pancadas de chuva fortes",
      85: "Pancadas de neve fracas",
      86: "Pancadas de neve fortes",
      95: "Tempestade",
      96: "Tempestade com granizo",
      99: "Tempestade com granizo forte",
    };
    return mapa[codigo] || "Tempo variável";
  }

  const NOMES_DIA_SEMANA = [
    "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
  ];

  function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}`;
  }

  function nomeDiaSemana(dataISO, indice) {
    if (indice === 0) return "Amanhã";
    const data = new Date(dataISO + "T12:00:00");
    return NOMES_DIA_SEMANA[data.getDay()];
  }

  // Busca a previsão e devolve os próximos 4 dias já normalizados,
  // começando por amanhã (índice 1 da resposta da Open-Meteo, já que o índice 0 é hoje)
  async function buscarPrevisao() {
    const { latitude, longitude } = CONFIG.cidade;
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=${encodeURIComponent(CONFIG.timezone)}` +
      `&forecast_days=6`;

    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error("Não foi possível buscar a previsão do tempo.");
    }
    const dados = await resposta.json();
    const { time, weathercode, temperature_2m_max, temperature_2m_min, precipitation_probability_max } = dados.daily;

    const dias = [];
    // Começa em 1 para pular "hoje" e pegar os próximos 4 dias a partir de amanhã
    for (let i = 1; i <= 4; i++) {
      const codigo = weathercode[i];
      const chuva = precipitation_probability_max[i] ?? 0;

      dias.push({
        data: time[i],
        dataFormatada: formatarData(time[i]),
        diaSemana: nomeDiaSemana(time[i], i - 1),
        condicaoCategoria: categoriaPorCodigo(codigo),
        condicaoTexto: textoPorCodigo(codigo),
        tempMax: Math.round(temperature_2m_max[i]),
        tempMin: Math.round(temperature_2m_min[i]),
        chanceChuva: chuva,
        vaiChover: chuva >= 40,
      });
    }

    return {
      cidade: CONFIG.cidade.nome,
      dias,
    };
  }

  return { buscarPrevisao };
})();

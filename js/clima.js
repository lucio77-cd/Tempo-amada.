// clima.js — busca a previsão em DUAS fontes (Open-Meteo + OpenWeatherMap)
// e combina os resultados num único dado mais confiável.

const Clima = (() => {

  const NOMES_DIA_SEMANA = [
    "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
  ];

  // Ordem de "severidade" usada para decidir a condição final quando as
  // duas fontes discordam — prioriza sempre o cenário mais cauteloso
  // (ex: se uma fonte diz "chuva" e a outra "nublado", mostramos chuva).
  const SEVERIDADE = {
    ensolarado: 1,
    nublado: 2,
    frio: 2,
    chuva: 3,
    tempestade: 4,
    neve: 4,
  };

  const TEXTO_POR_CATEGORIA = {
    ensolarado: "Ensolarado",
    nublado: "Parcialmente nublado",
    chuva: "Chuva",
    tempestade: "Tempestade",
    frio: "Frio",
    neve: "Neve",
  };

  function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}`;
  }

  function nomeDiaSemana(dataISO, ehAmanha) {
    if (ehAmanha) return "Amanhã";
    const data = new Date(dataISO + "T12:00:00");
    return NOMES_DIA_SEMANA[data.getDay()];
  }

  // ---------------------------------------------------------
  // FONTE 1: Open-Meteo (sem necessidade de chave)
  // ---------------------------------------------------------
  function categoriaPorCodigoOpenMeteo(codigo) {
    if (codigo === 0 || codigo === 1 || codigo === 2) return "ensolarado";
    if (codigo === 3 || codigo === 45 || codigo === 48) return "nublado";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) return "chuva";
    if ([71, 73, 75, 77, 85, 86].includes(codigo)) return "neve";
    if ([95, 96, 99].includes(codigo)) return "tempestade";
    return "nublado";
  }

  async function buscarOpenMeteo() {
    const { latitude, longitude } = CONFIG.cidade;
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=${encodeURIComponent(CONFIG.timezone)}` +
      `&forecast_days=6`;

    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error("Open-Meteo indisponível");
    const dados = await resposta.json();
    const { time, weathercode, temperature_2m_max, temperature_2m_min, precipitation_probability_max } = dados.daily;

    const porData = {};
    for (let i = 1; i <= 4; i++) {
      porData[time[i]] = {
        tempMax: temperature_2m_max[i],
        tempMin: temperature_2m_min[i],
        chanceChuva: precipitation_probability_max[i] ?? 0,
        categoria: categoriaPorCodigoOpenMeteo(weathercode[i]),
      };
    }
    return porData;
  }

  // ---------------------------------------------------------
  // FONTE 2: OpenWeatherMap (endpoint gratuito 5 dias / 3 horas)
  // ---------------------------------------------------------
  function categoriaPorMainOWM(main) {
    const mapa = {
      Clear: "ensolarado",
      Clouds: "nublado",
      Rain: "chuva",
      Drizzle: "chuva",
      Thunderstorm: "tempestade",
      Snow: "neve",
      Mist: "nublado",
      Fog: "nublado",
      Haze: "nublado",
      Smoke: "nublado",
    };
    return mapa[main] || "nublado";
  }

  async function buscarOpenWeatherMap() {
    const chaveValida =
      CONFIG.owmApiKey && CONFIG.owmApiKey !== "COLOQUE_SUA_CHAVE_AQUI";
    if (!chaveValida) return null; // fonte opcional: se não tiver chave, seguimos só com a outra

    const { latitude, longitude } = CONFIG.cidade;
    const url =
      `https://api.openweathermap.org/data/2.5/forecast` +
      `?lat=${latitude}&lon=${longitude}` +
      `&appid=${CONFIG.owmApiKey}&units=metric&lang=pt_br`;

    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error("OpenWeatherMap indisponível");
    const dados = await resposta.json();

    // Agrupa as previsões de 3 em 3 horas por dia (data no formato "YYYY-MM-DD")
    const porDia = {};
    dados.list.forEach((item) => {
      const data = item.dt_txt.split(" ")[0];
      if (!porDia[data]) {
        porDia[data] = { temps: [], pops: [], categorias: {} };
      }
      porDia[data].temps.push(item.main.temp_max, item.main.temp_min);
      porDia[data].pops.push(item.pop ?? 0);

      const categoria = categoriaPorMainOWM(item.weather[0].main);
      porDia[data].categorias[categoria] = (porDia[data].categorias[categoria] || 0) + 1;
    });

    const porData = {};
    Object.entries(porDia).forEach(([data, info]) => {
      // Categoria mais frequente no dia
      const categoriaMaisFrequente = Object.entries(info.categorias)
        .sort((a, b) => b[1] - a[1])[0][0];

      porData[data] = {
        tempMax: Math.max(...info.temps),
        tempMin: Math.min(...info.temps),
        chanceChuva: Math.round(Math.max(...info.pops) * 100),
        categoria: categoriaMaisFrequente,
      };
    });

    return porData;
  }

  // ---------------------------------------------------------
  // Combina as duas fontes num resultado único por dia
  // ---------------------------------------------------------
  function combinarDia(dataOpenMeteo, dataOWM) {
    if (dataOpenMeteo && dataOWM) {
      const tempMax = Math.round((dataOpenMeteo.tempMax + dataOWM.tempMax) / 2);
      const tempMin = Math.round((dataOpenMeteo.tempMin + dataOWM.tempMin) / 2);
      const chanceChuva = Math.round((dataOpenMeteo.chanceChuva + dataOWM.chanceChuva) / 2);

      const categoria =
        SEVERIDADE[dataOpenMeteo.categoria] >= SEVERIDADE[dataOWM.categoria]
          ? dataOpenMeteo.categoria
          : dataOWM.categoria;

      return { tempMax, tempMin, chanceChuva, categoria };
    }

    // Se só uma fonte respondeu, usamos ela sozinha
    const unica = dataOpenMeteo || dataOWM;
    return {
      tempMax: Math.round(unica.tempMax),
      tempMin: Math.round(unica.tempMin),
      chanceChuva: Math.round(unica.chanceChuva),
      categoria: unica.categoria,
    };
  }

  // ---------------------------------------------------------
  // Função pública: busca as duas fontes e devolve o resultado combinado
  // ---------------------------------------------------------
  async function buscarPrevisao() {
    const [resultadoOM, resultadoOWM] = await Promise.allSettled([
      buscarOpenMeteo(),
      buscarOpenWeatherMap(),
    ]);

    const dadosOM = resultadoOM.status === "fulfilled" ? resultadoOM.value : null;
    const dadosOWM = resultadoOWM.status === "fulfilled" ? resultadoOWM.value : null;

    if (!dadosOM && !dadosOWM) {
      throw new Error("Nenhuma das fontes de clima respondeu.");
    }

    // As datas de referência vêm sempre da Open-Meteo (fonte mais confiável
    // de calendário); se ela falhar, usamos as datas que a OWM retornou.
    const datas = dadosOM
      ? Object.keys(dadosOM)
      : Object.keys(dadosOWM).sort().slice(0, 4);

    const dias = datas.map((data, indice) => {
      const combinado = combinarDia(
        dadosOM ? dadosOM[data] : null,
        dadosOWM ? dadosOWM[data] : null
      );

      return {
        data,
        dataFormatada: formatarData(data),
        diaSemana: nomeDiaSemana(data, indice === 0),
        condicaoCategoria: combinado.categoria,
        condicaoTexto: TEXTO_POR_CATEGORIA[combinado.categoria],
        tempMax: combinado.tempMax,
        tempMin: combinado.tempMin,
        chanceChuva: combinado.chanceChuva,
        vaiChover: combinado.chanceChuva >= 40,
        fontes: {
          openMeteo: !!dadosOM,
          openWeatherMap: !!dadosOWM,
        },
      };
    });

    return {
      cidade: CONFIG.cidade.nome,
      dias,
    };
  }

  return { buscarPrevisao };
})();

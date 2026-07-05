// gif.js — busca um gif de gato no GIPHY, escolhido conforme a condição do tempo de amanhã

const Gif = (() => {

  const TERMOS_BUSCA = {
    ensolarado: "cat sunbathing happy",
    nublado: "sleepy cat cozy",
    chuva: "cat rain umbrella",
    tempestade: "scared cat thunder",
    frio: "cat blanket warm",
    neve: "cat snow cute",
  };

  // Gif de reserva, usado se a chave do GIPHY não estiver configurada
  // ou se a busca falhar por qualquer motivo (sem internet, limite atingido, etc.)
  const GIF_RESERVA =
    "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif";

  async function buscarGifGato(categoria) {
    const termo = TERMOS_BUSCA[categoria] || TERMOS_BUSCA.nublado;

    const chaveValida =
      CONFIG.giphyApiKey && CONFIG.giphyApiKey !== "COLOQUE_SUA_CHAVE_AQUI";

    if (!chaveValida) {
      console.warn("Chave do GIPHY não configurada em config.js — usando gif de reserva.");
      return { url: GIF_RESERVA, attribution: "Powered by GIPHY" };
    }

    const url =
      `https://api.giphy.com/v1/gifs/search` +
      `?api_key=${CONFIG.giphyApiKey}` +
      `&q=${encodeURIComponent(termo)}` +
      `&limit=15&rating=g&lang=pt`;

    try {
      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error("Falha na busca do GIPHY");

      const dados = await resposta.json();
      if (!dados.data || dados.data.length === 0) {
        throw new Error("Nenhum gif encontrado");
      }

      const indice = Math.floor(Math.random() * dados.data.length);
      const gifEscolhido = dados.data[indice];

      return {
        url: gifEscolhido.images.original.url,
        attribution: "Powered by GIPHY",
      };
    } catch (erro) {
      console.warn("Não foi possível buscar o gif no GIPHY, usando reserva:", erro);
      return { url: GIF_RESERVA, attribution: "Powered by GIPHY" };
    }
  }

  return { buscarGifGato };
})();

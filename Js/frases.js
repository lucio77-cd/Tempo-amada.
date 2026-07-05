// frases.js — banco de frases inspiradoras, escolhidas conforme a condição do tempo de amanhã

const Frases = (() => {

  const BANCO = {
    ensolarado: [
      "Amanhã o sol vai brilhar tanto quanto você ☀️💗",
      "Um dia claro pedindo para ser aproveitado ao seu lado ☀️",
      "Que a luz de amanhã seja só um reflexo do seu sorriso 💛",
      "Dia de sol: perfeito para pequenas alegrias ✨",
    ],
    nublado: [
      "Céu nublado, coração aquecido — assim é com você por perto 💗",
      "Um dia mais ameno para ir com calma e sentir gratidão 🌥️",
      "Nem todo dia precisa de sol para ser lindo, meu amor 💕",
      "Um dia tranquilo, do jeitinho que a gente gosta 🩷",
    ],
    chuva: [
      "Um dia de chuva é perfeito para um café e um abraço ☔💗",
      "Que a chuva de amanhã lave qualquer preocupação 🌧️",
      "Dia chuvoso pedindo colo e um filme juntinhos 🩷",
      "A chuva cai lá fora, mas aqui dentro é sempre aconchego 💕",
    ],
    tempestade: [
      "Mesmo com tempestade lá fora, com você tudo fica calmo 💗",
      "Um bom motivo para ficar em casa, pertinho de quem se ama 🩷",
      "Que amanhã a gente encontre abrigo um no outro ⛈️💕",
    ],
    frio: [
      "Dia de frio pede cobertor, chá e o seu abraço 🧣💗",
      "Amanhã o friozinho é só desculpa para ficar mais perto 🩷",
      "Que o calor do seu carinho aqueça qualquer dia frio 💕",
    ],
    neve: [
      "Um dia raro e mágico — como você 💗❄️",
      "Que a neve de amanhã traga leveza para o seu dia ✨",
    ],
  };

  function sortearFrase(categoria) {
    const lista = BANCO[categoria] || BANCO.nublado;
    const indice = Math.floor(Math.random() * lista.length);
    return lista[indice];
  }

  return { sortearFrase };
})();

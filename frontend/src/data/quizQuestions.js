export const allEcoQuestions = [
  {
    question: "Qual é a principal causa do aquecimento global?",
    options: ["Desmatamento", "Emissão de gases do efeito estufa", "Poluição da água", "Lixo urbano"],
    correct: 1,
    points: 50
  },
  {
    question: "Quanto tempo leva para uma garrafa plástica se decompor?",
    options: ["10 anos", "50 anos", "100 anos", "450 anos"],
    correct: 3,
    points: 75
  },
  {
    question: "Qual dessas ações economiza mais água?",
    options: ["Banho de 5 min", "Escovar dentes com torneira fechada", "Reutilizar água da chuva", "Lavar roupa na máquina cheia"],
    correct: 2,
    points: 60
  },
  {
    question: "Qual fonte de energia é mais sustentável?",
    options: ["Carvão", "Petróleo", "Energia Solar", "Gás Natural"],
    correct: 2,
    points: 40
  },
  {
    question: "Quantas árvores uma pessoa deve plantar por ano para compensar sua pegada de carbono?",
    options: ["2-3 árvores", "5-7 árvores", "10-15 árvores", "20-25 árvores"],
    correct: 2,
    points: 80
  },
  {
    question: "Quantos litros de água são necessários para produzir 1kg de carne bovina?",
    options: ["500 litros", "1.500 litros", "5.000 litros", "15.000 litros"],
    correct: 3,
    points: 70
  },
  {
    question: "Qual país é o maior produtor de energia solar do mundo?",
    options: ["Estados Unidos", "China", "Alemanha", "Japão"],
    correct: 1,
    points: 55
  },
  {
    question: "Quanto tempo leva para uma lata de alumínio se decompor?",
    options: ["50 anos", "100 anos", "200 anos", "500 anos"],
    correct: 2,
    points: 65
  },
  {
    question: "Qual é o bioma brasileiro mais ameaçado?",
    options: ["Amazônia", "Mata Atlântica", "Cerrado", "Pantanal"],
    correct: 1,
    points: 60
  },
  {
    question: "Qual material é mais fácil de reciclar?",
    options: ["Plástico", "Vidro", "Papel", "Metal"],
    correct: 1,
    points: 45
  },
  {
    question: "Qual é a temperatura ideal para economizar energia no ar-condicionado?",
    options: ["18°C", "20°C", "23°C", "26°C"],
    correct: 2,
    points: 50
  },
  {
    question: "Qual gás é o principal responsável pelo efeito estufa?",
    options: ["Oxigênio", "Nitrogênio", "Dióxido de Carbono (CO2)", "Hidrogênio"],
    correct: 2,
    points: 55
  },
  {
    question: "Qual porcentagem da água da Terra é doce?",
    options: ["1%", "3%", "10%", "25%"],
    correct: 1,
    points: 70
  },
  {
    question: "Quantas folhas de papel podem ser feitas com uma árvore?",
    options: ["1.000 folhas", "5.000 folhas", "10.000 folhas", "20.000 folhas"],
    correct: 2,
    points: 65
  },
  {
    question: "Qual é o principal polinizador de plantas no mundo?",
    options: ["Borboletas", "Abelhas", "Pássaros", "Morcegos"],
    correct: 1,
    points: 60
  },
  {
    question: "Qual setor consome mais água no Brasil?",
    options: ["Indústria", "Agricultura", "Uso doméstico", "Comércio"],
    correct: 1,
    points: 55
  },
  {
    question: "Qual tipo de lâmpada é mais eficiente?",
    options: ["Incandescente", "Fluorescente", "LED", "Halógena"],
    correct: 2,
    points: 50
  },
  {
    question: "Qual é o oceano mais poluído do mundo?",
    options: ["Atlântico", "Pacífico", "Índico", "Ártico"],
    correct: 1,
    points: 65
  },
  {
    question: "Quantas espécies marinhas estão ameaçadas pelo plástico nos oceanos?",
    options: ["100 espécies", "500 espécies", "1.000 espécies", "Mais de 1.500 espécies"],
    correct: 3,
    points: 75
  },
  {
    question: "Qual é a floresta tropical mais importante para o clima global?",
    options: ["Floresta do Congo", "Floresta Amazônica", "Floresta da Indonésia", "Floresta da Austrália"],
    correct: 1,
    points: 60
  },
  {
    question: "Qual material pode ser reciclado infinitas vezes?",
    options: ["Plástico", "Papel", "Vidro", "Madeira"],
    correct: 2,
    points: 70
  },
  {
    question: "Qual prática agrícola é mais sustentável?",
    options: ["Monocultura", "Agricultura orgânica", "Uso intensivo de pesticidas", "Queimadas"],
    correct: 1,
    points: 65
  },
  {
    question: "Qual meio de transporte emite menos CO2?",
    options: ["Carro a gasolina", "Motocicleta", "Bicicleta", "Carro elétrico"],
    correct: 2,
    points: 55
  },
  {
    question: "Qual é o país que mais recicla no mundo?",
    options: ["Brasil", "Alemanha", "Japão", "Estados Unidos"],
    correct: 1,
    points: 60
  },
  {
    question: "Quanto a temperatura global já aumentou desde a era pré-industrial?",
    options: ["0,5°C", "1,1°C", "2,5°C", "3,0°C"],
    correct: 1,
    points: 80
  }
];

export const getRandomQuestions = (count = 5) => {
  const shuffled = [...allEcoQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

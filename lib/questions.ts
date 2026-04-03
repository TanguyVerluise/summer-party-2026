export interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

export const QUESTIONS: Question[] = [
  {
    question:
      "BlaBlaCar a été fondé après que son créateur n'a pas trouvé de transport pour rentrer chez lui. C'était pour aller où ?",
    options: [
      "Lyon → Paris",
      "Paris → La Campagne (Vendée)",
      "Bordeaux → Toulouse",
      "Marseille → Nice",
    ],
    correctIndex: 1,
  },
  {
    question:
      'Quelle licorne française a popularisé le concept de "reconditionné" en Europe ?',
    options: ["Veepee", "Cdiscount", "Back Market", "Fnac Darty"],
    correctIndex: 2,
  },
  {
    question:
      "Combien de temps Doctolib a-t-il mis pour atteindre 1 million de rendez-vous par mois ?",
    options: ["6 mois", "1 an", "3 ans", "5 ans"],
    correctIndex: 2,
  },
  {
    question:
      'Dans le modèle "Pirate Metrics" (AARRR), que signifie le premier A ?',
    options: ["Awareness", "Acquisition", "Activation", "Attribution"],
    correctIndex: 1,
  },
  {
    question:
      "Qonto est une néobanque pour les pros. Dans quel pays européen a-t-elle été fondée ?",
    options: ["Allemagne", "Pays-Bas", "France", "Belgique"],
    correctIndex: 2,
  },
  {
    question:
      "Quel est le vrai métier de Stewart Butterfield, le créateur de Slack, avant la tech ?",
    options: ["Banquier", "Philosophe", "Médecin", "Avocat"],
    correctIndex: 1,
  },
  {
    question:
      "Vinted, la marketplace de seconde main, a été créée dans quel pays ?",
    options: ["Pologne", "Suède", "Lituanie", "Estonie"],
    correctIndex: 2,
  },
  {
    question:
      "Quel produit français a atteint le statut de licorne le plus rapidement dans l'histoire de la French Tech ?",
    options: ["Doctolib", "Sorare", "Qonto", "Alan"],
    correctIndex: 1,
  },
  {
    question:
      'Le terme "Product-Market Fit" a été popularisé par un investisseur. Lequel ?',
    options: ["Peter Thiel", "Paul Graham", "Marc Andreessen", "Reid Hoffman"],
    correctIndex: 2,
  },
  {
    question:
      "Combien de licornes la French Tech comptait-elle fin 2024 ?",
    options: ["15", "~30", "50", "75"],
    correctIndex: 1,
  },
  {
    question: "Chez Spotify, la North Star Metric historique est :",
    options: [
      "Nombre d'abonnés Premium",
      "Revenus publicitaires",
      "Temps d'écoute (Time Spent Listening)",
      "Nombre de playlists créées",
    ],
    correctIndex: 2,
  },
  {
    question: "Le Ticket est un média francophone spécialisé dans :",
    options: [
      "Le développement web",
      "Le marketing digital",
      "Le produit et la tech",
      "La finance startup",
    ],
    correctIndex: 2,
  },
  {
    question:
      "Quel cocktail classique est fait avec du rhum, du citron vert et de la menthe ?",
    options: ["Piña Colada", "Daiquiri", "Mojito", "Caipirinha"],
    correctIndex: 2,
  },
  {
    question: "De quelle couleur est un flamant rose à la naissance ?",
    options: ["Rose pâle", "Orange", "Blanc/gris", "Jaune"],
    correctIndex: 2,
  },
  {
    question:
      "Quelle est la température idéale d'une piscine selon la Fédération Française de Natation ?",
    options: ["22°C", "25°C", "28°C", "30°C"],
    correctIndex: 1,
  },
  {
    question: "Combien de litres d'eau contient une piscine olympique ?",
    options: [
      "1 million de litres",
      "2,5 millions de litres",
      "5 millions de litres",
      "500 000 litres",
    ],
    correctIndex: 1,
  },
  {
    question: "Quel pays d'Europe a le plus de piscines privées ?",
    options: ["Italie", "Allemagne", "Espagne", "France"],
    correctIndex: 3,
  },
  {
    question:
      "L'Aperol Spritz, cocktail star de l'été, a été inventé dans quelle ville ?",
    options: ["Rome", "Milan", "Padoue (Vénétie)", "Naples"],
    correctIndex: 2,
  },
  {
    question: 'Quel artiste français a chanté "L\'été indien" ?',
    options: [
      "Michel Sardou",
      "Joe Dassin",
      "Jacques Dutronc",
      "Serge Gainsbourg",
    ],
    correctIndex: 1,
  },
  {
    question:
      "En France, quel est le jour le plus long de l'année (solstice d'été) ?",
    options: ["20 juin", "21 juin", "22 juin", "1er juillet"],
    correctIndex: 1,
  },
];

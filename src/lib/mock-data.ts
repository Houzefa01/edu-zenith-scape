export type Course = {
  id: string;
  title: string;
  category: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  teacher: string;
  teacherAvatar: string;
  cover: string;
  progress: number;
  lessons: number;
  duration: string;
  rating: number;
  students: number;
  description: string;
  chapters: { title: string; duration: string; done: boolean }[];
};

export const courses: Course[] = [
  {
    id: "design-systems",
    title: "Design Systems modernes avec Figma & Tokens",
    category: "Design",
    level: "Intermédiaire",
    teacher: "Amélie Rousseau",
    teacherAvatar: "AR",
    cover: "linear-gradient(135deg,#6366f1,#22d3ee)",
    progress: 64,
    lessons: 24,
    duration: "8h 20m",
    rating: 4.9,
    students: 1284,
    description:
      "Apprenez à concevoir, documenter et faire évoluer un design system robuste à l'échelle d'un produit SaaS.",
    chapters: [
      { title: "Introduction au design system", duration: "12m", done: true },
      { title: "Tokens & variables", duration: "24m", done: true },
      { title: "Composants atomiques", duration: "38m", done: true },
      { title: "Patterns d'interaction", duration: "42m", done: false },
      { title: "Gouvernance & contribution", duration: "30m", done: false },
    ],
  },
  {
    id: "react-advanced",
    title: "React Avancé : Performance & Architecture",
    category: "Développement",
    level: "Avancé",
    teacher: "Karim Benali",
    teacherAvatar: "KB",
    cover: "linear-gradient(135deg,#0ea5e9,#6366f1)",
    progress: 32,
    lessons: 31,
    duration: "12h 05m",
    rating: 4.8,
    students: 2410,
    description:
      "Maîtrisez les patterns avancés de React, l'optimisation des renders et l'architecture d'apps complexes.",
    chapters: [
      { title: "Render & reconciliation", duration: "28m", done: true },
      { title: "Memoization stratégique", duration: "34m", done: true },
      { title: "State machines avec XState", duration: "46m", done: false },
      { title: "Suspense & streaming", duration: "40m", done: false },
    ],
  },
  {
    id: "data-viz",
    title: "Data Visualization avec D3 & Observable",
    category: "Data",
    level: "Intermédiaire",
    teacher: "Sofia Marín",
    teacherAvatar: "SM",
    cover: "linear-gradient(135deg,#f43f5e,#f59e0b)",
    progress: 12,
    lessons: 18,
    duration: "6h 40m",
    rating: 4.7,
    students: 842,
    description:
      "Transformez vos données en récits visuels percutants à l'aide de D3.js et des bonnes pratiques de dataviz.",
    chapters: [
      { title: "Les bases de D3", duration: "20m", done: true },
      { title: "Scales & axes", duration: "28m", done: false },
      { title: "Interactions & animations", duration: "36m", done: false },
    ],
  },
  {
    id: "ux-research",
    title: "UX Research : du terrain à la décision produit",
    category: "Design",
    level: "Débutant",
    teacher: "Léa Tanaka",
    teacherAvatar: "LT",
    cover: "linear-gradient(135deg,#22c55e,#06b6d4)",
    progress: 88,
    lessons: 16,
    duration: "5h 10m",
    rating: 4.9,
    students: 612,
    description:
      "Conduisez des recherches utilisateurs solides et alignez votre équipe produit autour d'insights actionnables.",
    chapters: [
      { title: "Cadrer la recherche", duration: "16m", done: true },
      { title: "Recruter les bons profils", duration: "22m", done: true },
      { title: "Conduire l'entretien", duration: "34m", done: true },
      { title: "Synthèse & restitution", duration: "28m", done: false },
    ],
  },
  {
    id: "product-strategy",
    title: "Stratégie Produit pour PM ambitieux",
    category: "Produit",
    level: "Avancé",
    teacher: "Hugo Lefèvre",
    teacherAvatar: "HL",
    cover: "linear-gradient(135deg,#a855f7,#ec4899)",
    progress: 5,
    lessons: 22,
    duration: "9h 30m",
    rating: 4.8,
    students: 1530,
    description:
      "Définissez une vision produit claire, priorisez efficacement et alignez vos équipes sur l'impact business.",
    chapters: [
      { title: "Vision & North Star", duration: "26m", done: false },
      { title: "Discovery continue", duration: "32m", done: false },
    ],
  },
  {
    id: "writing",
    title: "Écriture claire pour produits numériques",
    category: "Contenu",
    level: "Débutant",
    teacher: "Inès Costa",
    teacherAvatar: "IC",
    cover: "linear-gradient(135deg,#0f172a,#3b82f6)",
    progress: 47,
    lessons: 14,
    duration: "4h 25m",
    rating: 4.7,
    students: 980,
    description:
      "Apprenez à écrire pour vos utilisateurs : microcopie, onboarding, emails et documentation produit.",
    chapters: [
      { title: "Principes de clarté", duration: "18m", done: true },
      { title: "Microcopie & UI text", duration: "24m", done: true },
      { title: "Tone of voice", duration: "20m", done: false },
    ],
  },
];

export const upcomingSchedule = [
  {
    id: "1",
    title: "Live : Tokens en production",
    teacher: "Amélie Rousseau",
    time: "Aujourd'hui · 14:00",
    duration: "60 min",
    type: "Live",
    color: "bg-primary/10 text-primary",
  },
  {
    id: "2",
    title: "Atelier React Profiler",
    teacher: "Karim Benali",
    time: "Demain · 10:30",
    duration: "90 min",
    type: "Atelier",
    color: "bg-success/10 text-success",
  },
  {
    id: "3",
    title: "Examen — UX Research",
    teacher: "Léa Tanaka",
    time: "Jeudi · 09:00",
    duration: "45 min",
    type: "Examen",
    color: "bg-warning/15 text-warning-foreground",
  },
  {
    id: "4",
    title: "Q&A Stratégie produit",
    teacher: "Hugo Lefèvre",
    time: "Vendredi · 17:00",
    duration: "60 min",
    type: "Live",
    color: "bg-primary/10 text-primary",
  },
];

export type ExerciseStep = {
  prompt: string;
  hint?: string;
  solution: string;
};

export type Exercise = {
  id: string;
  courseId: string;
  course: string;
  title: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  duration: string;
  status: "À faire" | "En cours" | "Terminé";
  progress: number;
  objective: string;
  steps: ExerciseStep[];
};

export const exercises: Exercise[] = [
  {
    id: "e1",
    courseId: "design-systems",
    course: "Design Systems modernes",
    title: "Auditer un composant Button",
    level: "Intermédiaire",
    duration: "25 min",
    status: "En cours",
    progress: 40,
    objective: "Identifier les incohérences d'un composant Button et proposer une refonte basée sur les tokens.",
    steps: [
      { prompt: "Listez 3 variantes manquantes au composant.", hint: "Pensez aux états destructifs et fantômes.", solution: "destructive, ghost, link" },
      { prompt: "Quel token utiliser pour le radius ?", solution: "--radius-md" },
      { prompt: "Décrivez la hiérarchie focus visible.", solution: "ring 2px primary + offset 2px" },
    ],
  },
  {
    id: "e2",
    courseId: "react-advanced",
    course: "React Avancé",
    title: "Optimiser une liste de 10k items",
    level: "Avancé",
    duration: "45 min",
    status: "À faire",
    progress: 0,
    objective: "Utiliser virtualization et memo pour maintenir 60fps sur une large liste.",
    steps: [
      { prompt: "Quelle lib pour la virtualization ?", solution: "@tanstack/react-virtual" },
      { prompt: "Quel hook pour stabiliser les callbacks ?", solution: "useCallback" },
      { prompt: "Comment éviter les re-renders enfants ?", solution: "React.memo + props stables" },
    ],
  },
  {
    id: "e3",
    courseId: "ux-research",
    course: "UX Research",
    title: "Rédiger un guide d'entretien",
    level: "Débutant",
    duration: "20 min",
    status: "Terminé",
    progress: 100,
    objective: "Construire un guide semi-directif clair et actionnable.",
    steps: [
      { prompt: "Combien de thèmes max ?", solution: "3 à 5" },
      { prompt: "Type de questions à éviter ?", solution: "Questions fermées ou orientées" },
    ],
  },
  {
    id: "e4",
    courseId: "data-viz",
    course: "Data Visualization",
    title: "Créer une scale temporelle D3",
    level: "Intermédiaire",
    duration: "30 min",
    status: "À faire",
    progress: 0,
    objective: "Mettre en place une scaleTime adaptée à une série quotidienne.",
    steps: [
      { prompt: "Quelle scale pour des dates ?", solution: "d3.scaleTime()" },
      { prompt: "Comment définir le domaine ?", solution: "d3.extent(data, d => d.date)" },
    ],
  },
  {
    id: "e5",
    courseId: "writing",
    course: "Écriture produit",
    title: "Réécrire un onboarding",
    level: "Débutant",
    duration: "15 min",
    status: "Terminé",
    progress: 100,
    objective: "Clarifier 3 écrans d'onboarding en réduisant la charge cognitive.",
    steps: [
      { prompt: "Règle d'or de la microcopie ?", solution: "Clarté > créativité" },
    ],
  },
  {
    id: "e6",
    courseId: "react-advanced",
    course: "React Avancé",
    title: "Implémenter Suspense avec streaming",
    level: "Avancé",
    duration: "35 min",
    status: "À faire",
    progress: 0,
    objective: "Découper la page en boundaries Suspense pour du streaming SSR.",
    steps: [
      { prompt: "Composant React pour les fallbacks ?", solution: "<Suspense fallback={...}>" },
      { prompt: "API serveur pour streamer ?", solution: "renderToPipeableStream" },
    ],
  },
];

export const notifications = [
  { id: "n1", title: "Nouvelle leçon publiée", body: "Patterns d'interaction est disponible.", time: "Il y a 12 min" },
  { id: "n2", title: "Amélie a répondu", body: "« Très bonne question sur les tokens… »", time: "Il y a 1h" },
  { id: "n3", title: "Examen à venir", body: "UX Research — jeudi à 09:00", time: "Hier" },
];

export type ExamQuestion = {
  id: string;
  prompt: string;
  choices: { id: string; label: string }[];
  correctId: string;
  explanation?: string;
};

export type Exam = {
  id: string;
  courseId: string;
  course: string;
  title: string;
  teacher: string;
  date: string; // ISO
  duration: string;
  durationMinutes: number;
  questionsCount: number;
  description: string;
  questions: ExamQuestion[];
};

export const exams: Exam[] = [
  {
    id: "exam-ux-research",
    courseId: "ux-research",
    course: "UX Research",
    title: "Examen final — UX Research",
    teacher: "Léa Tanaka",
    date: "2026-05-28T09:00:00.000Z",
    duration: "45 min",
    durationMinutes: 45,
    questionsCount: 4,
    description:
      "Validez vos acquis sur le cadrage de recherche, le recrutement et l'analyse d'entretiens utilisateurs.",
    questions: [
      {
        id: "q1",
        prompt: "Quel est le bon nombre maximal de thèmes pour un guide d'entretien semi-directif ?",
        choices: [
          { id: "a", label: "1 à 2" },
          { id: "b", label: "3 à 5" },
          { id: "c", label: "8 à 10" },
          { id: "d", label: "Aucune limite" },
        ],
        correctId: "b",
        explanation: "3 à 5 thèmes permettent de couvrir le sujet sans saturer le participant.",
      },
      {
        id: "q2",
        prompt: "Quel type de question doit-on éviter en entretien exploratoire ?",
        choices: [
          { id: "a", label: "Questions ouvertes" },
          { id: "b", label: "Questions de relance" },
          { id: "c", label: "Questions fermées et orientées" },
          { id: "d", label: "Questions sur le contexte" },
        ],
        correctId: "c",
        explanation: "Les questions fermées orientées biaisent la réponse de l'utilisateur.",
      },
      {
        id: "q3",
        prompt: "Combien de participants minimum pour identifier ~80% des problèmes d'usabilité ?",
        choices: [
          { id: "a", label: "2" },
          { id: "b", label: "5" },
          { id: "c", label: "12" },
          { id: "d", label: "20" },
        ],
        correctId: "b",
        explanation: "La règle de Nielsen : 5 utilisateurs suffisent pour repérer la majorité des problèmes.",
      },
      {
        id: "q4",
        prompt: "Quel livrable synthétise au mieux les insights pour l'équipe produit ?",
        choices: [
          { id: "a", label: "Verbatim brut" },
          { id: "b", label: "Affinity map + insights priorisés" },
          { id: "c", label: "Transcription complète" },
          { id: "d", label: "Enregistrement vidéo" },
        ],
        correctId: "b",
        explanation: "L'affinity map regroupe les observations et fait émerger les insights actionnables.",
      },
    ],
  },
  {
    id: "exam-design-systems",
    courseId: "design-systems",
    course: "Design Systems modernes",
    title: "Quiz — Tokens & Composants",
    teacher: "Amélie Rousseau",
    date: "2026-06-02T14:00:00.000Z",
    duration: "30 min",
    durationMinutes: 30,
    questionsCount: 3,
    description: "Vérifiez votre maîtrise des tokens, variantes et gouvernance d'un design system.",
    questions: [
      {
        id: "q1",
        prompt: "Quel token utilise-t-on pour définir un radius moyen partagé ?",
        choices: [
          { id: "a", label: "--color-md" },
          { id: "b", label: "--radius-md" },
          { id: "c", label: "--spacing-md" },
          { id: "d", label: "--font-md" },
        ],
        correctId: "b",
        explanation: "Les tokens de rayon suivent la convention --radius-{taille}.",
      },
      {
        id: "q2",
        prompt: "Quelle variante de Button est généralement utilisée pour une action irréversible ?",
        choices: [
          { id: "a", label: "ghost" },
          { id: "b", label: "link" },
          { id: "c", label: "destructive" },
          { id: "d", label: "secondary" },
        ],
        correctId: "c",
      },
      {
        id: "q3",
        prompt: "Quel anneau de focus offre la meilleure accessibilité ?",
        choices: [
          { id: "a", label: "Aucune indication" },
          { id: "b", label: "Ring 2px primary + offset 2px" },
          { id: "c", label: "Underline texte" },
          { id: "d", label: "Changement d'opacité" },
        ],
        correctId: "b",
        explanation: "Un ring visible avec offset garantit la conformité WCAG.",
      },
    ],
  },
  {
    id: "exam-react-advanced",
    courseId: "react-advanced",
    course: "React Avancé",
    title: "Examen — Performance React",
    teacher: "Karim Benali",
    date: "2026-06-10T10:30:00.000Z",
    duration: "60 min",
    durationMinutes: 60,
    questionsCount: 3,
    description: "Mesurez votre compréhension du rendu, de la mémoïsation et des patterns avancés.",
    questions: [
      {
        id: "q1",
        prompt: "Quelle librairie est recommandée pour virtualiser une longue liste en React ?",
        choices: [
          { id: "a", label: "react-spring" },
          { id: "b", label: "@tanstack/react-virtual" },
          { id: "c", label: "redux-toolkit" },
          { id: "d", label: "zustand" },
        ],
        correctId: "b",
      },
      {
        id: "q2",
        prompt: "Quel hook stabilise une fonction passée en prop pour éviter les re-renders ?",
        choices: [
          { id: "a", label: "useMemo" },
          { id: "b", label: "useEffect" },
          { id: "c", label: "useCallback" },
          { id: "d", label: "useRef" },
        ],
        correctId: "c",
      },
      {
        id: "q3",
        prompt: "Quelle API permet de streamer le rendu SSR avec Suspense ?",
        choices: [
          { id: "a", label: "renderToString" },
          { id: "b", label: "hydrateRoot" },
          { id: "c", label: "renderToPipeableStream" },
          { id: "d", label: "createRoot" },
        ],
        correctId: "c",
      },
    ],
  },
];

/**
 * @typedef {Object} Puzzle
 * @property {string} id
 * @property {string} answer
 * @property {[string, string]} componentWords
 * @property {string} leftImage
 * @property {string} rightImage
 * @property {string} category
 * @property {"easy" | "medium" | "hard"} difficulty
 * @property {string} hint
 * @property {boolean} active
 */

/**
 * The complete local puzzle catalogue. This is the single source of truth
 * for puzzle IDs on the facilitator app - the backend only ever stores
 * these IDs (and their order) in a game session, never the puzzle content.
 *
 * @type {Puzzle[]}
 */
export const puzzles = [
  {
    id: 'rainbow',
    answer: 'Rainbow',
    componentWords: ['Rain', 'Bow'],
    leftImage: '/puzzleImage/rain.jpg',
    rightImage: '/puzzleImage/bow.png',
    category: 'Nature',
    difficulty: 'easy',
    hint: 'Appears in the sky after it rains.',
    active: true,
  },
  {
    id: 'starfish',
    answer: 'Starfish',
    componentWords: ['Star', 'Fish'],
    leftImage: '/puzzleImage/star.png',
    rightImage: '/puzzleImage/fish.png',
    category: 'Nature',
    difficulty: 'easy',
    hint: 'A sea creature shaped like a star.',
    active: true,
  },
  {
    id: 'the-lion-king',
    answer: 'The Lion King',
    componentWords: ['Lion', 'King'],
    leftImage: '/puzzleImage/lion.png',
    rightImage: '/puzzleImage/king.png',
    category: 'Movie',
    difficulty: 'medium',
    hint: 'A classic Disney movie about a young lion prince.',
    active: true,
  },
  {
    id: 'spider-man',
    answer: 'Spider-Man',
    componentWords: ['Spider', 'Man'],
    leftImage: '/puzzleImage/spider.png',
    rightImage: '/puzzleImage/man.png',
    category: 'Superhero',
    difficulty: 'easy',
    hint: 'A superhero who climbs walls and shoots webs.',
    active: true,
  },
  {
    id: 'toothbrush',
    answer: 'Toothbrush',
    componentWords: ['Tooth', 'Brush'],
    leftImage: '/puzzleImage/tooth.png',
    rightImage: '/puzzleImage/brush.png',
    category: 'Object',
    difficulty: 'easy',
    hint: 'You use this to clean your teeth.',
    active: true,
  },
  {
    id: 'butterfly',
    answer: 'Butterfly',
    componentWords: ['Butter', 'Fly'],
    leftImage: '/puzzleImage/butter.png',
    rightImage: '/puzzleImage/fly.png',
    category: 'Nature',
    difficulty: 'easy',
    hint: 'A colorful insect that starts out as a caterpillar.',
    active: true,
  },
  {
    id: 'honeymoon',
    answer: 'Honeymoon',
    componentWords: ['Honey', 'Moon'],
    leftImage: '/puzzleImage/honey.png',
    rightImage: '/puzzleImage/moon.png',
    category: 'Event',
    difficulty: 'medium',
    hint: 'A trip newlyweds take after their wedding.',
    active: true,
  },
  {
    id: 'fireman',
    answer: 'Fireman',
    componentWords: ['Fire', 'Man'],
    leftImage: '/puzzleImage/fire.svg',
    rightImage: '/puzzleImage/man.png',
    category: 'Occupation',
    difficulty: 'easy',
    hint: 'This person puts out fires and rescues people.',
    active: true,
  },
  {
    id: 'facebook',
    answer: 'Facebook',
    componentWords: ['Face', 'Book'],
    leftImage: '/puzzleImage/face.png',
    rightImage: '/puzzleImage/book.png',
    category: 'Technology',
    difficulty: 'medium',
    hint: 'A popular social media platform.',
    active: true,
  },
  {
    id: 'basketball',
    answer: 'Basketball',
    componentWords: ['Basket', 'Ball'],
    leftImage: '/puzzleImage/basket.png',
    rightImage: '/puzzleImage/ball.png',
    category: 'Sport',
    difficulty: 'easy',
    hint: 'A sport where players shoot a ball through a hoop.',
    active: true,
  },
]

/** IDs of every puzzle in the catalogue, in canonical order. */
export const puzzleIds = puzzles.map((puzzle) => puzzle.id)

/** Puzzles currently available for a facilitator to include in a game. */
export const activePuzzles = puzzles.filter((puzzle) => puzzle.active)

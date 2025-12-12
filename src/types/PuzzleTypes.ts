export const PuzzleType = {
    CONNECT_DOTS: 'connect-dots',
    SCIENTIFIC_MCQ: 'scientific-mcq',
    NATIONAL_GK: 'national-gk',
    CIRCUIT_LOGIC: 'circuit-logic',
    MATH_TEASERS: 'math-teasers',
    CODE_DEBUG: 'code-debug',
    PHYSICS_PROBLEMS: 'physics-problems',
    PATTERN_RECOGNITION: 'pattern-recognition',
    UNIT_CONVERSION: 'unit-conversion',
    ENGINEERING_ETHICS: 'engineering-ethics',
    PCB_ROUTING: 'pcb-routing',
    ENGINEERING_WORDLE: 'engineering-wordle',
    ENGINEERING_CROSSWORD: 'engineering-crossword'
} as const;
export type PuzzleType = typeof PuzzleType[keyof typeof PuzzleType];

export const PuzzleDifficulty = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
} as const;
export type PuzzleDifficulty = typeof PuzzleDifficulty[keyof typeof PuzzleDifficulty];

export const PuzzleStatus = {
    NOT_STARTED: 'not-started',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    WON: 'won'
} as const;
export type PuzzleStatus = typeof PuzzleStatus[keyof typeof PuzzleStatus];

export interface MCQChoice {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface MCQQuestion {
    id: string;
    question: string;
    choices: MCQChoice[];
    explanation?: string;
}

export interface DotCoordinate {
    id: number;
    x: number;
    y: number;
}

export interface GridCoordinate {
    row: number;
    col: number;
}

export interface PinPair {
    id: number;
    color: string;
    start: GridCoordinate;
    end: GridCoordinate;
}

export interface CrosswordClue {
    number: number;
    text: string;
    answer: string;
    row: number;
    col: number;
    direction: 'across' | 'down';
}

export interface Puzzle {
    id: string;
    title: string;
    description: string;
    type: PuzzleType;
    difficulty: PuzzleDifficulty;
    icon: string;
    questions?: MCQQuestion[];
    dots?: DotCoordinate[];
    gridSize?: number;
    pins?: PinPair[];
    targetWord?: string;
    crosswordClues?: CrosswordClue[];
    hints: string[];
    timeLimit?: number; // in seconds
    passingScore?: number; // percentage for MCQ puzzles
    revealImage?: string; // URL for image to reveal on completion
}

export interface PuzzleAttempt {
    puzzleId: string;
    userId: string;
    attemptNumber: number;
    timestamp: number;
    isCorrect: boolean;
    score?: number;
    timeSpent?: number;
    usedHints: boolean;
}

export interface WinnerEntry {
    puzzleId: string;
    userId: string;
    userName: string;
    timestamp: number;
    score?: number;
    timeSpent?: number;
}

export interface UserProgress {
    userId: string;
    userName: string;
    attempts: { [puzzleId: string]: PuzzleAttempt[] };
    completedPuzzles: string[];
    wonPuzzles: string[];
}

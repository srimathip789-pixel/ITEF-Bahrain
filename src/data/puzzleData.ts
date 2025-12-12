import { PuzzleType, PuzzleDifficulty, type Puzzle, type MCQQuestion } from '../types/PuzzleTypes';

// Get a stable daily word index (same word for entire day)
const getDailyWordIndex = (wordCount: number): number => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return seed % wordCount;
};

// Engineering Wordle - Multiple words to choose from
const engineeringWords = ['DIODE', 'RELAY', 'VALVE', 'MOTOR', 'LASER', 'SERVO', 'ALLOY', 'FORCE'];

// Electronics Fundamentals Questions
const electronicsQuestions: MCQQuestion[] = [
    {
        id: 'e1',
        question: "What component allows current to flow in only one direction?",
        choices: [
            { id: 'a', text: 'Resistor', isCorrect: false },
            { id: 'b', text: 'Diode', isCorrect: true },
            { id: 'c', text: 'Capacitor', isCorrect: false },
            { id: 'd', text: 'Inductor', isCorrect: false }
        ],
        explanation: "A diode is a semiconductor device that allows current flow in one direction while blocking it in the opposite direction."
    },
    {
        id: 'e2',
        question: "What is the unit of electrical resistance?",
        choices: [
            { id: 'a', text: 'Ampere', isCorrect: false },
            { id: 'b', text: 'Volt', isCorrect: false },
            { id: 'c', text: 'Ohm', isCorrect: true },
            { id: 'd', text: 'Watt', isCorrect: false }
        ],
        explanation: "The Ohm (Ω) is the SI unit of electrical resistance, named after Georg Ohm."
    },
    {
        id: 'e3',
        question: "Which law states V = IR?",
        choices: [
            { id: 'a', text: "Kirchhoff's Law", isCorrect: false },
            { id: 'b', text: "Ohm's Law", isCorrect: true },
            { id: 'c', text: "Faraday's Law", isCorrect: false },
            { id: 'd', text: "Lenz's Law", isCorrect: false }
        ],
        explanation: "Ohm's Law states that voltage (V) equals current (I) times resistance (R)."
    },
    {
        id: 'e4',
        question: "What does a capacitor store?",
        choices: [
            { id: 'a', text: 'Current', isCorrect: false },
            { id: 'b', text: 'Voltage', isCorrect: false },
            { id: 'c', text: 'Electrical charge', isCorrect: true },
            { id: 'd', text: 'Magnetic field', isCorrect: false }
        ],
        explanation: "A capacitor stores electrical energy in an electric field by accumulating charge on its plates."
    },
    {
        id: 'e5',
        question: "What is the symbol for a resistor in a circuit diagram?",
        choices: [
            { id: 'a', text: 'Zigzag line', isCorrect: true },
            { id: 'b', text: 'Straight line', isCorrect: false },
            { id: 'c', text: 'Circle', isCorrect: false },
            { id: 'd', text: 'Triangle', isCorrect: false }
        ],
        explanation: "A resistor is typically represented by a zigzag line in circuit diagrams."
    },
    {
        id: 'e6',
        question: "What type of current does a battery provide?",
        choices: [
            { id: 'a', text: 'Alternating Current (AC)', isCorrect: false },
            { id: 'b', text: 'Direct Current (DC)', isCorrect: true },
            { id: 'c', text: 'Pulsating Current', isCorrect: false },
            { id: 'd', text: 'No current', isCorrect: false }
        ],
        explanation: "Batteries provide Direct Current (DC), which flows in one constant direction."
    },
    {
        id: 'e7',
        question: "What is the power formula in electrical circuits?",
        choices: [
            { id: 'a', text: 'P = V + I', isCorrect: false },
            { id: 'b', text: 'P = V - I', isCorrect: false },
            { id: 'c', text: 'P = V × I', isCorrect: true },
            { id: 'd', text: 'P = V ÷ I', isCorrect: false }
        ],
        explanation: "Power (P) in watts equals voltage (V) times current (I): P = V × I"
    },
    {
        id: 'e8',
        question: "What component is used to amplify signals?",
        choices: [
            { id: 'a', text: 'Resistor', isCorrect: false },
            { id: 'b', text: 'Capacitor', isCorrect: false },
            { id: 'c', text: 'Transistor', isCorrect: true },
            { id: 'd', text: 'Diode', isCorrect: false }
        ],
        explanation: "Transistors are semiconductor devices used to amplify or switch electronic signals."
    },
    {
        id: 'e9',
        question: "What is the voltage of a standard AA battery?",
        choices: [
            { id: 'a', text: '1.2V', isCorrect: false },
            { id: 'b', text: '1.5V', isCorrect: true },
            { id: 'c', text: '3V', isCorrect: false },
            { id: 'd', text: '9V', isCorrect: false }
        ],
        explanation: "A standard AA alkaline battery provides 1.5 volts."
    },
    {
        id: 'e10',
        question: "Which material is commonly used in electrical wiring?",
        choices: [
            { id: 'a', text: 'Aluminum', isCorrect: false },
            { id: 'b', text: 'Copper', isCorrect: true },
            { id: 'c', text: 'Gold', isCorrect: false },
            { id: 'd', text: 'Silver', isCorrect: false }
        ],
        explanation: "Copper is the most commonly used material for electrical wiring due to its excellent conductivity and cost-effectiveness."
    }
];

// Programming & Logic Questions
const programmingQuestions: MCQQuestion[] = [
    {
        id: 'p1',
        question: "What data structure uses LIFO (Last In, First Out)?",
        choices: [
            { id: 'a', text: 'Queue', isCorrect: false },
            { id: 'b', text: 'Stack', isCorrect: true },
            { id: 'c', text: 'Array', isCorrect: false },
            { id: 'd', text: 'Tree', isCorrect: false }
        ],
        explanation: "A Stack follows the Last In, First Out (LIFO) principle, like a stack of plates."
    },
    {
        id: 'p2',
        question: "What is the time complexity of binary search?",
        choices: [
            { id: 'a', text: 'O(n)', isCorrect: false },
            { id: 'b', text: 'O(log n)', isCorrect: true },
            { id: 'c', text: 'O(n²)', isCorrect: false },
            { id: 'd', text: 'O(1)', isCorrect: false }
        ],
        explanation: "Binary search has O(log n) time complexity as it divides the search space in half each iteration."
    },
    {
        id: 'p3',
        question: "Which programming paradigm focuses on objects and classes?",
        choices: [
            { id: 'a', text: 'Functional', isCorrect: false },
            { id: 'b', text: 'Procedural', isCorrect: false },
            { id: 'c', text: 'Object-Oriented', isCorrect: true },
            { id: 'd', text: 'Logic', isCorrect: false }
        ],
        explanation: "Object-Oriented Programming (OOP) organizes code around objects and classes."
    },
    {
        id: 'p4',
        question: "What does SQL stand for?",
        choices: [
            { id: 'a', text: 'Structured Query Language', isCorrect: true },
            { id: 'b', text: 'Simple Query Language', isCorrect: false },
            { id: 'c', text: 'System Query Logic', isCorrect: false },
            { id: 'd', text: 'Standard Question List', isCorrect: false }
        ],
        explanation: "SQL stands for Structured Query Language, used for managing relational databases."
    },
    {
        id: 'p5',
        question: "Which loop structure checks the condition before execution?",
        choices: [
            { id: 'a', text: 'do-while', isCorrect: false },
            { id: 'b', text: 'while', isCorrect: true },
            { id: 'c', text: 'for', isCorrect: false },
            { id: 'd', text: 'Both b and c', isCorrect: false }
        ],
        explanation: "A while loop checks the condition before executing the loop body."
    },
    {
        id: 'p6',
        question: "What is recursion in programming?",
        choices: [
            { id: 'a', text: 'A loop that never ends', isCorrect: false },
            { id: 'b', text: 'A function calling itself', isCorrect: true },
            { id: 'c', text: 'An error in code', isCorrect: false },
            { id: 'd', text: 'A type of variable', isCorrect: false }
        ],
        explanation: "Recursion is when a function calls itself to solve a problem by breaking it into smaller sub-problems."
    },
    {
        id: 'p7',
        question: "Which sorting algorithm has the best average-case time complexity?",
        choices: [
            { id: 'a', text: 'Bubble Sort', isCorrect: false },
            { id: 'b', text: 'Quick Sort', isCorrect: true },
            { id: 'c', text: 'Selection Sort', isCorrect: false },
            { id: 'd', text: 'Insertion Sort', isCorrect: false }
        ],
        explanation: "Quick Sort has an average time complexity of O(n log n), making it one of the fastest sorting algorithms."
    },
    {
        id: 'p8',
        question: "What is an API?",
        choices: [
            { id: 'a', text: 'Application Programming Interface', isCorrect: true },
            { id: 'b', text: 'Automated Program Instruction', isCorrect: false },
            { id: 'c', text: 'Advanced Programming Integration', isCorrect: false },
            { id: 'd', text: 'Application Process Indicator', isCorrect: false }
        ],
        explanation: "API stands for Application Programming Interface, a set of protocols for building software applications."
    },
    {
        id: 'p9',
        question: "What does IDE stand for?",
        choices: [
            { id: 'a', text: 'Integrated Development Environment', isCorrect: true },
            { id: 'b', text: 'Internal Design Editor', isCorrect: false },
            { id: 'c', text: 'Interactive Development Engine', isCorrect: false },
            { id: 'd', text: 'Internet Data Exchange', isCorrect: false }
        ],
        explanation: "IDE stands for Integrated Development Environment, software for building applications."
    },
    {
        id: 'p10',
        question: "Which data type stores true/false values?",
        choices: [
            { id: 'a', text: 'Integer', isCorrect: false },
            { id: 'b', text: 'String', isCorrect: false },
            { id: 'c', text: 'Boolean', isCorrect: true },
            { id: 'd', text: 'Float', isCorrect: false }
        ],
        explanation: "Boolean is a data type that can only hold two values: true or false."
    }
];

// Digital Electronics Questions
const digitalElectronicsQuestions: MCQQuestion[] = [
    {
        id: 'd1',
        question: "What is the output of an AND gate when both inputs are 1?",
        choices: [
            { id: 'a', text: '0', isCorrect: false },
            { id: 'b', text: '1', isCorrect: true },
            { id: 'c', text: 'Undefined', isCorrect: false },
            { id: 'd', text: 'Either 0 or 1', isCorrect: false }
        ],
        explanation: "An AND gate outputs 1 only when both inputs are 1."
    },
    {
        id: 'd2',
        question: "Which gate inverts the input signal?",
        choices: [
            { id: 'a', text: 'AND', isCorrect: false },
            { id: 'b', text: 'OR', isCorrect: false },
            { id: 'c', text: 'NOT', isCorrect: true },
            { id: 'd', text: 'XOR', isCorrect: false }
        ],
        explanation: "A NOT gate (inverter) produces the opposite of the input: 0→1 and 1→0."
    },
    {
        id: 'd3',
        question: "What does XOR stand for?",
        choices: [
            { id: 'a', text: 'Extra OR', isCorrect: false },
            { id: 'b', text: 'Exclusive OR', isCorrect: true },
            { id: 'c', text: 'Extended OR', isCorrect: false },
            { id: 'd', text: 'Extreme OR', isCorrect: false }
        ],
        explanation: "XOR stands for Exclusive OR, which outputs 1 when inputs are different."
    },
    {
        id: 'd4',
        question: "How many rows are in a truth table for a 3-input gate?",
        choices: [
            { id: 'a', text: '3', isCorrect: false },
            { id: 'b', text: '6', isCorrect: false },
            { id: 'c', text: '8', isCorrect: true },
            { id: 'd', text: '9', isCorrect: false }
        ],
        explanation: "A truth table for n inputs has 2^n rows. For 3 inputs: 2³ = 8 rows."
    },
    {
        id: 'd5',
        question: "What is a flip-flop in digital electronics?",
        choices: [
            { id: 'a', text: 'A combinational circuit', isCorrect: false },
            { id: 'b', text: 'A memory element', isCorrect: true },
            { id: 'c', text: 'A type of gate', isCorrect: false },
            { id: 'd', text: 'An error condition', isCorrect: false }
        ],
        explanation: "A flip-flop is a sequential circuit that can store one bit of information."
    },
    {
        id: 'd6',
        question: "What is the binary representation of decimal 10?",
        choices: [
            { id: 'a', text: '1010', isCorrect: true },
            { id: 'b', text: '1100', isCorrect: false },
            { id: 'c', text: '1001', isCorrect: false },
            { id: 'd', text: '1111', isCorrect: false }
        ],
        explanation: "Decimal 10 = 8 + 2 = 2³ + 2¹ = 1010 in binary."
    },
    {
        id: 'd7',
        question: "What does NAND gate stand for?",
        choices: [
            { id: 'a', text: 'Negative AND', isCorrect: false },
            { id: 'b', text: 'NOT AND', isCorrect: true },
            { id: 'c', text: 'New AND', isCorrect: false },
            { id: 'd', text: 'Next AND', isCorrect: false }
        ],
        explanation: "NAND means NOT AND - it's an AND gate followed by a NOT gate."
    },
    {
        id: 'd8',
        question: "Which number system uses base 16?",
        choices: [
            { id: 'a', text: 'Binary', isCorrect: false },
            { id: 'b', text: 'Octal', isCorrect: false },
            { id: 'c', text: 'Decimal', isCorrect: false },
            { id: 'd', text: 'Hexadecimal', isCorrect: true }
        ],
        explanation: "Hexadecimal uses base 16, with digits 0-9 and letters A-F."
    },
    {
        id: 'd9',
        question: "What is a multiplexer?",
        choices: [
            { id: 'a', text: 'A device that selects one of many inputs', isCorrect: true },
            { id: 'b', text: 'A type of memory', isCorrect: false },
            { id: 'c', text: 'A power supply', isCorrect: false },
            { id: 'd', text: 'An amplifier', isCorrect: false }
        ],
        explanation: "A multiplexer (MUX) selects one of several input signals and forwards it to a single output."
    },
    {
        id: 'd10',
        question: "What is the output of an OR gate when one input is 1?",
        choices: [
            { id: 'a', text: '0', isCorrect: false },
            { id: 'b', text: '1', isCorrect: true },
            { id: 'c', text: 'Depends on other input', isCorrect: false },
            { id: 'd', text: 'Undefined', isCorrect: false }
        ],
        explanation: "An OR gate outputs 1 if at least one input is 1."
    }
];

// Mechanical Engineering Questions
const mechanicalQuestions: MCQQuestion[] = [
    {
        id: 'm1',
        question: "What is the formula for calculating stress?",
        choices: [
            { id: 'a', text: 'Force × Area', isCorrect: false },
            { id: 'b', text: 'Force / Area', isCorrect: true },
            { id: 'c', text: 'Area / Force', isCorrect: false },
            { id: 'd', text: 'Force + Area', isCorrect: false }
        ],
        explanation: "Stress (σ) is calculated as Force (F) divided by Area (A): σ = F/A"
    },
    {
        id: 'm2',
        question: "What is the SI unit of force?",
        choices: [
            { id: 'a', text: 'Joule', isCorrect: false },
            { id: 'b', text: 'Newton', isCorrect: true },
            { id: 'c', text: 'Pascal', isCorrect: false },
            { id: 'd', text: 'Watt', isCorrect: false }
        ],
        explanation: "The Newton (N) is the SI unit of force, defined as kg·m/s²."
    },
    {
        id: 'm3',
        question: "What type of stress occurs when a material is twisted?",
        choices: [
            { id: 'a', text: 'Tensile stress', isCorrect: false },
            { id: 'b', text: 'Compressive stress', isCorrect: false },
            { id: 'c', text: 'Shear stress', isCorrect: true },
            { id: 'd', text: 'Bending stress', isCorrect: false }
        ],
        explanation: "Torsion creates shear stress in a material, causing it to twist."
    },
    {
        id: 'm4',
        question: "What is the work-energy principle?",
        choices: [
            { id: 'a', text: 'Work equals energy', isCorrect: false },
            { id: 'b', text: 'Work done equals change in kinetic energy', isCorrect: true },
            { id: 'c', text: 'Work cancels energy', isCorrect: false },
            { id: 'd', text: 'Energy creates work', isCorrect: false }
        ],
        explanation: "The work-energy principle states that the net work done on an object equals its change in kinetic energy."
    },
    {
        id: 'm5',
        question: "Which material property describes resistance to deformation?",
        choices: [
            { id: 'a', text: 'Ductility', isCorrect: false },
            { id: 'b', text: 'Hardness', isCorrect: true },
            { id: 'c', text: 'Malleability', isCorrect: false },
            { id: 'd', text: 'Brittleness', isCorrect: false }
        ],
        explanation: "Hardness is a materials resistance to localized plastic deformation."
    },
    {
        id: 'm6',
        question: "What is the efficiency formula?",
        choices: [
            { id: 'a', text: 'Output / Input', isCorrect: true },
            { id: 'b', text: 'Input / Output', isCorrect: false },
            { id: 'c', text: 'Output × Input', isCorrect: false },
            { id: 'd', text: 'Output - Input', isCorrect: false }
        ],
        explanation: "Efficiency = (Useful Output / Total Input) × 100%"
    },
    {
        id: 'm7',
        question: "What does CNC stand for in manufacturing?",
        choices: [
            { id: 'a', text: 'Computer Numerical Control', isCorrect: true },
            { id: 'b', text: 'Central Network Computer', isCorrect: false },
            { id: 'c', text: 'Controllable Number Cutter', isCorrect: false },
            { id: 'd', text: 'Computerized Natural Cutting', isCorrect: false }
        ],
        explanation: "CNC stands for Computer Numerical Control, used in automated machining."
    },
    {
        id: 'm8',
        question: "What is moment of inertia?",
        choices: [
            { id: 'a', text: 'Resistance to linear motion', isCorrect: false },
            { id: 'b', text: 'Resistance to rotational motion', isCorrect: true },
            { id: 'c', text: 'Mass times velocity', isCorrect: false },
            { id: 'd', text: 'Force times distance', isCorrect: false }
        ],
        explanation: "Moment of inertia is a bodys resistance to rotational acceleration."
    },
    {
        id: 'm9',
        question: "What is the gear ratio formula?",
        choices: [
            { id: 'a', text: 'Driven teeth / Driver teeth', isCorrect: true },
            { id: 'b', text: 'Driver teeth / Driven teeth', isCorrect: false },
            { id: 'c', text: 'Driver teeth × Driven teeth', isCorrect: false },
            { id: 'd', text: 'Driver teeth + Driven teeth', isCorrect: false }
        ],
        explanation: "Gear ratio = Number of teeth on driven gear / Number of teeth on driver gear"
    },
    {
        id: 'm10',
        question: "What is Youngs modulus?",
        choices: [
            { id: 'a', text: 'Stress / Strain', isCorrect: true },
            { id: 'b', text: 'Strain / Stress', isCorrect: false },
            { id: 'c', text: 'Force / Area', isCorrect: false },
            { id: 'd', text: 'Length / Width', isCorrect: false }
        ],
        explanation: "Youngs modulus (E) is the ratio of stress to strain in the elastic region: E = σ/ε"
    }
];

// Thermodynamics Questions
const thermodynamicsQuestions: MCQQuestion[] = [
    {
        id: 't1',
        question: "What is the first law of thermodynamics?",
        choices: [
            { id: 'a', text: 'Energy cannot be created or destroyed', isCorrect: true },
            { id: 'b', text: 'Entropy always increases', isCorrect: false },
            { id: 'c', text: 'Heat flows from hot to cold', isCorrect: false },
            { id: 'd', text: 'Temperature is constant', isCorrect: false }
        ],
        explanation: "The first law states that energy is conserved - it can only change forms, not be created or destroyed."
    },
    {
        id: 't2',
        question: "What does entropy measure?",
        choices: [
            { id: 'a', text: 'Temperature', isCorrect: false },
            { id: 'b', text: 'Disorder', isCorrect: true },
            { id: 'c', text: 'Energy', isCorrect: false },
            { id: 'd', text: 'Pressure', isCorrect: false }
        ],
        explanation: "Entropy is a measure of disorder or randomness in a system."
    },
    {
        id: 't3',
        question: "Which heat transfer method requires no medium?",
        choices: [
            { id: 'a', text: 'Conduction', isCorrect: false },
            { id: 'b', text: 'Convection', isCorrect: false },
            { id: 'c', text: 'Radiation', isCorrect: true },
            { id: 'd', text: 'All require a medium', isCorrect: false }
        ],
        explanation: "Radiation is heat transfer via electromagnetic waves and doesnt require a physical medium."
    },
    {
        id: 't4',
        question: "What is absolute zero in Kelvin?",
        choices: [
            { id: 'a', text: '-273.15 K', isCorrect: false },
            { id: 'b', text: '0 K', isCorrect: true },
            { id: 'c', text: '273.15 K', isCorrect: false },
            { id: 'd', text: '-100 K', isCorrect: false }
        ],
        explanation: "Absolute zero is 0 Kelvin, equal to -273.15°C."
    },
    {
        id: 't5',
        question: "What is the Carnot efficiency formula?",
        choices: [
            { id: 'a', text: '1 - (Tc/Th)', isCorrect: true },
            { id: 'b', text: 'Tc/Th', isCorrect: false },
            { id: 'c', text: 'Th/Tc', isCorrect: false },
            { id: 'd', text: '1 + (Tc/Th)', isCorrect: false }
        ],
        explanation: "Carnot efficiency = 1 - (Tc/Th) where Tc is cold temp and Th is hot temp in Kelvin."
    },
    {
        id: 't6',
        question: "What state change occurs from liquid to gas?",
        choices: [
            { id: 'a', text: 'Melting', isCorrect: false },
            { id: 'b', text: 'Freezing', isCorrect: false },
            { id: 'c', text: 'Evaporation', isCorrect: true },
            { id: 'd', text: 'Condensation', isCorrect: false }
        ],
        explanation: "Evaporation (or vaporization) is the phase change from liquid to gas."
    },
    {
        id: 't7',
        question: "What is specific heat capacity?",
        choices: [
            { id: 'a', text: 'Heat per unit mass per degree', isCorrect: true },
            { id: 'b', text: 'Total heat in a system', isCorrect: false },
            { id: 'c', text: 'Heat transfer rate', isCorrect: false },
            { id: 'd', text: 'Temperature change rate', isCorrect: false }
        ],
        explanation: "Specific heat capacity is the amount of heat needed to raise 1 kg of a substance by 1°C."
    },
    {
        id: 't8',
        question: "What is an adiabatic process?",
        choices: [
            { id: 'a', text: 'Constant temperature', isCorrect: false },
            { id: 'b', text: 'No heat exchange', isCorrect: true },
            { id: 'c', text: 'Constant pressure', isCorrect: false },
            { id: 'd', text: 'Constant volume', isCorrect: false }
        ],
        explanation: "An adiabatic process is one where no heat is exchanged with surroundings."
    },
    {
        id: 't9',
        question: "What is thermal conductivity?",
        choices: [
            { id: 'a', text: 'Ability to store heat', isCorrect: false },
            { id: 'b', text: 'Ability to conduct heat', isCorrect: true },
            { id: 'c', text: 'Ability to reflect heat', isCorrect: false },
            { id: 'd', text: 'Ability to generate heat', isCorrect: false }
        ],
        explanation: "Thermal conductivity is a materials ability to conduct heat."
    },
    {
        id: 't10',
        question: "What is the ideal gas law equation?",
        choices: [
            { id: 'a', text: 'PV = nRT', isCorrect: true },
            { id: 'b', text: 'P = nRT/V', isCorrect: false },
            { id: 'c', text: 'V = nRT/P', isCorrect: false },
            { id: 'd', text: 'T = PV/nR', isCorrect: false }
        ],
        explanation: "The ideal gas law is PV = nRT, relating pressure, volume, amount, and temperature."
    }
];

// Materials Science Questions
const materialsQuestions: MCQQuestion[] = [
    {
        id: 'mat1',
        question: "Which material has the highest tensile strength?",
        choices: [
            { id: 'a', text: 'Aluminum', isCorrect: false },
            { id: 'b', text: 'Steel', isCorrect: true },
            { id: 'c', text: 'Copper', isCorrect: false },
            { id: 'd', text: 'Lead', isCorrect: false }
        ],
        explanation: "Steel typically has higher tensile strength than aluminum, copper, or lead."
    },
    {
        id: 'mat2',
        question: "What is the process of heating and cooling to change material properties?",
        choices: [
            { id: 'a', text: 'Forging', isCorrect: false },
            { id: 'b', text: 'Heat treatment', isCorrect: true },
            { id: 'c', text: 'Welding', isCorrect: false },
            { id: 'd', text: 'Casting', isCorrect: false }
        ],
        explanation: "Heat treatment involves controlled heating and cooling to alter material properties."
    },
    {
        id: 'mat3',
        question: "What is an alloy?",
        choices: [
            { id: 'a', text: 'A pure metal', isCorrect: false },
            { id: 'b', text: 'A mixture of metals', isCorrect: true },
            { id: 'c', text: 'A non-metallic material', isCorrect: false },
            { id: 'd', text: 'A polymer', isCorrect: false }
        ],
        explanation: "An alloy is a mixture of two or more metals, or a metal with non-metals."
    },
    {
        id: 'mat4',
        question: "What does ductility describe?",
        choices: [
            { id: 'a', text: 'Ability to be drawn into wires', isCorrect: true },
            { id: 'b', text: 'Resistance to scratching', isCorrect: false },
            { id: 'c', text: 'Ability to conduct electricity', isCorrect: false },
            { id: 'd', text: 'Resistance to corrosion', isCorrect: false }
        ],
        explanation: "Ductility is a materials ability to deform plastically without fracturing, allowing it to be drawn into wires."
    },
    {
        id: 'mat5',
        question: "What is the most common metal on Earth?",
        choices: [
            { id: 'a', text: 'Iron', isCorrect: false },
            { id: 'b', text: 'Aluminum', isCorrect: true },
            { id: 'c', text: 'Copper', isCorrect: false },
            { id: 'd', text: 'Gold', isCorrect: false }
        ],
        explanation: "Aluminum is the most abundant metal in the Earths crust."
    },
    {
        id: 'mat6',
        question: "What causes metal fatigue?",
        choices: [
            { id: 'a', text: 'Single large load', isCorrect: false },
            { id: 'b', text: 'Repeated cyclic loading', isCorrect: true },
            { id: 'c', text: 'High temperature', isCorrect: false },
            { id: 'd', text: 'Chemical exposure', isCorrect: false }
        ],
        explanation: "Metal fatigue occurs due to repeated cyclic loading, leading to crack growth."
    },
    {
        id: 'mat7',
        question: "What is corrosion?",
        choices: [
            { id: 'a', text: 'Physical wear', isCorrect: false },
            { id: 'b', text: 'Chemical degradation', isCorrect: true },
            { id: 'c', text: 'Thermal expansion', isCorrect: false },
            { id: 'd', text: 'Mechanical stress', isCorrect: false }
        ],
        explanation: "Corrosion is the chemical degradation of materials, typically metals, by their environment."
    },
    {
        id: 'mat8',
        question: "What is galvanization?",
        choices: [
            { id: 'a', text: 'Coating with zinc', isCorrect: true },
            { id: 'b', text: 'Coating with paint', isCorrect: false },
            { id: 'c', text: 'Heat treatment', isCorrect: false },
            { id: 'd', text: 'Welding process', isCorrect: false }
        ],
        explanation: "Galvanization is coating steel or iron with zinc to prevent corrosion."
    },
    {
        id: 'mat9',
        question: "Which material is a good electrical insulator?",
        choices: [
            { id: 'a', text: 'Copper', isCorrect: false },
            { id: 'b', text: 'Aluminum', isCorrect: false },
            { id: 'c', text: 'Rubber', isCorrect: true },
            { id: 'd', text: 'Steel', isCorrect: false }
        ],
        explanation: "Rubber is an excellent electrical insulator due to its high resistivity."
    },
    {
        id: 'mat10',
        question: "What is the Mohs scale used for?",
        choices: [
            { id: 'a', text: 'Measuring temperature', isCorrect: false },
            { id: 'b', text: 'Measuring hardness', isCorrect: true },
            { id: 'c', text: 'Measuring density', isCorrect: false },
            { id: 'd', text: 'Measuring conductivity', isCorrect: false }
        ],
        explanation: "The Mohs scale measures mineral hardness from 1 (talc) to 10 (diamond)."
    }
];

// Circuit Analysis Questions
const circuitAnalysisQuestions: MCQQuestion[] = [
    {
        id: 'ca1',
        question: "What does Kirchhoffs Current Law state?",
        choices: [
            { id: 'a', text: 'Sum of currents entering equals sum leaving', isCorrect: true },
            { id: 'b', text: 'Sum of voltages equals zero', isCorrect: false },
            { id: 'c', text: 'Current is constant', isCorrect: false },
            { id: 'd', text: 'Voltage is constant', isCorrect: false }
        ],
        explanation: "Kirchhoffs Current Law (KCL) states that the sum of currents entering a node equals the sum of currents leaving."
    },
    {
        id: 'ca2',
        question: "In a series circuit, the total resistance is?",
        choices: [
            { id: 'a', text: 'Sum of all resistances', isCorrect: true },
            { id: 'b', text: 'Product of all resistances', isCorrect: false },
            { id: 'c', text: 'Average of resistances', isCorrect: false },
            { id: 'd', text: 'Smallest resistance', isCorrect: false }
        ],
        explanation: "In series: Total R = R1 + R2 + R3 + ..."
    },
    {
        id: 'ca3',
        question: "What is the unit of capacitance?",
        choices: [
            { id: 'a', text: 'Henry', isCorrect: false },
            { id: 'b', text: 'Farad', isCorrect: true },
            { id: 'c', text: 'Tesla', isCorrect: false },
            { id: 'd', text: 'Weber', isCorrect: false }
        ],
        explanation: "The Farad (F) is the SI unit of capacitance."
    },
    {
        id: 'ca4',
        question: "In a parallel circuit, voltage across each branch is?",
        choices: [
            { id: 'a', text: 'Different', isCorrect: false },
            { id: 'b', text: 'The same', isCorrect: true },
            { id: 'c', text: 'Zero', isCorrect: false },
            { id: 'd', text: 'Infinite', isCorrect: false }
        ],
        explanation: "In parallel circuits, the voltage across each branch is the same."
    },
    {
        id: 'ca5',
        question: "What is impedance in AC circuits?",
        choices: [
            { id: 'a', text: 'Only resistance', isCorrect: false },
            { id: 'b', text: 'Resistance + Reactance', isCorrect: true },
            { id: 'c', text: 'Only capacitance', isCorrect: false },
            { id: 'd', text: 'Only inductance', isCorrect: false }
        ],
        explanation: "Impedance (Z) is the total opposition to AC current, combining resistance and reactance."
    },
    {
        id: 'ca6',
        question: "What is the frequency of AC power in the US?",
        choices: [
            { id: 'a', text: '50 Hz', isCorrect: false },
            { id: 'b', text: '60 Hz', isCorrect: true },
            { id: 'c', text: '100 Hz', isCorrect: false },
            { id: 'd', text: '120 Hz', isCorrect: false }
        ],
        explanation: "The standard AC power frequency in the United States is 60 Hz."
    },
    {
        id: 'ca7',
        question: "What does RMS stand for in AC measurements?",
        choices: [
            { id: 'a', text: 'Real Mean Square', isCorrect: false },
            { id: 'b', text: 'Root Mean Square', isCorrect: true },
            { id: 'c', text: 'Resistive Mean Signal', isCorrect: false },
            { id: 'd', text: 'Rapid Measurement System', isCorrect: false }
        ],
        explanation: "RMS (Root Mean Square) is the effective value of AC voltage or current."
    },
    {
        id: 'ca8',
        question: "What is a short circuit?",
        choices: [
            { id: 'a', text: 'Very high resistance path', isCorrect: false },
            { id: 'b', text: 'Nearly zero resistance path', isCorrect: true },
            { id: 'c', text: 'Open circuit', isCorrect: false },
            { id: 'd', text: 'Capacitive circuit', isCorrect: false }
        ],
        explanation: "A short circuit is an unintended low-resistance connection between two points."
    },
    {
        id: 'ca9',
        question: "What is reactive power measured in?",
        choices: [
            { id: 'a', text: 'Watts', isCorrect: false },
            { id: 'b', text: 'VAR (Volt-Ampere Reactive)', isCorrect: true },
            { id: 'c', text: 'Joules', isCorrect: false },
            { id: 'd', text: 'Coulombs', isCorrect: false }
        ],
        explanation: "Reactive power is measured in VAR (Volt-Ampere Reactive)."
    },
    {
        id: 'ca10',
        question: "What is the power factor?",
        choices: [
            { id: 'a', text: 'Ratio of real to apparent power', isCorrect: true },
            { id: 'b', text: 'Ratio of voltage to current', isCorrect: false },
            { id: 'c', text: 'Ratio of resistance to reactance', isCorrect: false },
            { id: 'd', text: 'Ratio of frequency to time', isCorrect: false }
        ],
        explanation: "Power factor is the ratio of real power to apparent power in an AC circuit."
    }
];

// Engineering Mathematics Questions
const mathQuestions: MCQQuestion[] = [
    {
        id: 'math1',
        question: "What is the derivative of x²?",
        choices: [
            { id: 'a', text: 'x', isCorrect: false },
            { id: 'b', text: '2x', isCorrect: true },
            { id: 'c', text: 'x³', isCorrect: false },
            { id: 'd', text: '2', isCorrect: false }
        ],
        explanation: "Using the power rule: d/dx(x²) = 2x"
    },
    {
        id: 'math2',
        question: "What is the integral of 1/x?",
        choices: [
            { id: 'a', text: 'x²', isCorrect: false },
            { id: 'b', text: 'ln|x|', isCorrect: true },
            { id: 'c', text: '1/x²', isCorrect: false },
            { id: 'd', text: 'e^x', isCorrect: false }
        ],
        explanation: "The integral of 1/x is ln|x| + C"
    },
    {
        id: 'math3',
        question: "What is the value of e (Eulers number) approximately?",
        choices: [
            { id: 'a', text: '3.14', isCorrect: false },
            { id: 'b', text: '2.718', isCorrect: true },
            { id: 'c', text: '1.618', isCorrect: false },
            { id: 'd', text: '1.414', isCorrect: false }
        ],
        explanation: "Eulers number e ≈ 2.71828..."
    },
    {
        id: 'math4',
        question: "What is a matrix determinant used for?",
        choices: [
            { id: 'a', text: 'Adding matrices', isCorrect: false },
            { id: 'b', text: 'Finding if matrix is invertible', isCorrect: true },
            { id: 'c', text: 'Multiplying matrices', isCorrect: false },
            { id: 'd', text: 'Transposing matrices', isCorrect: false }
        ],
        explanation: "A matrix is invertible only if its determinant is non-zero."
    },
    {
        id: 'math5',
        question: "What does the Laplace transform do?",
        choices: [
            { id: 'a', text: 'Converts time to frequency domain', isCorrect: true },
            { id: 'b', text: 'Solves integrals', isCorrect: false },
            { id: 'c', text: 'Finds derivatives', isCorrect: false },
            { id: 'd', text: 'Calculates areas', isCorrect: false }
        ],
        explanation: "The Laplace transform converts differential equations from time to frequency (s) domain."
    },
    {
        id: 'math6',
        question: "What is the Pythagorean theorem?",
        choices: [
            { id: 'a', text: 'a + b = c', isCorrect: false },
            { id: 'b', text: 'a² + b² = c²', isCorrect: true },
            { id: 'c', text: 'a × b = c', isCorrect: false },
            { id: 'd', text: 'a/b = c', isCorrect: false }
        ],
        explanation: "In a right triangle: a² + b² = c² where c is the hypotenuse."
    },
    {
        id: 'math7',
        question: "What is the chain rule in calculus?",
        choices: [
            { id: 'a', text: '(f∘g) = f×g', isCorrect: false },
            { id: 'b', text: '(f∘g) = f(g(x))g(x)', isCorrect: true },
            { id: 'c', text: '(f∘g) = f+g', isCorrect: false },
            { id: 'd', text: '(f∘g) = f-g', isCorrect: false }
        ],
        explanation: "The chain rule: d/dx[f(g(x))] = f(g(x)) × g(x)"
    },
    {
        id: 'math8',
        question: "What is the mean (average) of 2, 4, 6, 8?",
        choices: [
            { id: 'a', text: '4', isCorrect: false },
            { id: 'b', text: '5', isCorrect: true },
            { id: 'c', text: '6', isCorrect: false },
            { id: 'd', text: '20', isCorrect: false }
        ],
        explanation: "Mean = (2+4+6+8)/4 = 20/4 = 5"
    },
    {
        id: 'math9',
        question: "What is a vector?",
        choices: [
            { id: 'a', text: 'A quantity with magnitude only', isCorrect: false },
            { id: 'b', text: 'A quantity with magnitude and direction', isCorrect: true },
            { id: 'c', text: 'A scalar quantity', isCorrect: false },
            { id: 'd', text: 'A constant value', isCorrect: false }
        ],
        explanation: "A vector has both magnitude and direction (e.g., force, velocity)."
    },
    {
        id: 'math10',
        question: "What is the factorial of 5 (5!)?",
        choices: [
            { id: 'a', text: '25', isCorrect: false },
            { id: 'b', text: '120', isCorrect: true },
            { id: 'c', text: '15', isCorrect: false },
            { id: 'd', text: '5', isCorrect: false }
        ],
        explanation: "5! = 5 × 4 × 3 × 2 × 1 = 120"
    }
];

// Engineering Ethics Questions
const ethicsQuestions: MCQQuestion[] = [
    {
        id: 'eth1',
        question: "What is the primary duty of an engineer?",
        choices: [
            { id: 'a', text: 'Maximize profit', isCorrect: false },
            { id: 'b', text: 'Public safety and welfare', isCorrect: true },
            { id: 'c', text: 'Follow orders', isCorrect: false },
            { id: 'd', text: 'Complete projects quickly', isCorrect: false }
        ],
        explanation: "Engineers primary duty is to hold paramount the safety, health, and welfare of the public."
    },
    {
        id: 'eth2',
        question: "What should an engineer do if they discover a safety issue?",
        choices: [
            { id: 'a', text: 'Ignore it if not their responsibility', isCorrect: false },
            { id: 'b', text: 'Report it immediately', isCorrect: true },
            { id: 'c', text: 'Wait for someone else to notice', isCorrect: false },
            { id: 'd', text: 'Fix it only if paid extra', isCorrect: false }
        ],
        explanation: "Engineers must promptly report safety hazards to protect public welfare."
    },
    {
        id: 'eth3',
        question: "What is conflict of interest?",
        choices: [
            { id: 'a', text: 'Disagreeing with colleagues', isCorrect: false },
            { id: 'b', text: 'Personal interests affecting professional judgment', isCorrect: true },
            { id: 'c', text: 'Working on multiple projects', isCorrect: false },
            { id: 'd', text: 'Changing jobs', isCorrect: false }
        ],
        explanation: "Conflict of interest occurs when personal interests could compromise professional judgment."
    },
    {
        id: 'eth4',
        question: "Should engineers accept gifts from contractors?",
        choices: [
            { id: 'a', text: 'Yes, always', isCorrect: false },
            { id: 'b', text: 'Only if small value', isCorrect: false },
            { id: 'c', text: 'No, it may compromise integrity', isCorrect: true },
            { id: 'd', text: 'Yes, if disclosed', isCorrect: false }
        ],
        explanation: "Engineers should avoid accepting gifts that could influence their professional judgment."
    },
    {
        id: 'eth5',
        question: "What is intellectual property?",
        choices: [
            { id: 'a', text: 'Physical property', isCorrect: false },
            { id: 'b', text: 'Creations of the mind', isCorrect: true },
            { id: 'c', text: 'Smart devices', isCorrect: false },
            { id: 'd', text: 'Educational materials', isCorrect: false }
        ],
        explanation: "Intellectual property includes patents, copyrights, and trademarks from mental creations."
    },
    {
        id: 'eth6',
        question: "What does sustainability in engineering mean?",
        choices: [
            { id: 'a', text: 'Building things that last forever', isCorrect: false },
            { id: 'b', text: 'Meeting present needs without compromising future', isCorrect: true },
            { id: 'c', text: 'Using only renewable materials', isCorrect: false },
            { id: 'd', text: 'Minimizing costs', isCorrect: false }
        ],
        explanation: "Sustainability means meeting present needs without compromising future generations ability to meet theirs."
    },
    {
        id: 'eth7',
        question: "Should engineers sign documents they haven't reviewed?",
        choices: [
            { id: 'a', text: 'Yes, to save time', isCorrect: false },
            { id: 'b', text: 'Yes, if told by supervisor', isCorrect: false },
            { id: 'c', text: 'No, never', isCorrect: true },
            { id: 'd', text: 'Yes, if urgent', isCorrect: false }
        ],
        explanation: "Engineers should only seal documents they have personally prepared or reviewed."
    },
    {
        id: 'eth8',
        question: "What is whistleblowing?",
        choices: [
            { id: 'a', text: 'Making loud noises at work', isCorrect: false },
            { id: 'b', text: 'Reporting unethical practices', isCorrect: true },
            { id: 'c', text: 'Gossiping about colleagues', isCorrect: false },
            { id: 'd', text: 'Quitting a job', isCorrect: false }
        ],
        explanation: "Whistleblowing is exposing wrongdoing or unethical practices within an organization."
    },
    {
        id: 'eth9',
        question: "Should engineers continue professional development?",
        choices: [
            { id: 'a', text: 'No, after graduation', isCorrect: false },
            { id: 'b', text: 'Yes, throughout their career', isCorrect: true },
            { id: 'c', text: 'Only if required', isCorrect: false },
            { id: 'd', text: 'Only for promotions', isCorrect: false }
        ],
        explanation: "Engineers should engage in lifelong learning to maintain competence in evolving technologies."
    },
    {
        id: 'eth10',
        question: "What is professional competence?",
        choices: [
            { id: 'a', text: 'Having a degree', isCorrect: false },
            { id: 'b', text: 'Undertaking only work one is qualified for', isCorrect: true },
            { id: 'c', text: 'Competing with others', isCorrect: false },
            { id: 'd', text: 'Working long hours', isCorrect: false }
        ],
        explanation: "Professional competence means performing only services in ones area of expertise and qualification."
    }
];

export const allPuzzles: Puzzle[] = [
    {
        id: 'engineering-wordle',
        title: 'Engineering Wordle',
        description: 'Guess the 5-letter engineering term in 6 tries.',
        type: PuzzleType.ENGINEERING_WORDLE,
        difficulty: PuzzleDifficulty.MEDIUM,
        icon: '🔤',
        targetWord: engineeringWords[getDailyWordIndex(engineeringWords.length)],
        hints: [
            'Think about common engineering components and devices'
        ]
    },
    {
        id: 'electronics-fundamentals',
        title: 'Electronics Fundamentals',
        description: 'Test your knowledge of basic electronic components and concepts',
        type: PuzzleType.SCIENTIFIC_MCQ,
        difficulty: PuzzleDifficulty.MEDIUM,
        icon: '⚡',
        questions: electronicsQuestions,
        hints: [
            'Review basic ohms law and circuit components',
            'Think about common electronic symbols',
            'Remember the units of electrical measurements'
        ],
        passingScore: 70,
        timeLimit: 600
    },
    {
        id: 'programming-logic',
        title: 'Programming & Logic',
        description: 'Challenge your programming knowledge and logical thinking',
        type: PuzzleType.CODE_DEBUG,
        difficulty: PuzzleDifficulty.MEDIUM,
        icon: '💻',
        questions: programmingQuestions,
        hints: [
            'Consider data structures and algorithms',
            'Think about time complexity',
            'Review programming paradigms'
        ],
        passingScore: 70,
        timeLimit: 600
    },
    {
        id: 'digital-electronics',
        title: 'Digital Electronics',
        description: 'Master logic gates, Boolean algebra, and digital circuits',
        type: PuzzleType.CIRCUIT_LOGIC,
        difficulty: PuzzleDifficulty.HARD,
        icon: '🔌',
        questions: digitalElectronicsQuestions,
        hints: [
            'Review truth tables for basic gates',
            'Remember binary and hexadecimal conversions',
            'Understand flip-flops and sequential circuits'
        ],
        passingScore: 70,
        timeLimit: 600
    },
    {
        id: 'mechanical-engineering',
        title: 'Mechanical Engineering',
        description: 'Explore statics, dynamics, and material properties',
        type: PuzzleType.MATH_TEASERS,
        difficulty: PuzzleDifficulty.HARD,
        icon: '⚙️',
        questions: mechanicalQuestions,
        hints: [
            'Review stress-strain relationships',
            'Remember SI units for force and energy',
            'Think about basic mechanical principles'
        ],
        passingScore: 70,
        timeLimit: 600
    },
    {
        id: 'thermodynamics',
        title: 'Thermodynamics',
        description: 'Test your knowledge of heat, energy, and thermodynamic laws',
        type: PuzzleType.PHYSICS_PROBLEMS,
        difficulty: PuzzleDifficulty.HARD,
        icon: '🔥',
        questions: thermodynamicsQuestions,
        hints: [
            'Remember the laws of thermodynamics',
            'Know heat transfer methods',
            'Understand phase changes and entropy'
        ],
        passingScore: 70,
        timeLimit: 600
    },
    {
        id: 'materials-science',
        title: 'Materials Science',
        description: 'Understand material properties, strength, and applications',
        type: PuzzleType.PATTERN_RECOGNITION,
        difficulty: PuzzleDifficulty.MEDIUM,
        icon: '🔬',
        questions: materialsQuestions,
        hints: [
            'Know common material properties',
            'Understand heat treatment processes',
            'Remember corrosion prevention methods'
        ],
        passingScore: 70,
        timeLimit: 600
    },
    {
        id: 'circuit-analysis',
        title: 'Circuit Analysis',
        description: 'Master Kirchhoffs laws, AC/DC circuits, and power calculations',
        type: PuzzleType.CIRCUIT_LOGIC,
        difficulty: PuzzleDifficulty.HARD,
        icon: '🔋',
        questions: circuitAnalysisQuestions,
        hints: [
            'Apply Kirchhoffs Current and Voltage Laws',
            'Remember series vs parallel circuit rules',
            'Know AC circuit terminology'
        ],
        passingScore: 70,
        timeLimit: 600
    },
    {
        id: 'engineering-mathematics',
        title: 'Engineering Mathematics',
        description: 'Challenge yourself with calculus, linear algebra, and statistics',
        type: PuzzleType.MATH_TEASERS,
        difficulty: PuzzleDifficulty.HARD,
        icon: '📐',
        questions: mathQuestions,
        hints: [
            'Review basic calculus rules',
            'Remember matrix operations',
            'Know statistical measures'
        ],
        passingScore: 70,
        timeLimit: 600
    },
    {
        id: 'engineering-ethics',
        title: 'Engineering Ethics & Safety',
        description: 'Understand professional responsibility and ethical conduct',
        type: PuzzleType.ENGINEERING_ETHICS,
        difficulty: PuzzleDifficulty.MEDIUM,
        icon: '⚖️',
        questions: ethicsQuestions,
        hints: [
            'Engineers duty is to public safety',
            'Understand conflict of interest',
            'Know professional competence requirements'
        ],
        passingScore: 70,
        timeLimit: 600
    }
];

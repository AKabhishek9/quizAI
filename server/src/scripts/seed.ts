/**
 * Seed script — inserts sample questions into MongoDB.
 *
 * Run: npx tsx src/scripts/seed.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { QuestionModel } from "../models/Question.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/quizai";

const sampleQuestions = [
  // ── JavaScript (Easy → Hard) ──
  {
    question: "What keyword declares a block-scoped variable in JavaScript?",
    options: ["var", "let", "set", "define"],
    answer: 1,
    stream: "Engineering",
    subject: "JavaScript",
    concept: "Variables",
    difficulty: 1,
  },
  {
    question: "Which method converts a JSON string into a JavaScript object?",
    options: ["JSON.parse()", "JSON.stringify()", "JSON.toObject()", "JSON.convert()"],
    answer: 0,
    stream: "Engineering",
    subject: "JavaScript",
    concept: "JSON",
    difficulty: 1,
  },
  {
    question: "What does the '===' operator check in JavaScript?",
    options: ["Value only", "Type only", "Value and type", "Reference"],
    answer: 2,
    stream: "Engineering",
    subject: "JavaScript",
    concept: "Operators",
    difficulty: 1,
  },
  {
    question: "What is a closure in JavaScript?",
    options: [
      "A function with access to its outer scope",
      "A sealed object",
      "A type of loop",
      "A module pattern",
    ],
    answer: 0,
    stream: "Engineering",
    subject: "JavaScript",
    concept: "Closures",
    difficulty: 2,
  },
  {
    question: "What does Array.prototype.reduce() do?",
    options: [
      "Removes elements from an array",
      "Accumulates array values into a single result",
      "Sorts the array",
      "Filters elements",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "JavaScript",
    concept: "Array Methods",
    difficulty: 2,
  },
  {
    question: "Which of the following is NOT a primitive type in JavaScript?",
    options: ["string", "boolean", "object", "symbol"],
    answer: 2,
    stream: "Engineering",
    subject: "JavaScript",
    concept: "Types",
    difficulty: 2,
  },
  {
    question: "What is the output of: typeof null?",
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    answer: 2,
    stream: "Engineering",
    subject: "JavaScript",
    concept: "Types",
    difficulty: 3,
  },
  {
    question: "What is the event loop responsible for in JavaScript?",
    options: [
      "Compiling code",
      "Managing the call stack and callback queue",
      "Garbage collection",
      "Type checking",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "JavaScript",
    concept: "Event Loop",
    difficulty: 3,
  },
  {
    question: "What is the difference between call() and apply()?",
    options: [
      "call() takes an array, apply() takes arguments",
      "call() takes arguments individually, apply() takes an array",
      "They are identical",
      "apply() only works with arrow functions",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "JavaScript",
    concept: "Functions",
    difficulty: 3,
  },
  {
    question: "What does Object.freeze() do?",
    options: [
      "Deep copies an object",
      "Prevents adding, removing, or modifying properties",
      "Locks the prototype chain",
      "Makes the object iterable",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "JavaScript",
    concept: "Objects",
    difficulty: 3,
  },

  // ── React (Easy → Hard) ──
  {
    question: "What hook is used to manage local state in a function component?",
    options: ["useEffect", "useState", "useContext", "useReducer"],
    answer: 1,
    stream: "Engineering",
    subject: "React",
    concept: "Hooks",
    difficulty: 1,
  },
  {
    question: "What is JSX?",
    options: [
      "A JavaScript XML syntax extension",
      "A CSS preprocessor",
      "A state management library",
      "A testing framework",
    ],
    answer: 0,
    stream: "Engineering",
    subject: "React",
    concept: "JSX",
    difficulty: 1,
  },
  {
    question: "Which hook is used to manage side effects in React?",
    options: ["useState", "useEffect", "useMemo", "useRef"],
    answer: 1,
    stream: "Engineering",
    subject: "React",
    concept: "Hooks",
    difficulty: 2,
  },
  {
    question: "What is the purpose of React.memo()?",
    options: [
      "Memorize state values",
      "Prevent unnecessary re-renders by memoizing the component",
      "Cache API responses",
      "Create mutable references",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "React",
    concept: "Performance",
    difficulty: 2,
  },
  {
    question: "What is the difference between useCallback and useMemo?",
    options: [
      "useCallback memoizes functions, useMemo memoizes values",
      "They are identical",
      "useCallback is for state, useMemo is for effects",
      "useMemo is deprecated",
    ],
    answer: 0,
    stream: "Engineering",
    subject: "React",
    concept: "Performance",
    difficulty: 3,
  },
  {
    question: "What problem does the useRef hook solve compared to a regular variable?",
    options: [
      "It triggers re-renders",
      "It persists values across renders without causing re-renders",
      "It manages global state",
      "It replaces Redux",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "React",
    concept: "Hooks",
    difficulty: 3,
  },
  {
    question: "How does React's reconciliation algorithm work?",
    options: [
      "It re-renders the entire DOM",
      "It diffs the virtual DOM trees and applies minimal updates",
      "It uses web workers for rendering",
      "It compiles JSX to native code",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "React",
    concept: "Reconciliation",
    difficulty: 4,
  },
  {
    question: "What is a React Fiber?",
    options: [
      "A CSS-in-JS library",
      "A unit of work in React's reconciliation engine",
      "A build tool",
      "A routing library",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "React",
    concept: "Internals",
    difficulty: 5,
  },

  // ── TypeScript ──
  {
    question: "What is the difference between 'interface' and 'type' in TypeScript?",
    options: [
      "Interfaces can be extended, types cannot",
      "Types support unions and intersections, interfaces support declaration merging",
      "They are identical",
      "Types are faster",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "TypeScript",
    concept: "Type System",
    difficulty: 2,
  },
  {
    question: "What does the 'keyof' operator return in TypeScript?",
    options: [
      "The values of an object",
      "A union type of the object's property names",
      "The count of properties",
      "A runtime array of keys",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "TypeScript",
    concept: "Utility Types",
    difficulty: 3,
  },
  {
    question: "What is a conditional type in TypeScript?",
    options: [
      "A type that depends on runtime values",
      "A type that uses extends with a ternary syntax to select types",
      "A type for if/else blocks",
      "A deprecated feature",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "TypeScript",
    concept: "Advanced Types",
    difficulty: 4,
  },
  {
    question: "What does 'infer' do in TypeScript conditional types?",
    options: [
      "Infers the return type of functions automatically",
      "Introduces a type variable within the extends clause",
      "Validates types at runtime",
      "Creates generic constraints",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "TypeScript",
    concept: "Advanced Types",
    difficulty: 5,
  },

  // ── CSS ──
  {
    question: "What is the difference between flexbox and grid?",
    options: [
      "Flexbox is one-dimensional, grid is two-dimensional",
      "They are identical",
      "Grid only works in rows",
      "Flexbox is newer",
    ],
    answer: 0,
    stream: "Engineering",
    subject: "CSS",
    concept: "Layout",
    difficulty: 1,
  },
  {
    question: "What does 'position: sticky' do?",
    options: [
      "Makes the element fixed",
      "Toggles between relative and fixed based on scroll position",
      "Removes the element from the flow",
      "Centers the element",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "CSS",
    concept: "Positioning",
    difficulty: 2,
  },
  {
    question: "What is a CSS Container Query?",
    options: [
      "A media query based on the viewport",
      "A query based on the size of the parent container",
      "A JavaScript API",
      "A deprecated feature",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "CSS",
    concept: "Modern CSS",
    difficulty: 3,
  },

  // ── Node.js ──
  {
    question: "What is the purpose of the 'require()' function in Node.js?",
    options: [
      "To import modules",
      "To create new files",
      "To start a server",
      "To parse JSON",
    ],
    answer: 0,
    stream: "Engineering",
    subject: "Node.js",
    concept: "Modules",
    difficulty: 1,
  },
  {
    question: "What is middleware in Express.js?",
    options: [
      "A database connector",
      "A function that has access to req, res, and next",
      "A template engine",
      "A build tool",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "Node.js",
    concept: "Express",
    difficulty: 2,
  },
  {
    question: "What is the purpose of process.nextTick() vs setImmediate()?",
    options: [
      "They are identical",
      "nextTick fires before I/O callbacks, setImmediate fires after",
      "setImmediate is deprecated",
      "nextTick blocks the event loop",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "Node.js",
    concept: "Event Loop",
    difficulty: 4,
  },

  // ── Next.js ──
  {
    question: "What is a Server Component in Next.js App Router?",
    options: [
      "A component that runs only on the client",
      "A component that renders on the server without client-side JS",
      "A component that manages state",
      "A deprecated feature",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "Next.js",
    concept: "Server Components",
    difficulty: 2,
  },
  {
    question: "What is the purpose of the 'use server' directive?",
    options: [
      "Marks a component as a Server Component",
      "Marks a function as a Server Action",
      "Enables SSR",
      "Disables client-side rendering",
    ],
    answer: 1,
    stream: "Engineering",
    subject: "Next.js",
    concept: "Server Actions",
    difficulty: 3,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("[seed] Connected to MongoDB");

    // Clear existing
    await QuestionModel.deleteMany({});
    console.log("[seed] Cleared existing questions");

    // Insert
    const result = await QuestionModel.insertMany(sampleQuestions);
    console.log(`[seed] Inserted ${result.length} questions`);

    // Summary
    const subjects = [...new Set(sampleQuestions.map((q) => q.subject))];
    for (const s of subjects) {
      const count = sampleQuestions.filter((q) => q.subject === s).length;
      console.log(`  └─ ${s}: ${count} questions`);
    }

    await mongoose.disconnect();
    console.log("[seed] Done");
  } catch (err) {
    console.error("[seed] Error:", err);
    process.exit(1);
  }
}

seed();

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { LibraryData, Book, Member, BookIssue, LibraryLog } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "library_db.json");

// Parse JSON payloads. The library save endpoint sends the full database state,
// including book excerpts, so it can exceed Express's default 100kb limit.
app.use(express.json({ limit: "5mb" }));

// Load or initialize DB seed data
const SEED_BOOKS: Book[] = [
  {
    id: "b1",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    genre: "Computer Science",
    isbn: "9780132350884",
    totalCopies: 4,
    availableCopies: 3,
    shelfLocation: "Aisle 4, Shelf A",
    coverColor: "bg-emerald-950 text-emerald-200 border-emerald-800",
    pagesCount: 464,
    digitalExcerpt: [
      "CHAPTER 1: Clean Code\n\nYou are reading this book for two reasons. First, you are a programmer. Second, you want to be a better programmer. Good. We need better programmers.\n\nBad code can ruin a development team. As bad code mounts, the productivity of the team decreases, asymptotic to zero. As productivity decreases, management does the only thing they can; they add more staff to the project in hopes of increasing productivity. But the new staff don't understand the system, causing more mess.",
      "CHAPTER 2: Meaningful Names\n\nNames are everywhere in software. We name our variables, our functions, our arguments, our classes, and our packages. We name our source files and the directories that contain them. Because we do so much of it, we'd better do it well.\n\nRule 1: Use intention-revealing names. The name of a variable, function, or class, should answer all the big questions: Why does it exist, what does it do, and how is it used?"
    ]
  },
  {
    id: "b2",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    genre: "Physics",
    isbn: "9780553380163",
    totalCopies: 3,
    availableCopies: 2,
    shelfLocation: "Aisle 2, Shelf C",
    coverColor: "bg-indigo-950 text-indigo-200 border-indigo-800",
    pagesCount: 220,
    digitalExcerpt: [
      "CHAPTER 1: Our Picture of the Universe\n\nA well-known scientist (some say it was Bertrand Russell) once gave a public lecture on astronomy. He described how the earth orbits around the sun and how the sun, in turn, orbits around the center of a vast collection of stars called our galaxy.\n\nAt the end of the lecture, a little old lady at the back of the room stood up and said: 'What you have told us is rubbish. The world is really a flat plate supported on the back of a giant tortoise.'"
    ]
  },
  {
    id: "b3",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    genre: "Computer Science",
    isbn: "9780262033848",
    totalCopies: 2,
    availableCopies: 2,
    shelfLocation: "Aisle 4, Shelf B",
    coverColor: "bg-rose-955 text-rose-200 border-rose-800",
    pagesCount: 1312,
    digitalExcerpt: [
      "CHAPTER 1: The Role of Algorithms in Computing\n\nWhat is an algorithm? Informally, an algorithm is any well-defined computational procedure that takes some value, or set of values, as input and produces some value, or set of values, as output.\n\nAn algorithm is thus a sequence of computational steps that transform the input into the output. We can also view an algorithm as a tool for solving a well-specified computational problem."
    ]
  },
  {
    id: "b4",
    title: "Miri Jiyori (The Miri Daughter)",
    author: "Rajanikanta Bordoloi",
    genre: "Assamese",
    isbn: "9788172151034",
    totalCopies: 4,
    availableCopies: 4,
    shelfLocation: "Aisle 1, Shelf A",
    coverColor: "bg-amber-950 text-amber-200 border-amber-800",
    pagesCount: 180,
    digitalExcerpt: [
      "CHAPTER 1: Jonaki and Paneie on the Banks of the Subansiri\n\nThe mighty Subansiri river flowed in all its natural splendor. Near its banks, the Mising (Miri) villages hummed with seasonal routines. Paneie, the beautiful young daughter of the household, walked down with her clay vessel to collect water.\n\nHer thoughts were filled with Jonaki. Their childhood friendship had blossomed into a pure devotion, yet tribal conventions and parental arrangements cast dark shadows over their hopes."
    ]
  },
  {
    id: "b5",
    title: "Patharughat: The Historic Peasant Revolt",
    author: "Dr. Arup Bordoloi",
    genre: "History",
    isbn: "9788172158911",
    totalCopies: 3,
    availableCopies: 3,
    shelfLocation: "Aisle 3, Shelf C",
    coverColor: "bg-teal-950 text-teal-200 border-teal-800",
    pagesCount: 240,
    digitalExcerpt: [
      "CHAPTER 1: Background of the Assam Peasant Grievances\n\nFollowing the annexation of Assam in 1826 by the British East India Company under the Treaty of Yandabo, land revenue policies underwent a drastic structural shift.\n\nUnlike traditional systems where revenue was paid in kind or labor, the British enforced high cash-based land evaluation assessments. By 1893, land taxes surged by 70 to 80 percent, causing deep resentment across rural hamlets."
    ]
  },
  {
    id: "b6",
    title: "Halodhiya Soraye Baodhan Khai",
    author: "Homen Borgohain",
    genre: "Assamese",
    isbn: "9788172153210",
    totalCopies: 3,
    availableCopies: 3,
    shelfLocation: "Aisle 1, Shelf B",
    coverColor: "bg-cyan-950 text-cyan-200 border-cyan-800",
    pagesCount: 160,
    digitalExcerpt: [
      "CHAPTER 1: Rupon's Land Dispute\n\nRupon, an honest farmer in rural Assam, woke up to find that the wealthy landowner had conspired with local registry officials to claim title over his ancestral paddy fields.\n\nThe field was the only source of sustenance for his entire family. The golden yellow birds ('Halodhiya Soraye') migrated over the harvest, mocking his struggle as he stared at the encroaching fences."
    ]
  },
  {
    id: "b7",
    title: "Complete General Knowledge & Current Affairs handbook",
    author: "Manohar Pandey",
    genre: "Political Science",
    isbn: "9789325295583",
    totalCopies: 5,
    availableCopies: 5,
    shelfLocation: "Aisle 5, Shelf A",
    coverColor: "bg-violet-950 text-violet-200 border-violet-800",
    pagesCount: 420,
    digitalExcerpt: [
      "SECTION 1: Global Geopolitics & Institutional Frameworks\n\n1. The United Nations Organization (UNO) was founded on October 24, 1945. It currently consists of 193 member states. The Headquarters is situated in New York City."
    ]
  },
  {
    id: "b8",
    title: "India & World Geography: Arts and Culture Series",
    author: "Majid Husain",
    genre: "Geography",
    isbn: "9789352603886",
    totalCopies: 2,
    availableCopies: 2,
    shelfLocation: "Aisle 3, Shelf D",
    coverColor: "bg-slate-900 text-slate-200 border-slate-700",
    pagesCount: 520,
    digitalExcerpt: [
      "CHAPTER 1: Physical Physiography of the Indian Subcontinent\n\nThe subcontinent is divided into six physiographic regions: The Northern Mountains (Himalayas), the Great Plains, the Peninsular Plateau, the Thar Desert, the Coastal Plains, and the Islands."
    ]
  },
  {
    id: "b9",
    title: "A Textbook of Botany",
    author: "Dr. V. Singh & Dr. D.K. Jain",
    genre: "Botany",
    isbn: "9788125026228",
    totalCopies: 3,
    availableCopies: 3,
    shelfLocation: "Aisle 2, Shelf B",
    coverColor: "bg-emerald-950 text-emerald-250 border-emerald-900",
    pagesCount: 450,
    digitalExcerpt: [
      "CHAPTER 1: Plant Kingdom Classification\n\nBotanical exploration reveals detailed morphology. Plants are categorized systematically from thallophytes to angiosperms based on evolutionary characteristics, cellular differentiation, and lifecycle dynamics."
    ]
  },
  {
    id: "b10",
    title: "Biophysics: Foundations & Molecular Dynamics",
    author: "Vasantha Pattabhi & N. Gautham",
    genre: "Bio-Physics",
    isbn: "9788173713828",
    totalCopies: 2,
    availableCopies: 2,
    shelfLocation: "Aisle 2, Shelf D",
    coverColor: "bg-teal-950 text-teal-150 border-teal-900",
    pagesCount: 280,
    digitalExcerpt: [
      "CHAPTER 1: Molecular Structures of Biopolymorphs\n\nBio-physical evaluation models the mechanics of macromolecular interactions. Energy pathways, diffraction, and protein structures are examined in standard physical equilibrium matrices."
    ]
  },
  {
    id: "b11",
    title: "Principles of Management",
    author: "Harold Koontz & Heinz Weihrich",
    genre: "BBA",
    isbn: "9780072443707",
    totalCopies: 4,
    availableCopies: 4,
    shelfLocation: "Aisle 6, Shelf A",
    coverColor: "bg-slate-900 text-indigo-200 border-slate-800",
    pagesCount: 680,
    digitalExcerpt: [
      "CHAPTER 1: Management Science and Practice\n\nStrategic corporate coordination relies on structural guidelines. Planning, organizing, staffing, leading, and controlling serve as five structural pillars in BBA curriculums."
    ]
  },
  {
    id: "b12",
    title: "Computer System Architecture",
    author: "M. Morris Mano",
    genre: "BCA",
    isbn: "9780131755635",
    totalCopies: 4,
    availableCopies: 4,
    shelfLocation: "Aisle 4, Shelf D",
    coverColor: "bg-indigo-950 text-sky-200 border-indigo-900",
    pagesCount: 512,
    digitalExcerpt: [
      "CHAPTER 1: Digital Logic Circuits\n\nBinary evaluations, logic gates, and Boolean registers compose the infrastructure of modern computation matrices. BCA students master map-based logical minimizations."
    ]
  },
  {
    id: "b13",
    title: "Organic Chemistry: Structure & Mechanism",
    author: "Robert Morrison & Robert Boyd",
    genre: "Chemistry",
    isbn: "9780136436690",
    totalCopies: 3,
    availableCopies: 3,
    shelfLocation: "Aisle 2, Shelf A",
    coverColor: "bg-rose-950 text-rose-150 border-rose-900",
    pagesCount: 1200,
    digitalExcerpt: [
      "CHAPTER 1: Structure and Properties of Aliphatic Molecules\n\nElectrophilic addition, nucleophilic substitution, and molecular hybridization describe the reactive parameters of carbon complexes."
    ]
  },
  {
    id: "b14",
    title: "Principles of Economics",
    author: "N. Gregory Mankiw",
    genre: "Economics",
    isbn: "9781305155725",
    totalCopies: 4,
    availableCopies: 4,
    shelfLocation: "Aisle 6, Shelf B",
    coverColor: "bg-amber-950 text-indigo-100 border-amber-900",
    pagesCount: 850,
    digitalExcerpt: [
      "CHAPTER 1: Ten Principles of Economics\n\nSociety faces trade-offs. The cost of something is what you give up to get it. Rational people think at the margin, responding to incentive pathways."
    ]
  },
  {
    id: "b15",
    title: "Foundations of Educational Research & Philosophy",
    author: "Dr. Emily Watson",
    genre: "Education",
    isbn: "9780132613163",
    totalCopies: 3,
    availableCopies: 3,
    shelfLocation: "Aisle 5, Shelf B",
    coverColor: "bg-violet-950 text-violet-100 border-violet-900",
    pagesCount: 390,
    digitalExcerpt: [
      "CHAPTER 1: Pedagogical Frameworks & Social Progress\n\nThis volume outlines the history of public school instructional methodologies, curriculum maps, and pedagogical evaluation techniques."
    ]
  },
  {
    id: "b16",
    title: "Practice of System and Network Administration",
    author: "Thomas A. Limoncelli",
    genre: "Software Developement and System Administration",
    isbn: "9780321453495",
    totalCopies: 2,
    availableCopies: 2,
    shelfLocation: "Aisle 4, Shelf E",
    coverColor: "bg-emerald-950 text-indigo-200 border-emerald-900",
    pagesCount: 1000,
    digitalExcerpt: [
      "CHAPTER 1: Enterprise Infrastructure Engineering\n\nHost configuration, continuous deployments, scriptable automated operations, and network routing design formulate the baseline software systems curriculum."
    ]
  },
  {
    id: "b17",
    title: "Golden Anthology of English Poetry",
    author: "W.B. Yeats & T.S. Eliot",
    genre: "English",
    isbn: "9780199535866",
    totalCopies: 3,
    availableCopies: 3,
    shelfLocation: "Aisle 1, Shelf D",
    coverColor: "bg-indigo-900 text-slate-100 border-indigo-850",
    pagesCount: 320,
    digitalExcerpt: [
      "POEM 1: The Second Coming\n\nTurning and turning in the widening gyre\nThe falcon cannot hear the falconer;\nThings fall apart; the centre cannot hold;\nMere anarchy is loosed upon the world..."
    ]
  },
  {
    id: "b18",
    title: "Higher Engineering Mathematics",
    author: "Dr. B.S. Grewal",
    genre: "Mathematics",
    isbn: "9788174091955",
    totalCopies: 3,
    availableCopies: 3,
    shelfLocation: "Aisle 2, Shelf F",
    coverColor: "bg-cyan-950 text-emerald-250 border-cyan-900",
    pagesCount: 1100,
    digitalExcerpt: [
      "CHAPTER 1: Linear Differential Equations\n\nComplementary functions, particular integrals, and Laplace transforms define standard mathematical models for structural physical evaluations."
    ]
  },
  {
    id: "b19",
    title: "The Problems of Philosophy",
    author: "Bertrand Russell",
    genre: "Philosophy",
    isbn: "9780195115529",
    totalCopies: 2,
    availableCopies: 2,
    shelfLocation: "Aisle 5, Shelf E",
    coverColor: "bg-slate-900 text-amber-200 border-slate-800",
    pagesCount: 180,
    digitalExcerpt: [
      "CHAPTER 1: Appearance and Reality\n\nIs there any knowledge in the world so certain that no reasonable man could doubt it? Russell models cognitive constraints and epistemic boundaries."
    ]
  },
  {
    id: "b20",
    title: "Fundamentals of Mathematical Statistics",
    author: "S.C. Gupta & V.K. Kapoor",
    genre: "Statistics",
    isbn: "9788121924511",
    totalCopies: 3,
    availableCopies: 3,
    shelfLocation: "Aisle 2, Shelf G",
    coverColor: "bg-violet-950 text-slate-200 border-violet-900",
    pagesCount: 950,
    digitalExcerpt: [
      "CHAPTER 1: Probability Theory Foundations\n\nBayesian updates, joint densities, and the law of large numbers constitute standard statistical evaluation tools."
    ]
  },
  {
    id: "b21",
    title: "Invertebrate Zoology Textbook",
    author: "E.L. Jordan & P.S. Verma",
    genre: "Zoology",
    isbn: "9788121903677",
    totalCopies: 3,
    availableCopies: 3,
    shelfLocation: "Aisle 3, Shelf E",
    coverColor: "bg-emerald-950 text-emerald-100 border-emerald-900",
    pagesCount: 1150,
    digitalExcerpt: [
      "CHAPTER 1: Phylum Protozoa morphology\n\nStudies of unicellular life, locomotion via pseudopodia, reproductive mechanisms, and cellular organelle functions."
    ]
  },
  {
    id: "b22",
    title: "Food Processing Technology: Principles & Practice",
    author: "P.J. Fellows",
    genre: "Food Processing and Quality Management",
    isbn: "9781845692162",
    totalCopies: 2,
    availableCopies: 2,
    shelfLocation: "Aisle 3, Shelf F",
    coverColor: "bg-teal-950 text-amber-100 border-teal-900",
    pagesCount: 750,
    digitalExcerpt: [
      "CHAPTER 1: Principles of Dehydration and Pasteurization\n\nThermal death times, food safety thresholds, biochemistry degradation prevention, and vacuum packing logistics."
    ]
  }
];

// Additional rich department book sets (Requested by User)
const PHYSICS_ADDITIONAL = [
  { title: "Concepts of Physics", author: "H.C. Verma" },
  { title: "Fundamentals of Physics", author: "Halliday & Resnick" },
  { title: "Modern Physics", author: "Arthur Beiser" },
  { title: "University Physics", author: "Young & Freedman" },
  { title: "Waves and Oscillations", author: "N.K. Bajaj" },
  { title: "Engineering Physics", author: "D.K. Bhattacharya" },
  { title: "Classical Mechanics", author: "J.C. Upadhyaya" },
  { title: "Optics", author: "Ajoy Ghatak" },
  { title: "Quantum Mechanics", author: "S.N. Ghoshal" },
  { title: "Thermal Physics", author: "S.C. Garg" },
  { title: "Nuclear Physics", author: "Irving Kaplan" },
  { title: "Solid State Physics", author: "S.O. Pillai" },
  { title: "Electricity and Magnetism", author: "Purcell" },
  { title: "Mechanics", author: "D.S. Mathur" },
  { title: "Electromagnetic Theory", author: "Satya Prakash" },
  { title: "Laser Physics", author: "Thyagarajan" },
  { title: "Electronics Fundamentals", author: "Floyd" },
  { title: "Relativity", author: "Albert Einstein" },
  { title: "Physics for Scientists", author: "Serway" },
  { title: "Atomic Physics", author: "J.B. Rajam" }
];

const CHEMISTRY_ADDITIONAL = [
  { title: "Modern Approach to Chemical Calculations", author: "R.C. Mukherjee" },
  { title: "Organic Chemistry", author: "Morrison & Boyd" },
  { title: "Inorganic Chemistry", author: "O.P. Tandon" },
  { title: "Physical Chemistry", author: "P. Bahadur" },
  { title: "Concise Inorganic Chemistry", author: "J.D. Lee" },
  { title: "Organic Chemistry", author: "Paula Bruice" },
  { title: "Engineering Chemistry", author: "Jain & Jain" },
  { title: "Analytical Chemistry", author: "Skoog" },
  { title: "Biochemistry", author: "Lehninger" },
  { title: "Environmental Chemistry", author: "B.K. Sharma" },
  { title: "Industrial Chemistry", author: "B.K. Sharma" },
  { title: "Polymer Chemistry", author: "Gowariker" },
  { title: "Medicinal Chemistry", author: "Ashutosh Kar" },
  { title: "Surface Chemistry", author: "Atkins" },
  { title: "Spectroscopy", author: "Pavia" },
  { title: "Quantum Chemistry", author: "Levine" },
  { title: "Green Chemistry", author: "Ahluwalia" },
  { title: "Electrochemistry", author: "Glasstone" },
  { title: "Chemical Bonding", author: "Kettle" },
  { title: "General Chemistry", author: "Linus Pauling" }
];

const MATHEMATICS_ADDITIONAL = [
  { title: "Higher Algebra", author: "Hall & Knight" },
  { title: "Differential Calculus", author: "Shanti Narayan" },
  { title: "Integral Calculus", author: "Shanti Narayan" },
  { title: "Linear Algebra", author: "S. Kumaresan" },
  { title: "Engineering Mathematics", author: "B.S. Grewal" },
  { title: "Real Analysis", author: "S.C. Malik" },
  { title: "Vector Calculus", author: "M.D. Raisinghania" },
  { title: "Coordinate Geometry", author: "Loney" },
  { title: "Differential Equations", author: "Rainville" },
  { title: "Numerical Methods", author: "Jain Iyengar" },
  { title: "Statistics", author: "S.P. Gupta" },
  { title: "Discrete Mathematics", author: "Rosen" },
  { title: "Complex Analysis", author: "Churchill" },
  { title: "Probability Theory", author: "Sheldon Ross" },
  { title: "Mathematical Physics", author: "Satya Prakash" },
  { title: "Trigonometry", author: "S.L. Loney" },
  { title: "Set Theory", author: "Lipschutz" },
  { title: "Algebra", author: "Michael Artin" },
  { title: "Operations Research", author: "Kanti Swarup" },
  { title: "Graph Theory", author: "Harary" }
];

const HISTORY_ADDITIONAL = [
  { title: "History of Ancient India", author: "R.S. Sharma" },
  { title: "Medieval India", author: "Satish Chandra" },
  { title: "Modern India", author: "Bipin Chandra" },
  { title: "India’s Struggle for Independence", author: "Bipin Chandra" },
  { title: "World History", author: "Norman Lowe" },
  { title: "Ancient Civilizations", author: "Glyn Daniel" },
  { title: "History of Assam", author: "Edward Gait" },
  { title: "Mughal Empire", author: "J.F. Richards" },
  { title: "European History", author: "Jain & Mathur" },
  { title: "French Revolution", author: "Thomas Carlyle" },
  { title: "History of England", author: "David Hume" },
  { title: "Indian National Movement", author: "Sekhar Bandyopadhyay" },
  { title: "Freedom at Midnight", author: "Collins & Lapierre" },
  { title: "Discovery of India", author: "Jawaharlal Nehru" },
  { title: "Cultural History of India", author: "A.L. Basham" },
  { title: "Assam under Ahoms", author: "S.K. Bhuyan" },
  { title: "Modern World History", author: "Arjun Dev" },
  { title: "The Wonder That Was India", author: "Basham" },
  { title: "Ancient World History", author: "H.G. Wells" },
  { title: "History of Europe", author: "Thomson" }
];

const POLITICAL_SCIENCE_ADDITIONAL = [
  { title: "Indian Government and Politics", author: "B.L. Fadia" },
  { title: "Political Theory", author: "O.P. Gauba" },
  { title: "Introduction to Constitution", author: "D.D. Basu" },
  { title: "Comparative Politics", author: "J.C. Johari" },
  { title: "International Relations", author: "V.N. Khanna" },
  { title: "Public Administration", author: "Mohit Bhattacharya" },
  { title: "Indian Political System", author: "Roy & Bhattacharya" },
  { title: "Democracy in India", author: "Niraja Gopal" },
  { title: "Political Ideologies", author: "Andrew Heywood" },
  { title: "Human Rights", author: "Awasthi" },
  { title: "Modern Political Theory", author: "S.P. Verma" },
  { title: "State and Politics", author: "A.C. Kapur" },
  { title: "Constitution of India", author: "Subhash Kashyap" },
  { title: "Governance in India", author: "Laxmikanth" },
  { title: "Public Policy", author: "R.K. Sapru" },
  { title: "Western Political Thought", author: "Ebenstein" },
  { title: "Panchayati Raj", author: "George Mathew" },
  { title: "Indian Administration", author: "Arora & Goyal" },
  { title: "Contemporary Politics", author: "Rajni Kothari" },
  { title: "Diplomacy", author: "Hans Morgenthau" }
];

const EDUCATION_ADDITIONAL = [
  { title: "Philosophical Foundations of Education", author: "Chaube" },
  { title: "Modern Educational Psychology", author: "S.K. Mangal" },
  { title: "Teaching Methods", author: "Aggarwal" },
  { title: "Educational Technology", author: "Mangal & Mangal" },
  { title: "Child Development", author: "Hurlock" },
  { title: "Guidance and Counselling", author: "Kochhar" },
  { title: "Sociology of Education", author: "Brown" },
  { title: "Educational Administration", author: "Mohanty" },
  { title: "Educational Measurement", author: "Garrett" },
  { title: "Value Education", author: "Sharma" },
  { title: "Curriculum Development", author: "Tyler" },
  { title: "Inclusive Education", author: "Loreman" },
  { title: "Learning Theories", author: "Hilgard" },
  { title: "School Management", author: "Bhatnagar" },
  { title: "Educational Research", author: "Best & Kahn" },
  { title: "Teaching Aptitude", author: "R.P. Singh" },
  { title: "Mental Hygiene", author: "Crow & Crow" },
  { title: "Psychology of Learning", author: "Woodworth" },
  { title: "Education in Emerging India", author: "Aggarwal" },
  { title: "ICT in Education", author: "Bhattacharya" }
];

const GENERAL_KNOWLEDGE_ADDITIONAL = [
  { title: "Manorama Yearbook", author: "Mammen Mathew", genre: "History" },
  { title: "Lucent General Knowledge", author: "Lucent Publication", genre: "History" },
  { title: "India Year Book", author: "Government of India", genre: "Political Science" },
  { title: "General Knowledge 2026", author: "Arihant", genre: "History" },
  { title: "Objective GK", author: "S. Chand", genre: "History" },
  { title: "World Atlas", author: "Oxford", genre: "Geography" },
  { title: "Current Affairs Today", author: "Competition Review", genre: "Political Science" },
  { title: "Encyclopedia Britannica", author: "Britannica", genre: "Philosophy" },
  { title: "Indian Economy", author: "Ramesh Singh", genre: "Economics" },
  { title: "Geography of India", author: "Majid Husain", genre: "Geography" },
  { title: "Science Reporter", author: "CSIR", genre: "Botany" },
  { title: "Sports GK", author: "K. Siddharth", genre: "Geography" },
  { title: "Computer Awareness", author: "Arihant", genre: "Computer Science" },
  { title: "Environment Studies", author: "Bharucha", genre: "Geography" },
  { title: "Indian Polity", author: "Laxmikanth", genre: "Political Science" },
  { title: "Banking Awareness", author: "Disha Experts", genre: "Economics" },
  { title: "World History GK", author: "Pearson", genre: "History" },
  { title: "Space Science", author: "NASA Publications", genre: "Physics" },
  { title: "Nobel Prize Winners", author: "Chronicle", genre: "History" },
  { title: "Assam GK", author: "Sailen Baishya", genre: "Geography" }
];

const ASSAMESE_LITERATURE_ADDITIONAL = [
  { title: "Burhi Aair Xadhu", author: "Lakshminath Bezbaroa" },
  { title: "Mor Jiban Sonwaran", author: "Lakshminath Bezbaroa" },
  { title: "Podum Kunwari", author: "Lakshminath Bezbaroa" },
  { title: "Joymoti", author: "Lakshminath Bezbaroa" },
  { title: "Belimar", author: "Lakshminath Bezbaroa" },
  { title: "Miri Jiyori", author: "Rajanikanta Bordoloi" },
  { title: "Manomati", author: "Rajanikanta Bordoloi" },
  { title: "Danduwa Droh", author: "Rajanikanta Bordoloi" },
  { title: "Rangili", author: "Rajanikanta Bordoloi" },
  { title: "Nirmal Bhakat", author: "Rajanikanta Bordoloi" },
  { title: "Dontal Hatir Une Khowa Howdah", author: "Indira Goswami" },
  { title: "Tej Aru Dhulire Dhusarita Prishtha", author: "Indira Goswami" },
  { title: "Nilkanthi Braja", author: "Indira Goswami" },
  { title: "Mamore Dhora Tarowal", author: "Indira Goswami" },
  { title: "Ahiron", author: "Indira Goswami" },
  { title: "Sagar Dekhisa", author: "Homen Borgohain" },
  { title: "Pita Putra", author: "Homen Borgohain" },
  { title: "Halodhiya Soraye Baodhan Khai", author: "Homen Borgohain" },
  { title: "Matsyagandha", author: "Homen Borgohain" },
  { title: "Subala", author: "Homen Borgohain" },
  { title: "Xeuji Patar Kahini", author: "Syed Abdul Malik" },
  { title: "Dhanya Nara Tanu Bhal", author: "Syed Abdul Malik" },
  { title: "Aghari Atmar Kahini", author: "Syed Abdul Malik" },
  { title: "Bonjui", author: "Syed Abdul Malik" },
  { title: "Rupabarir Palax", author: "Syed Abdul Malik" },
  { title: "Karengar Ligiri", author: "Jyoti Prasad Agarwala" },
  { title: "Sonit Kuwori", author: "Jyoti Prasad Agarwala" },
  { title: "Lobhita", author: "Jyoti Prasad Agarwala" },
  { title: "Kanaklata", author: "Jyoti Prasad Agarwala" },
  { title: "Rupalim", author: "Jyoti Prasad Agarwala" },
  { title: "Iyaruingam", author: "Birendra Kumar Bhattacharya" },
  { title: "Mrityunjay", author: "Birendra Kumar Bhattacharya" },
  { title: "Pratipad", author: "Birendra Kumar Bhattacharya" },
  { title: "Aai", author: "Chandraprabha Saikiani" },
  { title: "Abhiyatri", author: "Chandraprabha Saikiani" },
  { title: "Mon aru Mon", author: "Nirupama Borgohain" },
  { title: "Anya Jibon", author: "Nirupama Borgohain" },
  { title: "Champawati", author: "Nirupama Borgohain" },
  { title: "Sei Nodi Nirabadhi", author: "Nirupama Borgohain" },
  { title: "Ejon Aranya Ejon Nodi", author: "Yeshe Dorjee Thongchi" },
  { title: "Mouna Ounth Mukhar Hriday", author: "Yeshe Dorjee Thongchi" },
  { title: "Sonam", author: "Yeshe Dorjee Thongchi" },
  { title: "Longmanor Dinlipi", author: "Anuradha Sharma Pujari" },
  { title: "Saharor Subas", author: "Anuradha Sharma Pujari" },
  { title: "Hriday Ek Bigyapan", author: "Anuradha Sharma Pujari" },
  { title: "Prem aru Prarthana", author: "Anuradha Sharma Pujari" },
  { title: "Deukaheen Pakhi", author: "Anuradha Sharma Pujari" },
  { title: "Jangam", author: "Debabrata Das" },
  { title: "Antahsrota", author: "Debabrata Das" },
  { title: "Nodi Mathu Boi Jai", author: "Debabrata Das" },
  { title: "Meghmallar", author: "Arupa Patangia Kalita" },
  { title: "Felanee", author: "Arupa Patangia Kalita" },
  { title: "Mariam Austin Othoba Hira Barua", author: "Arupa Patangia Kalita" },
  { title: "Kesa Pator Kapani", author: "Rita Chowdhury" },
  { title: "Makam", author: "Rita Chowdhury" },
  { title: "Deolangkhui", author: "Rita Chowdhury" },
  { title: "Popiya Tora", author: "Rita Chowdhury" },
  { title: "Ei Samay Sei Samay", author: "Navakanta Barua" },
  { title: "Kokadeutar Har", author: "Navakanta Barua" },
  { title: "Mur Xopunor Deuka", author: "Navakanta Barua" },
  { title: "Gonga Silonir Pakhi", author: "Nilmani Phookan" },
  { title: "Kobita Samagra", author: "Nilmani Phookan" },
  { title: "Antareep", author: "Bhabendra Nath Saikia" },
  { title: "Sandhyarag", author: "Bhabendra Nath Saikia" },
  { title: "Agnisnan", author: "Bhabendra Nath Saikia" },
  { title: "Kolahal", author: "Bhabendra Nath Saikia" },
  { title: "Prithibir Rajpath", author: "Bhabendra Nath Saikia" },
  { title: "Mouno Mukhor", author: "Bhabendra Nath Saikia" },
  { title: "Uttar Purush", author: "Lakshminandan Bora" },
  { title: "Kayakalpa", author: "Lakshminandan Bora" },
  { title: "Nishar Purabhi", author: "Lakshminandan Bora" },
  { title: "Sehi Gunanidhi", author: "Lakshminandan Bora" },
  { title: "Beli Thamoror Geet", author: "Mitra Phukan" },
  { title: "The Collector’s Wife", author: "Mitra Phukan" },
  { title: "Priyar Prithibi", author: "Mitra Phukan" },
  { title: "Eti Nilikha Chithi", author: "Monikuntala Bhattacharya" },
  { title: "Samayor Xubax", author: "Monikuntala Bhattacharya" },
  { title: "Premor Xur", author: "Monikuntala Bhattacharya" },
  { title: "Nibiro Andhar", author: "Ranju Hazarika" },
  { title: "Jochonar Raat", author: "Ranju Hazarika" },
  { title: "Andharot Jui", author: "Ranju Hazarika" },
  { title: "Mrityur Rong", author: "Ranju Hazarika" },
  { title: "Xondhan", author: "Ranju Hazarika" },
  { title: "Maya Mriga", author: "Nirode Chowdhury" },
  { title: "Astitwar Sandhanat", author: "Nirode Chowdhury" },
  { title: "Monor Khabar", author: "Hiren Gohain" },
  { title: "Axomor Loka Sanskriti", author: "Birendranath Datta" },
  { title: "Asomiya Sahityar Buranji", author: "Birinchi Kumar Barua" },
  { title: "Assam Buranji", author: "Haliram Dhekial Phukan" },
  { title: "Axomiya Byakaran", author: "Hemchandra Barua" },
  { title: "Padum Pukhurir Geet", author: "Hem Barua" },
  { title: "Dhumuha aru Ramdhenu", author: "Hem Barua" },
  { title: "Eti Xadhu Eti Geet", author: "Hiren Bhattacharya" },
  { title: "Mur Desh Mur Prem", author: "Hiren Bhattacharya" },
  { title: "Xeujiya Din", author: "Hiren Bhattacharya" },
  { title: "Premor Kolahal", author: "Achyut Kumar Sharma" },
  { title: "Andharor Rong", author: "Achyut Kumar Sharma" },
  { title: "Rohosyomoy Rati", author: "Achyut Kumar Sharma" },
  { title: "Nilim Akaxor Prem", author: "Dipali Borthakur" },
  { title: "Xopunor Xur", author: "Dipali Borthakur" },
  { title: "Jaal Kota Jui", author: "Nayanjyoti Sarma" },
  { title: "The Way You Want to Be Loved", author: "Aruni Kashyap" },
  { title: "My Poems Are Not for Your Ad-Campaign", author: "Anuradha Sharma Pujari" },
  { title: "ULFA: The Mirage of Dawn", author: "Rajeev Bhattacharyya" },
  { title: "Iyat Ekhan Aaranya Asil", author: "Anuradha Sarma Pujari" },
  { title: "Arnab, Astha Aru JEC", author: "Indranee Sarma" },
  { title: "Moro Eta Sapon Ase", author: "Dr. Rubul Mout" },
  { title: "Ashimat Jar Heral Seema", author: "Kanchan Baruah" },
  { title: "Baghe Tapur Rati Aru Anayanya Kahini", author: "Apurba Sarma" },
  { title: "Bharaghar", author: "Hitesh Deka" },
  { title: "Katha Ratnakar", author: "Dr. Dhrubajyoti Borah" },
  { title: "Lachit: Hengul Haital Deshar Saptam Putra", author: "Nang Ajanta Buragohain" },
  { title: "Anuradhar Desh", author: "Phanindra Kumar Dev Choudhury" },
  { title: "Bakul Phular Dare", author: "Dr. Mrinal Chandra Kalita" },
  { title: "Atmakatha", author: "Sharmistha Pritam" },
  { title: "Mautam", author: "Mrinal Talukdar" },
  { title: "Patkair Ipare Mur Dex", author: "Chandana Goswami" },
  { title: "Mareng Mareng", author: "Anuradha Sharma Pujari" },
  { title: "Naang Faa", author: "Juri Borah Borgohain" },
  { title: "Axom Andolan: Pratisruti Aru Phalasruti", author: "Edited by Dr. Hiren Gohain" },
  { title: "Jivanar Baatat", author: "Bina Barua" },
  { title: "There Is No Good Time for Bad News", author: "Aruni Kashyap" },
  { title: "Rongatapu 1982", author: "Adityam Saikia" },
  { title: "Mula Gabharu", author: "Various Authors" }
];

// Helper cover style cycle
const COVER_STYLES = [
  "bg-emerald-950 text-emerald-250 border-emerald-900",
  "bg-indigo-950 text-indigo-250 border-indigo-900",
  "bg-rose-950 text-rose-250 border-rose-900",
  "bg-amber-950 text-amber-250 border-amber-900",
  "bg-teal-950 text-teal-250 border-teal-900",
  "bg-cyan-950 text-cyan-250 border-cyan-900",
  "bg-violet-950 text-violet-250 border-violet-900",
  "bg-slate-900 text-slate-200 border-slate-705"
];

// Combine additionally requested assets
const ALL_NEW_RAW_BOOKS: { title: string; author: string; genre: string }[] = [];
PHYSICS_ADDITIONAL.forEach(item => ALL_NEW_RAW_BOOKS.push({ ...item, genre: "Physics" }));
CHEMISTRY_ADDITIONAL.forEach(item => ALL_NEW_RAW_BOOKS.push({ ...item, genre: "Chemistry" }));
MATHEMATICS_ADDITIONAL.forEach(item => ALL_NEW_RAW_BOOKS.push({ ...item, genre: "Mathematics" }));
HISTORY_ADDITIONAL.forEach(item => ALL_NEW_RAW_BOOKS.push({ ...item, genre: "History" }));
POLITICAL_SCIENCE_ADDITIONAL.forEach(item => ALL_NEW_RAW_BOOKS.push({ ...item, genre: "Political Science" }));
EDUCATION_ADDITIONAL.forEach(item => ALL_NEW_RAW_BOOKS.push({ ...item, genre: "Education" }));
GENERAL_KNOWLEDGE_ADDITIONAL.forEach(item => ALL_NEW_RAW_BOOKS.push({ ...item }));
ASSAMESE_LITERATURE_ADDITIONAL.forEach(item => ALL_NEW_RAW_BOOKS.push({ ...item, genre: "Assamese" }));

// Dynamically generate individual record properties for duplicates check & append
let lastIdIndex = 23;
ALL_NEW_RAW_BOOKS.forEach((raw) => {
  const isDuplicate = SEED_BOOKS.some(
    (b) => b.title.toLowerCase().trim() === raw.title.toLowerCase().trim()
  );
  if (!isDuplicate) {
    const randomCopies = Math.floor(Math.random() * 3) + 3; // 3 to 5 copies
    const coverColor = COVER_STYLES[lastIdIndex % COVER_STYLES.length];
    const isbn = `978817215${String(Math.floor(1000 + Math.random() * 9000))}`;
    const aisle = Math.floor(Math.random() * 6) + 1;
    const shelf = ["A", "B", "C", "D", "E", "F"][lastIdIndex % 6];
    
    SEED_BOOKS.push({
      id: `b${lastIdIndex}`,
      title: raw.title,
      author: raw.author,
      genre: raw.genre,
      isbn: isbn,
      totalCopies: randomCopies,
      availableCopies: randomCopies,
      shelfLocation: `Aisle ${aisle}, Shelf ${shelf}`,
      coverColor: coverColor,
      pagesCount: Math.floor(Math.random() * 400) + 180,
      digitalExcerpt: [
        `CHAPTER 1: Introduction to ${raw.title}\n\nWelcome to this digitized academic edition of ${raw.title} by ${raw.author}, officially indexed here at the Pub Kamrup College E-Library.\n\nThis standard volume serves the institutional faculty and active researchers. Chapters analyze key themes, rigorous methodologies, and classical perspectives surrounding ${raw.genre}.`
      ]
    });
    lastIdIndex++;
  }
});

const SEED_MEMBERS: Member[] = [
  {
    id: "a1",
    name: "Alvis Khandakar (Admin)",
    email: "alviskhandakar@gmail.com",
    role: "Admin",
    joiningDate: "2026-05-26",
    status: "Active"
  },
  {
    id: "a2",
    name: "Risita Khandakar (Admin)",
    email: "risitakhandakar@gmail.com",
    role: "Admin",
    joiningDate: "2026-05-26",
    status: "Active"
  },
  {
    id: "a3",
    name: "Raihan Siddique (Admin)",
    email: "raihansiddique@gmail.com",
    role: "Admin",
    joiningDate: "2026-05-27",
    status: "Active"
  },
  {
    id: "m1",
    name: "Alvis Khandakar",
    email: "alviskhandakar2@gmail.com",
    role: "Student",
    joiningDate: "2026-03-01",
    status: "Active"
  },
  {
    id: "m2",
    name: "Dr. Sarah Connor",
    email: "sarah.connor@university.edu",
    role: "Faculty",
    joiningDate: "2025-09-10",
    status: "Active"
  },
  {
    id: "m3",
    name: "Emily Watson",
    email: "emily.watson@campus.edu",
    role: "Student",
    joiningDate: "2026-01-15",
    status: "Active"
  },
  {
    id: "m4",
    name: "Jordan Peterson",
    email: "jordan.p@community.org",
    role: "General",
    joiningDate: "2026-02-22",
    status: "Active"
  }
];

const SEED_ISSUES: BookIssue[] = [
  {
    id: "i1",
    bookId: "b1",
    bookTitle: "Clean Code: A Handbook of Agile Software Craftsmanship",
    memberId: "m1",
    memberName: "Alvis Khandakar",
    issueDate: "2026-05-12",
    dueDate: "2026-06-12",
    status: "Issued"
  },
  {
    id: "i2",
    bookId: "b2",
    bookTitle: "A Brief History of Time",
    memberId: "m2",
    memberName: "Dr. Sarah Connor",
    issueDate: "2026-05-10",
    dueDate: "2026-06-10",
    status: "Issued"
  },
  {
    id: "i3",
    bookId: "b4",
    bookTitle: "The Hobbit",
    memberId: "m3",
    memberName: "Emily Watson",
    issueDate: "2026-05-01",
    dueDate: "2026-05-15",
    status: "Overdue"
  }
];

const SEED_LOGS: LibraryLog[] = [
  {
    id: "l1",
    type: "add_book",
    desc: "Pre-populated database catalog loaded successfully with 8 core volumes.",
    timestamp: "2026-05-26T10:00:00Z"
  },
  {
    id: "l2",
    type: "issue",
    desc: "Clean Code issued to Alvis Khandakar (Due: 2026-06-12)",
    timestamp: "2026-05-26T14:22:00Z"
  },
  {
    id: "l3",
    type: "issue",
    desc: "The Hobbit issued to Emily Watson (Due: 2026-05-15) - FLAG OVERDUE",
    timestamp: "2026-05-26T15:05:00Z"
  }
];

function initDatabase(): LibraryData {
  let loaded: LibraryData;
  try {
    if (fs.existsSync(DB_FILE)) {
      const existingData = fs.readFileSync(DB_FILE, "utf-8");
      loaded = JSON.parse(existingData);
      
      // Auto-migration: Ensure all newly populated SEED_BOOKS are present in the loaded DB catalog
      let migrationCount = 0;
      for (const sb of SEED_BOOKS) {
        if (!loaded.books.some(b => b.title.toLowerCase().trim() === sb.title.toLowerCase().trim())) {
          loaded.books.push(sb);
          migrationCount++;
        }
      }
      if (migrationCount > 0) {
        console.log(`[Migration] Appended ${migrationCount} newly seeded department books into database.`);
        fs.writeFileSync(DB_FILE, JSON.stringify(loaded, null, 2), "utf-8");
      }
      return loaded;
    }
  } catch (error) {
    console.error("Database read error, reinitializing database file...", error);
  }

  const initialData: LibraryData = {
    books: SEED_BOOKS,
    members: SEED_MEMBERS,
    issues: SEED_ISSUES,
    logs: SEED_LOGS
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write seed database file:", error);
  }

  return initialData;
}

// Instantiate db object
let db: LibraryData = initDatabase();

// API Endpoints
// 1. Get Library database state
app.get("/api/library", (req, res) => {
  res.json(db);
});

// 2. Save complete state to JSON db
app.post("/api/library/save", (req, res) => {
  try {
    const data: LibraryData = req.body;
    if (!data.books || !data.members || !data.issues || !data.logs) {
      return res.status(400).json({ error: "Invalid schema structure provided." });
    }
    db = data;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    res.json({ success: true, message: "Database saved successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to persist databases: " + err.message });
  }
});

// 3. Reset database to default seed state
app.post("/api/library/reset", (req, res) => {
  try {
    const defaultData: LibraryData = {
      books: SEED_BOOKS,
      members: SEED_MEMBERS,
      issues: SEED_ISSUES,
      logs: SEED_LOGS
    };
    db = defaultData;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    res.json({ success: true, message: "Database restored to original state." });
  } catch (err: any) {
    res.status(500).json({ error: "Reset failed: " + err.message });
  }
});

// 4. Smart AI Librarian API (using server-side Google GenAI SDK)
app.post("/api/library/gemini", async (req, res) => {
  try {
    const { prompt, chatHistory } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt parameter." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(503).json({
        response: "Hello! Quick note: The Gemini API Key is not configured yet in the Settings secrets. I'm currently running in simulated/offline mode! To test my live AI features, add a valid Gemini API Key. \n\nI can recommend you code structure books: Robert C. Martin's **Clean Code**, Thomas Cormen's **Introduction to Algorithms**, and Stephen Hawking's **A Brief History of Time**!"
      });
    }

    // Initialize core GenAI client
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    // Provide the core library inventory context so she knows exact availability of items!
    const inventoryContext = `
You are deep in the campus database as "Alex the Smart AI Librarian". Under no circumstances drop this persona.
You assist users of a custom digital Library Management System (LMS).
You are extremely polite, scholarly, and insightful, sometimes using brief library analogies.
You are fully aware of our current library inventory database:

--- BOOKS CATALOGUE ---
${db.books.map(b => `- [ID: ${b.id}] "${b.title}" by ${b.author} (${b.genre}). Available: ${b.availableCopies} out of ${b.totalCopies} copies. Shelf: ${b.shelfLocation}. ISBN: ${b.isbn}`).join("\n")}

--- ACTIVE LENDING TRANSACTIONS ---
${db.issues.map(i => `- Member ${i.memberName} (Member ID: ${i.memberId}) borrowed "${i.bookTitle}" (Book ID: ${i.bookId}). Status: ${i.status}. Due Date: ${i.dueDate}`).join("\n")}

Guidelines:
1. Always base recommendations primarily on the books *present on our shelves* above when asked what is available, but you are welcome to recommend external classics if we don't have exactly what they need.
2. If asked whether a book is available, query the catalog above and reply appropriately.
3. Be professional, direct, and concise. Ideal for student/faculty lookup.
`;

    // Package previous context inside contents structure
    const contents: any[] = [];
    
    // Add history if present
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }
    
    // Push the newest terminal prompt
    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: inventoryContext,
        temperature: 0.7,
      }
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error("Gemini server-side API error:", error);
    res.status(500).json({ error: "Failed to generate AI response: " + error.message });
  }
});

// Configure Vite middleware connection or static server
async function configureServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    
    // Pass routes to Vite's asset handlers
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files
    app.use(express.static(distPath));
    
    // Fallback any client routes to our React root SPA anchor
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Library Management System server running at http://0.0.0.0:${PORT}`);
  });
}

configureServer();

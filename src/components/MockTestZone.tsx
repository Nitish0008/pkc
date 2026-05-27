/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Member } from "../types";
import { 
  Trophy, 
  Clock, 
  BookOpen, 
  Award, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Trash2, 
  Edit, 
  ShieldCheck, 
  ChevronRight, 
  GraduationCap, 
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  HelpCircle,
  FileText
} from "lucide-react";

interface Question {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number; // index parameter
  explanation: string;
}

interface TestAttempt {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeElapsedSeconds: number;
  date: string;
  answers: { qId: string; selectedIndex: number; isCorrect: boolean }[];
}

interface MockTestZoneProps {
  currentUser: Member | null;
  onLogActivity: (type: 'add_book' | 'edit_book' | 'delete_book' | 'issue' | 'return', desc: string) => void;
}

// Highly descriptive, comprehensive initial test database (APSC, UPSC, General Science themes)
const DEFAULT_TEST_QUESTIONS: Question[] = [
  {
    id: "q-1",
    subject: "Assam History & GS",
    question: "Who was the legendary founder ruler of the Ahom Dynasty in Assam?",
    options: ["Rudra Singha", "Sukaphaa", "Pramatta Singha", "Gadadhar Singha"],
    correctAnswer: 1,
    explanation: "Sukaphaa was the legendary architect and founder of the Ahom Kingdom in Assam, established in 1228, which governed for nearly 600 years."
  },
  {
    id: "q-2",
    subject: "Assam History & GS",
    question: "The historic Battle of Saraighat was fought on the Brahmaputra between Ahoms and Mughals in which year?",
    options: ["1526", "1605", "1671", "1682"],
    correctAnswer: 2,
    explanation: "The naval Battle of Saraighat was fought in 1671 under the supreme tactical leadership of General Lachit Borphukan."
  },
  {
    id: "q-3",
    subject: "Assam History & GS",
    question: "Which forest reserve was proclaimed as the 7th National Park of Assam?",
    options: ["Dihing Patkai", "Raimona National Park", "Nameri Reserve", "Orang Biosphere"],
    correctAnswer: 0,
    explanation: "Dihing Patkai was declared as the 7th National Park of Assam in June 2021, and is widely referred to as the 'Amazon of the East'."
  },
  {
    id: "q-4",
    subject: "Assamese Literature",
    question: "Who compiled the first legendary etymological dictionary of the Assamese language named 'Hemkosh'?",
    options: ["Hemchandra Barua", "Lakshminath Bezbaroa", "Nathan Brown", "Jyoti Prasad Agarwala"],
    correctAnswer: 0,
    explanation: "Hemchandra Barua meticulously compiled the 'Hemkosh' in the late 19th century, setting orthographic standards still followed today."
  },
  {
    id: "q-5",
    subject: "Assamese Literature",
    question: "Who was the pioneering Assamese author to be awarded the prestigious Jnanpith Award?",
    options: ["Indira Goswami", "Birendra Kumar Bhattacharya", "Homen Borgohain", "Nilmani Phookan"],
    correctAnswer: 1,
    explanation: "Dr. Birendra Kumar Bhattacharya received the Jnanpith Award in 1979 for his highly acclaimed Assamese novel 'Mrityunjay'."
  },
  {
    id: "q-6",
    subject: "Polity & GK Recruitment",
    question: "The main seat and high courtyard of Gauhati High Court was established in which year?",
    options: ["1935", "1948", "1950", "1972"],
    correctAnswer: 1,
    explanation: "The general Gauhati High Court was inaugurated in 1948, originally providing jurisdiction over Assam and its sister territories."
  },
  {
    id: "q-7",
    subject: "Polity & GK Recruitment",
    question: "How many parliamentary Lok Sabha seats represent the state of Assam in the central legislature?",
    options: ["10", "14", "20", "126"],
    correctAnswer: 1,
    explanation: "Assam is represented by exactly 14 members of Parliament (MPs) elected directly to the national Lok Sabha."
  },
  {
    id: "q-8",
    subject: "Polity & GK Recruitment",
    question: "Which Chief Minister has served as the first administrative head of Assam following India's Independence?",
    options: ["Gopinath Bordoloi", "Bishnuram Medhi", "Bimala Prasad Chaliha", "Sarat Chandra Sinha"],
    correctAnswer: 0,
    explanation: "Lokpriya Gopinath Bordoloi was the first Premier/Chief Minister of Assam, recognized for preserving Indian territorial integration."
  }
];

// Seeded other competitive student profiles for realistic scorecard benchmarks
const MOCK_COMPETITIVE_STUDENTS = [
  { name: "Gitashree Kalita", score: 8, timeSec: 42, dept: "Assamese" },
  { name: "Nayan Barua", score: 8, timeSec: 58, dept: "Botany" },
  { name: "Rohan Saikia", score: 7, timeSec: 40, dept: "Computer Science" },
  { name: "Dipankar Das", score: 7, timeSec: 55, dept: "BCA" },
  { name: "Priya Das", score: 6, timeSec: 36, dept: "Economics" },
  { name: "Partho Bora", score: 6, timeSec: 48, dept: "History" },
  { name: "Ankita Neog", score: 5, timeSec: 32, dept: "Physics" },
  { name: "Jitumoni Sarma", score: 5, timeSec: 64, dept: "Zoology" },
  { name: "Rimpi Chetia", score: 4, timeSec: 50, dept: "BBA" }
];

export default function MockTestZone({ currentUser, onLogActivity }: MockTestZoneProps) {
  // Question & subjects dynamic state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<string[]>(["All", "Assam History & GS", "Assamese Literature", "Polity & GK Recruitment"]);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  // Admin Management state
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  
  // Question Creator Form state
  const [formSubject, setFormSubject] = useState("Assam History & GS");
  const [formQuestion, setFormQuestion] = useState("");
  const [formOptions, setFormOptions] = useState<string[]>(["", "", "", ""]);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Student Test Taking State
  const [activeTestSubject, setActiveTestSubject] = useState<string | null>(null);
  const [testModeActive, setTestModeActive] = useState(false);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answerSelections, setAnswerSelections] = useState<Record<number, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const [testStartTime, setTestStartTime] = useState<number>(0);

  // Score Review & Visual State
  const [completedAttempt, setCompletedAttempt] = useState<TestAttempt | null>(null);
  const [pastAttempts, setPastAttempts] = useState<TestAttempt[]>([]);
  const [showRankings, setShowRankings] = useState(false);

  // Load and save functions
  useEffect(() => {
    // 1. Load questions
    const storedQs = localStorage.getItem("pkc_mock_test_questions");
    if (storedQs) {
      try {
        const parsed = JSON.parse(storedQs);
        setQuestions(parsed);
        extractSubjects(parsed);
      } catch (e) {
        setQuestions(DEFAULT_TEST_QUESTIONS);
        extractSubjects(DEFAULT_TEST_QUESTIONS);
      }
    } else {
      setQuestions(DEFAULT_TEST_QUESTIONS);
      localStorage.setItem("pkc_mock_test_questions", JSON.stringify(DEFAULT_TEST_QUESTIONS));
      extractSubjects(DEFAULT_TEST_QUESTIONS);
    }

    // 2. Load attempts
    const storedAttempts = localStorage.getItem("pkc_mock_test_attempts");
    if (storedAttempts) {
      try {
        setPastAttempts(JSON.parse(storedAttempts));
      } catch (e) {
        console.error("Error fetching past attempts", e);
      }
    }
  }, []);

  const extractSubjects = (qs: Question[]) => {
    const list = Array.from(new Set(qs.map(q => q.subject)));
    setSubjects(["All", ...list]);
  };

  const handleSaveQuestionsToStorage = (updated: Question[]) => {
    setQuestions(updated);
    localStorage.setItem("pkc_mock_test_questions", JSON.stringify(updated));
    extractSubjects(updated);
  };

  // Admin CRUD processes: Add or update question
  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (currentUser?.role !== "Admin") {
      setFormError("Unauthorized modification error. Admin clearance verified account only.");
      return;
    }

    if (!formQuestion.trim() || !formExplanation.trim() || !formSubject.trim()) {
      setFormError("Please satisfy all mandatory descriptive properties.");
      return;
    }

    if (formOptions.some(opt => !opt.trim())) {
      setFormError("All option fields must have explicit descriptions.");
      return;
    }

    const cleanQuestion: Question = {
      id: editingQuestionId || `q-${Date.now()}`,
      subject: formSubject.trim(),
      question: formQuestion.trim(),
      options: formOptions.map(o => o.trim()),
      correctAnswer: formCorrectAnswer,
      explanation: formExplanation.trim()
    };

    let updatedList: Question[] = [];
    if (editingQuestionId) {
      // Edit mode
      updatedList = questions.map(q => q.id === editingQuestionId ? cleanQuestion : q);
      onLogActivity("edit_book", `Admin updated mock test registry: "${cleanQuestion.question.substring(0, 30)}..."`);
      setFormSuccess("Target question revised and integrated successfully.");
    } else {
      // Add mode
      updatedList = [...questions, cleanQuestion];
      onLogActivity("add_book", `Admin added new question: "${cleanQuestion.question.substring(0, 30)}..."`);
      setFormSuccess("Added brand new academic inquiry into operational mock banks.");
    }

    handleSaveQuestionsToStorage(updatedList);
    resetForm();
  };

  const resetForm = () => {
    setEditingQuestionId(null);
    setFormQuestion("");
    setFormOptions(["", "", "", ""]);
    setFormCorrectAnswer(0);
    setFormExplanation("");
  };

  const handleEditQuestionClick = (q: Question) => {
    setEditingQuestionId(q.id);
    setFormSubject(q.subject);
    setFormQuestion(q.question);
    setFormOptions([...q.options]);
    setFormCorrectAnswer(q.correctAnswer);
    setFormExplanation(q.explanation);
    setFormError("");
    setFormSuccess("");
  };

  const handleDeleteQuestion = (id: string, text: string) => {
    if (currentUser?.role !== "Admin") {
      alert("Unauthorized modification blocked.");
      return;
    }

    if (confirm(`Completely wipe this question from live mock databases?\n"${text.substring(0, 50)}..."`)) {
      const remaining = questions.filter(q => q.id !== id);
      handleSaveQuestionsToStorage(remaining);
      onLogActivity("delete_book", `Admin withdrew exam question from active evaluation banks.`);
    }
  };

  // Student session countdown timer
  useEffect(() => {
    let interval: any;
    if (testModeActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (testModeActive && secondsRemaining === 0) {
      handleCompleteTest();
    }
    return () => clearInterval(interval);
  }, [testModeActive, secondsRemaining]);

  const handleStartPracticeTest = (subjName: string) => {
    // Collect active questions
    const matching = questions.filter(q => subjName === "All" || q.subject === subjName);
    if (matching.length === 0) {
      alert("No questions configured for this examination branch. Add some under the Admin board first!");
      return;
    }

    // Limit to maximum 10 questions for quick revisions, random shuffle
    const shuffled = [...matching].sort(() => 0.5 - Math.random()).slice(0, 8);
    
    setTestQuestions(shuffled);
    setActiveTestSubject(subjName);
    setCurrentQIndex(0);
    setAnswerSelections({});
    setSecondsRemaining(shuffled.length * 40); // 40 seconds per question
    setTestStartTime(Date.now());
    setCompletedAttempt(null);
    setShowRankings(false);
    setTestModeActive(true);
  };

  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    setAnswerSelections(prev => ({
      ...prev,
      [qIndex]: optIndex
    }));
  };

  const handleCompleteTest = () => {
    setTestModeActive(false);
    
    const elapsedSeconds = Math.floor((Date.now() - testStartTime) / 1000);
    
    // Evaluate correctness
    let correctCount = 0;
    const answerSummary = testQuestions.map((q, idx) => {
      const selected = answerSelections[idx];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        qId: q.id,
        selectedIndex: selected !== undefined ? selected : -1,
        isCorrect: selected !== undefined ? isCorrect : false
      };
    });

    const newAttempt: TestAttempt = {
      id: `at-${Date.now()}`,
      userId: currentUser?.id || "student-guest",
      userName: currentUser?.name || "Student Guest",
      subject: activeTestSubject || "General Revision",
      score: correctCount,
      totalQuestions: testQuestions.length,
      timeElapsedSeconds: elapsedSeconds,
      date: new Date().toISOString().split("T")[0],
      answers: answerSummary
    };

    const nextAttempts = [newAttempt, ...pastAttempts];
    setPastAttempts(nextAttempts);
    localStorage.setItem("pkc_mock_test_attempts", JSON.stringify(nextAttempts));

    setCompletedAttempt(newAttempt);
    setShowRankings(true);
  };

  // Rankings and Competition Engine (Ranks evaluated out of 10 points ratio)
  const getLeaderboardForAttempt = (attempt: TestAttempt) => {
    // Map scores to a standardized 10-point scale
    const userScaledScore = Math.round((attempt.score / attempt.totalQuestions) * 10);
    
    const fullList = MOCK_COMPETITIVE_STUDENTS.map(student => ({
      name: student.name,
      score: student.score,
      timeSec: student.timeSec,
      dept: student.dept,
      isCurrentUser: false
    }));

    fullList.push({
      name: `${attempt.userName} (You)`,
      score: userScaledScore,
      timeSec: attempt.timeElapsedSeconds,
      dept: currentUser?.role === "Student" ? "Current Scholar" : "Adviser",
      isCurrentUser: true
    });

    // Sort by score (descending), then by faster time (ascending)
    return fullList.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSec - b.timeSec;
    });
  };

  const getRankAndTotal = (attempt: TestAttempt) => {
    const list = getLeaderboardForAttempt(attempt);
    const myIndex = list.findIndex(item => item.isCurrentUser);
    return {
      rank: myIndex + 1,
      total: list.length
    };
  };

  // Analytical Track Report Aggregates
  const totalCompletedCount = pastAttempts.filter(a => a.userId === currentUser?.id).length;
  
  const getSubjectAverages = () => {
    const userAttempts = pastAttempts.filter(a => a.userId === currentUser?.id);
    if (userAttempts.length === 0) return {};
    
    const totals: Record<string, { sum: number; count: number }> = {};
    userAttempts.forEach(att => {
      const p = (att.score / att.totalQuestions) * 100;
      if (!totals[att.subject]) totals[att.subject] = { sum: 0, count: 0 };
      totals[att.subject].sum += p;
      totals[att.subject].count += 1;
    });

    const avgs: Record<string, number> = {};
    Object.keys(totals).forEach(k => {
      avgs[k] = Math.round(totals[k].sum / totals[k].count);
    });
    return avgs;
  };

  const subjectAverages = getSubjectAverages();

  // Find strongest vs weakest categories
  const getStrengthAnalysis = () => {
    const avgs = Object.entries(subjectAverages);
    if (avgs.length === 0) return { strong: "N/A", weak: "N/A", desc: "No tracking evaluations logged yet." };
    
    avgs.sort((a, b) => b[1] - a[1]);
    const strong = avgs[0];
    const weak = avgs[avgs.length - 1];

    let desc = `Strongest performance observed in ${strong[0]} (${strong[1]}% average accuracy). `;
    if (avgs.length > 1 && weak[1] < 70) {
      desc += `Requires tactical study focus in ${weak[0]} (currently averaging ${weak[1]}% accuracy).`;
    } else {
      desc += "High proficiency maintained in verified review components.";
    }

    return {
      strong: strong[0],
      weak: avgs.length > 1 && weak[1] < 80 ? weak[0] : "None (All High)",
      desc
    };
  };

  const strengthAnalysis = getStrengthAnalysis();

  return (
    <div id="pkc-mock-test-workspace" className="bg-slate-905 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-8 text-left">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <GraduationCap className="h-4.5 w-4.5 animate-pulse" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">
              Academic Assessment Terminal
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5 flex items-center gap-2">
            APSC & Competitive Revision Lounge
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Take mock test revisions. All test bank configurations are managed securely by institutional administrators. Complete examinations to generate verified student rank placements and performance track reports.
          </p>
        </div>

        {/* Dashboard shortcut statistics */}
        <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-850 p-4 rounded-2xl w-fit self-start md:self-auto">
          <div className="text-center font-mono">
            <span className="text-[9px] font-bold text-slate-500 block leading-tight uppercase">Assessments Taken</span>
            <p className="text-lg font-bold text-emerald-400">{totalCompletedCount} Sessions</p>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center font-mono">
            <span className="text-[9px] font-bold text-slate-500 block leading-tight uppercase">Strength Focus</span>
            <p className="text-xs font-bold text-amber-400 mt-1 truncate max-w-[120px]">{strengthAnalysis.strong}</p>
          </div>
        </div>
      </div>

      {/* 2. Admin vs Student Menu Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-1.5 border border-slate-900 rounded-xl">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => { setTestModeActive(false); setCompletedAttempt(null); setIsAdminPanelOpen(false); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              !isAdminPanelOpen && !testModeActive && !completedAttempt
                ? "bg-slate-800 text-white border border-slate-750"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-4 w-4 text-emerald-400" />
            Selection Lobby
          </button>

          {totalCompletedCount > 0 && (
            <button
              onClick={() => {
                setTestModeActive(false);
                setIsAdminPanelOpen(false);
                // Load last complete attempt as a report sample
                const myAttempts = pastAttempts.filter(a => a.userId === currentUser?.id);
                if (myAttempts.length > 0) {
                  setCompletedAttempt(myAttempts[0]);
                  setShowRankings(false);
                }
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                completedAttempt && !testModeActive && !isAdminPanelOpen
                  ? "bg-slate-800 text-white border border-slate-750"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="h-4 w-4 text-cyan-400" />
              Progress & Track Report
            </button>
          )}
        </div>

        {currentUser?.role === "Admin" ? (
          <button
            onClick={() => {
              setTestModeActive(false);
              setCompletedAttempt(null);
              setIsAdminPanelOpen(true);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              isAdminPanelOpen
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-800"
                : "bg-slate-900/60 text-slate-300 border-slate-800 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" />
            Administrative Terminals
          </button>
        ) : (
          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 px-3">
            <span className="h-1.5 w-1.5 bg-slate-550 rounded-full animate-pulse" />
            Client Account: Revision Privileges Active
          </div>
        )}
      </div>

      {/* 3. CORE INTERACTIVE CONTAINER */}

      {/* A. ACTIVE EXAM TAKING FRAME (No daily quize references) */}
      {testModeActive && activeTestSubject && (
        <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6 md:p-8 space-y-6 animate-fade-in relative overflow-hidden">
          {/* Top telemetry bar */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-850 pb-4">
            <div>
              <span className="text-[9px] font-mono font-bold text-emerald-405 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/45 uppercase">
                Active Assessment Session
              </span>
              <h3 className="text-white font-bold text-sm sm:text-base mt-1.5">
                Practice Theme: {activeTestSubject === "All" ? "Comprehensive Syllabus Core" : activeTestSubject}
              </h3>
            </div>

            {/* Live timer clock */}
            <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl font-mono text-xs font-bold ${
              secondsRemaining < 20
                ? "bg-rose-950/20 text-rose-400 border-rose-900/50 animate-pulse"
                : "bg-slate-950 text-emerald-400 border-slate-850"
            }`}>
              <Clock className="h-4 w-4 text-current animate-spin" />
              <span>
                Assessment Clock: {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Question Index Progress Tracker dots */}
          <div className="flex flex-wrap items-center gap-1.5">
            {testQuestions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQIndex(i)}
                className={`h-7 w-7 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center border cursor-pointer ${
                  currentQIndex === i
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : answerSelections[i] !== undefined
                    ? "bg-slate-850 text-slate-300 border-slate-750"
                    : "bg-slate-950 text-slate-500 border-slate-900 hover:text-slate-350"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Question Text block */}
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-mono font-medium">Inquiry Card #{currentQIndex + 1} of {testQuestions.length}</span>
              <h4 className="text-white text-base sm:text-lg font-extrabold leading-relaxed">
                {testQuestions[currentQIndex]?.question}
              </h4>
            </div>

            {/* Answer Options listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {testQuestions[currentQIndex]?.options.map((option, optIdx) => {
                const isSelected = answerSelections[currentQIndex] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectAnswer(currentQIndex, optIdx)}
                    className={`p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? "bg-emerald-950/40 border-emerald-500 text-emerald-250 shadow-md translate-x-1"
                        : "bg-slate-950/50 border-slate-850 text-slate-300 hover:bg-slate-900 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-6 w-6 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center border transition ${
                        isSelected 
                          ? "bg-emerald-600 text-white border-emerald-400"
                          : "bg-slate-900 text-slate-500 border-slate-800 group-hover:text-slate-300"
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom workflow bar */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-850">
            <button
              onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className={`px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition ${
                currentQIndex === 0
                  ? "border-slate-850/40 text-slate-650 cursor-not-allowed"
                  : "border-slate-800 hover:bg-slate-850 text-slate-350 hover:text-white"
              }`}
            >
              Previous Card
            </button>

            {currentQIndex < testQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQIndex(prev => prev + 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                Next Inquiry
              </button>
            ) : (
              <button
                onClick={handleCompleteTest}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.03] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="h-4 w-4" />
                Produce Revision Report
              </button>
            )}
          </div>
        </div>
      )}


      {/* B. REPORT CARD WITH LEADERBOARD RANKING & TRACK REPORT EXPLANATIONS */}
      {completedAttempt && !testModeActive && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Top Dashboard score widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Scorecard panel */}
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-56 relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 h-24 w-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div>
                <span className="text-[9px] font-mono text-emerald-405 font-bold tracking-widest block uppercase">Personal Evaluation Scorecard</span>
                <h4 className="text-lg font-extrabold text-white mt-1">Revision Performance</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{completedAttempt.subject} - {completedAttempt.date}</p>
              </div>

              <div className="py-2 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight font-mono">
                  {completedAttempt.score}
                </span>
                <span className="text-sm font-bold text-slate-500">/ {completedAttempt.totalQuestions} Right</span>
                <span className="text-xs bg-slate-850 text-slate-350 px-2.5 py-1 rounded-xl font-semibold ml-auto font-mono">
                  Accuracy: {Math.round((completedAttempt.score / completedAttempt.totalQuestions) * 100)}%
                </span>
              </div>

              <div className="text-[10.5px] text-slate-400 border-t border-slate-900 pt-2 flex items-center justify-between">
                <span>Completed in: <strong className="text-slate-100 font-mono">{completedAttempt.timeElapsedSeconds}s</strong></span>
                <span className="text-emerald-450 uppercase font-mono font-bold text-[9px] flex items-center gap-0.5">
                  <CheckCircle className="h-3 w-3" /> Report generated
                </span>
              </div>
            </div>

            {/* Ranking assessment (THE REQUESTED RANKING COMPONENT) */}
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-56 relative overflow-hidden">
              <div className="absolute top-2 right-2 flex opacity-10">
                <Trophy className="h-28 w-28 text-amber-400" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-amber-500 font-bold tracking-widest block uppercase">Global Scholar Placement</span>
                <h4 className="text-lg font-extrabold text-white mt-1">APSC Competency Rank</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Assessed against {MOCK_COMPETITIVE_STUDENTS.length} standard aspirants</p>
              </div>

              <div className="py-2 flex items-baseline gap-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 w-fit">
                <Trophy className="h-5 w-5 text-amber-400 mr-1.5 self-center" />
                <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight font-mono">
                  #{getRankAndTotal(completedAttempt).rank}
                </span>
                <span className="text-xs text-slate-400 font-mono">Rank out of {getRankAndTotal(completedAttempt).total}</span>
              </div>

              <div className="text-[10.5px] text-slate-400 border-t border-slate-900 pt-2 flex items-center gap-1.5">
                <button
                  onClick={() => setShowRankings(prev => !prev)}
                  className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer font-bold flex items-center gap-1 font-mono uppercase text-[9.5px]"
                >
                  {showRankings ? "Hide Ranking Ledger" : "Reveal Leaderboard Board"} →
                </button>
              </div>
            </div>

            {/* Strength diagnostic breakdown (TRACK REPORT COMPONENT) */}
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-56 relative overflow-hidden">
              <div>
                <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-widest block uppercase">Skill Track Diagnostic</span>
                <h4 className="text-lg font-extrabold text-white mt-1">Strength Track report</h4>
                <p className="text-[10.5px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                  {strengthAnalysis.desc}
                </p>
              </div>

              <div className="py-2.5">
                <div className="text-[10.5px] space-y-1.5">
                  <div className="flex justify-between text-slate-450 font-mono">
                    <span>Highest Category Avg:</span>
                    <span className="text-emerald-400 font-bold">{strengthAnalysis.strong} ({subjectAverages[strengthAnalysis.strong] || 0}%)</span>
                  </div>
                  <div className="flex justify-between text-slate-450 font-mono">
                    <span>Active Weak Focus:</span>
                    <span className="text-amber-400 font-bold">{strengthAnalysis.weak}</span>
                  </div>
                </div>
              </div>

              <div className="text-[10.5px] text-slate-400 border-t border-slate-900 pt-2 flex justify-between">
                <span>Total Attempts logged: <strong className="text-white font-mono">{totalCompletedCount}</strong></span>
                <span className="text-cyan-455 uppercase font-mono font-bold text-[9px]">Calculated Live</span>
              </div>
            </div>
            
          </div>

          {/* Toggleable Leaderboard Panel */}
          {showRankings && (
            <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <h4 className="text-white font-bold text-sm tracking-tight flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    APSC Mock Evaluation - Leaderboard Ranking
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Ranked by points scored (scaled to 10 points), then by fastest completion times.</p>
                </div>
                <span className="text-[9.5px] bg-amber-950/50 border border-amber-900/60 text-amber-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  Institutional Rank Board
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-mono uppercase text-[9px] tracking-wider">
                      <th className="py-2 pl-3">Rank Placement</th>
                      <th className="py-2">Student Name</th>
                      <th className="py-2">Academic Dept</th>
                      <th className="py-2 text-right">Scaled Score</th>
                      <th className="py-2 pr-3 text-right">Elapsed Clock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40 font-medium">
                    {getLeaderboardForAttempt(completedAttempt).map((row, idx) => {
                      const isMe = row.isCurrentUser;
                      return (
                        <tr 
                          key={idx} 
                          className={`transition ${
                            isMe 
                              ? "bg-emerald-950/35 text-emerald-300 border-l-2 border-emerald-500 font-bold" 
                              : "text-slate-350 hover:bg-slate-900/40"
                          }`}
                        >
                          <td className="py-3 pl-3 font-mono">
                            {idx === 0 ? "🥇 Rank 1" : idx === 1 ? "🥈 Rank 2" : idx === 2 ? "🥉 Rank 3" : `Rank ${idx + 1}`}
                          </td>
                          <td className="py-3">{row.name}</td>
                          <td className="py-3 text-slate-505 text-[10.5px]">{row.dept}</td>
                          <td className={`py-3 text-right font-mono font-bold ${isMe ? "text-emerald-400" : "text-slate-200"}`}>
                            {row.score} / 10
                          </td>
                          <td className="py-3 text-right font-mono text-slate-450 pr-3">{row.timeSec}s</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* Detailed Question Review & Corrections Tracker */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm tracking-tight flex items-center gap-1.5 pl-1">
              <FileText className="h-4 w-4 text-emerald-400" />
              Comprehensive Answer Corrections & Insights Review
            </h4>

            <div className="grid grid-cols-1 gap-4">
              {testQuestions.map((q, qIdx) => {
                const userAns = answerSelections[qIdx];
                const isCorrect = userAns === q.correctAnswer;
                
                return (
                  <div 
                    key={q.id} 
                    className={`p-5 rounded-2xl border ${
                      userAns === undefined
                        ? "bg-slate-900/10 border-slate-850 text-slate-500"
                        : isCorrect
                        ? "bg-emerald-955/15 border-emerald-950/60 text-slate-200"
                        : "bg-rose-955/15 border-rose-950/40 text-slate-200"
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className={`h-6 w-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 border ${
                        userAns === undefined
                          ? "bg-slate-950 border-slate-900 text-slate-500"
                          : isCorrect
                          ? "bg-emerald-950 border-emerald-800 text-emerald-400"
                          : "bg-rose-950 border-rose-900/50 text-rose-455 animate-shake"
                      }`}>
                        {qIdx + 1}
                      </span>
                      
                      <div className="space-y-3.5 w-full">
                        <div>
                          <span className="text-[9.5px] uppercase font-bold tracking-wider text-slate-500 block leading-none mb-1.5">{q.subject}</span>
                          <h5 className="font-bold text-sm text-white leading-relaxed">{q.question}</h5>
                        </div>

                        {/* Selected vs Correct answers text info */}
                        <div className="text-xs space-y-2 max-w-2xl bg-slate-950/50 p-3 rounded-xl border border-slate-900">
                          <div className="flex gap-2">
                            <span className="text-slate-500 font-mono w-28">Your response:</span>
                            <span className={isCorrect ? "font-bold text-emerald-400" : "font-bold text-rose-455"}>
                              {userAns !== undefined ? `${String.fromCharCode(65 + userAns)}) ${q.options[userAns]}` : "Declined to answer (0 points)"}
                            </span>
                          </div>

                          {!isCorrect && (
                            <div className="flex gap-2 border-t border-slate-900/65 pt-1.5">
                              <span className="text-slate-500 font-mono w-28">Target key:</span>
                              <span className="font-bold text-emerald-400">
                                {String.fromCharCode(65 + q.correctAnswer)}) {q.options[q.correctAnswer]}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Explanation insights */}
                        <p className="text-xs text-slate-400 italic pl-3 border-l border-emerald-505/20 leading-relaxed">
                          <strong className="text-emerald-400 not-italic font-mono uppercase text-[9.5px] mr-1.5">Explanatory Note:</strong>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => { setCompletedAttempt(null); setTestModeActive(false); }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 rounded-xl text-xs font-bold border border-slate-850 shadow transition cursor-pointer"
              >
                Back to Assessment Lobby
              </button>
            </div>
          </div>
        </div>
      )}


      {/* C. LOBBY VIEW - LIST TESTS BY SUBJECT */}
      {!testModeActive && !completedAttempt && !isAdminPanelOpen && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Custom SVG line-trend tracking report over attempts */}
          {pastAttempts.filter(a => a.userId === currentUser?.id).length > 1 && (
            <div className="bg-slate-900/35 border border-slate-800/80 p-5 rounded-2xl space-y-4">
              <div>
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                  Performance Track Report: Historical Score Trend
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Custom computed trajectory of aggregate test competencies logged over sequential sessions.</p>
              </div>

              {/* Responsive custom SVG line chart */}
              <div className="w-full h-32 flex items-end justify-between px-4 pt-4 pb-2 bg-slate-950/60 border border-slate-850 rounded-xl relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none opacity-[0.03]">
                  <div className="border-b border-white w-full h-px" />
                  <div className="border-b border-white w-full h-px" />
                  <div className="border-b border-white w-full h-px" />
                </div>

                {pastAttempts
                  .filter(a => a.userId === currentUser?.id)
                  .slice()
                  .reverse()
                  .map((att, i, arr) => {
                    const percent = Math.round((att.score / att.totalQuestions) * 100);
                    const barHeight = Math.max(12, percent);
                    return (
                      <div key={att.id} className="flex flex-col items-center flex-1 group relative">
                        {/* Hover Tooltip card detail */}
                        <div className="absolute bottom-full mb-2 bg-slate-900 border border-slate-750 text-white rounded p-1.5 text-[8.5px] font-mono leading-tight shadow-md hidden group-hover:block z-10 w-28">
                          <p className="font-bold text-center text-emerald-400">{percent}% Correct</p>
                          <p className="text-slate-500 text-[7px] text-center">{att.subject}</p>
                          <p className="text-slate-500 text-[6.5px] text-center">{att.date}</p>
                        </div>

                        <div className="w-6 sm:w-8 bg-slate-950 rounded-lg overflow-hidden flex flex-col justify-end h-20 border border-slate-850 shadow-inner">
                          <div 
                            className="bg-emerald-600 rounded-t-md hover:bg-emerald-500 transition-all duration-300 shadow group-hover:animate-pulse"
                            style={{ height: `${barHeight}%` }}
                          />
                        </div>
                        <span className="text-[8.5px] font-mono mt-1 px-1 py-0.5 rounded text-slate-500 group-hover:text-white transition">
                          S{i + 1}
                        </span>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          )}

          {/* Academic subject divisions selection list */}
          <div className="space-y-3.5">
            <h4 className="text-slate-350 font-bold font-mono text-xs tracking-wider uppercase pl-0.5">
              Select Examination Divisions:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* All syllabus comprehensive core test */}
              <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/35 px-2 py-0.5 rounded border border-emerald-900/40 uppercase">
                      Core Syllabus
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {questions.length} Items Configured
                    </span>
                  </div>

                  <h4 className="text-white font-extrabold text-sm mt-3 group-hover:text-emerald-400 transition">
                    Comprehensive Syllabus Mock
                  </h4>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Evaluates concepts across all categories including Assamese culture, state polity structures, and general history profiles.
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-900 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono">No. of cards: ~8 random</span>
                  <button
                    onClick={() => handleStartPracticeTest("All")}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 hover:scale-102 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    Begin Prep →
                  </button>
                </div>
              </div>

              {/* Categorised options */}
              {subjects.filter(s => s !== "All").map((subj) => {
                const count = questions.filter(q => q.subject === subj).length;
                return (
                  <div key={subj} className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-850 uppercase">
                          Syllabus block
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {count} Questions
                        </span>
                      </div>

                      <h4 className="text-white font-extrabold text-sm mt-3 group-hover:text-emerald-400 transition">
                        {subj} Revise Unit
                      </h4>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                        Meticulous competitive card drilling covering designated scopes on target {subj} sub-components.
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-900 flex justify-between items-center">
                      <span className="text-[10px] text-slate-505 font-mono">Precision study tracker</span>
                      <button
                        onClick={() => handleStartPracticeTest(subj)}
                        disabled={count === 0}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          count === 0
                            ? "bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-500 hover:scale-102 text-white"
                        }`}
                      >
                        {count === 0 ? "Empty Unit" : "Begin Prep →"}
                      </button>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Historical Attempts Ledger Section */}
          {pastAttempts.filter(a => a.userId === currentUser?.id).length > 0 && (
            <div className="space-y-3.5 pt-4">
              <h4 className="text-slate-350 font-bold font-mono text-xs tracking-wider uppercase pl-0.5">
                Archived Assessment Histories ({pastAttempts.filter(a => a.userId === currentUser?.id).length})
              </h4>

              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl overflow-hidden">
                <div className="p-4 bg-slate-900/20 border-b border-slate-850/60 font-mono text-[9.5px] text-slate-500 flex justify-between">
                  <span>LOGGED SESSION SUMMARY</span>
                  <span>RECORD RETENTION SYSTEMS</span>
                </div>
                
                <div className="divide-y divide-slate-900/60">
                  {pastAttempts
                    .filter(a => a.userId === currentUser?.id)
                    .map((item) => {
                      const pct = Math.round((item.score / item.totalQuestions) * 100);
                      return (
                        <div 
                          key={item.id} 
                          className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-900/20 transition cursor-pointer"
                          onClick={() => {
                            setCompletedAttempt(item);
                            setShowRankings(false);
                          }}
                        >
                          <div className="space-y-1">
                            <h5 className="font-bold text-white text-xs sm:text-sm">{item.subject}</h5>
                            <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-450 font-mono">
                              <span>Clocked: {item.timeElapsedSeconds}s</span>
                              <span>•</span>
                              <span>Date: {item.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <div className="text-right">
                              <span className="block text-[11px] font-bold text-white font-mono">{item.score} / {item.totalQuestions} Correct</span>
                              <span className={`text-[9px] font-mono font-black ${pct >= 70 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                                {pct}% Accuracy
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-600" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

        </div>
      )}


      {/* D. PRIVATE INTERACTIVE ADMIN MANAGEMENT CONTROL UNIT */}
      {isAdminPanelOpen && !testModeActive && currentUser?.role === "Admin" && (
        <div className="space-y-8 animate-fade-in relative">
          
          <div className="flex justify-between items-center border-b border-slate-900 pb-4">
            <div>
              <span className="text-[9px] font-mono text-emerald-450 bg-emerald-950 font-bold px-2 py-0.5 rounded border border-emerald-900/60 uppercase">
                Staff Credentials Verified
              </span>
              <h3 className="text-white font-bold text-base sm:text-lg mt-1.5">
                Competitive Mock Questions Bank Manager & Editor
              </h3>
            </div>
            
            <button
              onClick={() => setIsAdminPanelOpen(false)}
              className="text-xs text-slate-450 hover:text-white cursor-pointer px-3 py-1.5 border border-slate-800 bg-slate-900 rounded-lg"
            >
              Close Admin Terminal
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left column: Create and Edit Question form */}
            <div className="lg:col-span-5 bg-slate-900/35 border border-slate-805 p-5 rounded-2xl h-fit space-y-4">
              <h4 className="text-white font-black text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                {editingQuestionId ? <Edit className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4 text-emerald-400" />}
                {editingQuestionId ? "Edit Existing Live Question" : "Create New Live Study Question"}
              </h4>

              {formSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-xs rounded-xl font-medium leading-relaxed">
                  ✓ {formSuccess}
                </div>
              )}

              {formError && (
                <div className="p-3 bg-rose-955/20 border border-rose-900/60 text-rose-400 text-xs rounded-xl font-medium leading-relaxed">
                  ⚠️ {formError}
                </div>
              )}

              <form onSubmit={handleSubmitQuestion} className="space-y-4 text-xs font-semibold">
                
                {/* Subject selection */}
                <div>
                  <label className="block text-[9.5px] uppercase font-mono tracking-wider text-slate-500 mb-1">
                    Academic Subject Section
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-350 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Assam History & GS">Assam History & GS</option>
                    <option value="Assamese Literature">Assamese Literature</option>
                    <option value="Polity & GK Recruitment">Polity & GK Recruitment</option>
                  </select>
                </div>

                {/* Question descriptive */}
                <div>
                  <label className="block text-[9.5px] uppercase font-mono tracking-wider text-slate-500 mb-1">
                    Question Descriptive Text *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formQuestion}
                    onChange={(e) => setFormQuestion(e.target.value)}
                    placeholder="e.g., In which century was the classical Satriya dance formulated in Assam?"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-200 placeholder-slate-655 focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>

                {/* Options loops */}
                <div className="space-y-2.5">
                  <label className="block text-[9.5px] uppercase font-mono tracking-wider text-slate-500">
                    Distractor Choices & Option Text Cards *
                  </label>
                  
                  {formOptions.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <span className="w-5 font-mono text-slate-500 font-bold text-center">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <input
                        required
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const nextOpts = [...formOptions];
                          nextOpts[oIdx] = e.target.value;
                          setFormOptions(nextOpts);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                        className="flex-1 bg-slate-950 border border-slate-850 rounded-xl py-1.5 px-3 text-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                  ))}
                </div>

                {/* Correct answer identifier */}
                <div>
                  <label className="block text-[9.5px] uppercase font-mono tracking-wider text-slate-500 mb-1">
                    Identify Verified Correct Answer Option *
                  </label>
                  <select
                    value={formCorrectAnswer}
                    onChange={(e) => setFormCorrectAnswer(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-350 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value={0}>A is the Correct Key</option>
                    <option value={1}>B is the Correct Key</option>
                    <option value={2}>C is the Correct Key</option>
                    <option value={3}>D is the Correct Key</option>
                  </select>
                </div>

                {/* Explanation text block */}
                <div>
                  <label className="block text-[9.5px] uppercase font-mono tracking-wider text-slate-500 mb-1">
                    Explanatory Insight / Correction Notes *
                  </label>
                  <textarea
                    required
                    rows={2.5}
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Provide a historical source or reasoning explanation to guide students..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-slate-305 placeholder-slate-655 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
                  >
                    {editingQuestionId ? "Save Live Revision" : "Integrate to Live Bank"}
                  </button>
                  
                  {editingQuestionId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3.5 py-2 border border-slate-850 text-slate-350 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

              </form>
            </div>

            {/* Right column: Current live list of questions */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-white font-mono text-xs uppercase tracking-wider pl-1 font-bold">
                  Active Question Repositories ({questions.length})
                </h4>
                <p className="text-[10px] text-slate-500 font-mono">Modifications directly affects live tests</p>
              </div>

              <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
                {questions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3 hover:border-slate-800 transition">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-emerald-450 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded">
                          {q.subject}
                        </span>
                        <h5 className="font-bold text-white text-xs sm:text-sm mt-2 leading-relaxed">
                          {qIndex + 1}. {q.question}
                        </h5>
                      </div>

                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleEditQuestionClick(q)}
                          title="Edit Question Attributes"
                          className="p-1 px-1.5 rounded border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id, q.question)}
                          title="Wipe Out Question"
                          className="p-1 px-1.5 rounded border border-slate-800 hover:bg-rose-955/40 text-slate-400 hover:text-rose-455 transition cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Show options listing */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-900/60">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={q.correctAnswer === oIdx ? "text-emerald-400 font-bold" : ""}>
                          {String.fromCharCode(65 + oIdx)}) {opt} {q.correctAnswer === oIdx && "✓"}
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-505 leading-relaxed bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 italic">
                      <strong className="text-emerald-450 not-italic uppercase text-[9.5px] font-mono mr-1">Correction tip:</strong>
                      {q.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

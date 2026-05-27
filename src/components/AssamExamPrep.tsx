/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Trophy, Clock, ClipboardList, Plus, Trash2, HelpCircle, Loader2 } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of options
  explanation: string;
}

interface ExamSubject {
  id: string;
  name: string;
  questions: Question[];
}

const EXAM_SUBJECTS: ExamSubject[] = [
  {
    id: "gs-assam",
    name: "Assam History & GS",
    questions: [
      {
        id: 1,
        question: "Who was the first ruler of the Ahom Kingdom in Assam?",
        options: ["Rudra Singha", "Sukaphaa", "Pramatta Singha", "Gadadhar Singha"],
        correctAnswer: 1,
        explanation: "Sukaphaa was the founder of the Ahom kingdom in Assam, established in 1228, which ruled for nearly 600 years."
      },
      {
        id: 2,
        question: "The Battle of Saraighat was fought between the Ahoms and Mughals in which year?",
        options: ["1526", "1605", "1671", "1682"],
        correctAnswer: 2,
        explanation: "The Battle of Saraighat was fought in 1671 on the Brahmaputra River under the military leadership of Lachit Borphukan."
      },
      {
        id: 3,
        question: "Which reserve forest was declared as the the 7th National Park of Assam?",
        options: ["Dihing Patkai", "Raimona", "Nameri", "Orang"],
        correctAnswer: 0,
        explanation: "Dihing Patkai was declared as the 7th National Park of Assam in June 2021, often called the 'Amazon of the East'."
      },
      {
        id: 4,
        question: "Which day is celebrated as Assam's official Lachit Divas annually?",
        options: ["October 2", "November 24", "December 2", "January 26"],
        correctAnswer: 1,
        explanation: "Lachit Divas is celebrated on November 24th to honor the birth and bravery of Lachit Borphukan, the legendary Ahom General."
      },
      {
        id: 5,
        question: "In which year did the British formally annex Assam following the Treaty of Yandabo?",
        options: ["1826", "1857", "1893", "1905"],
        correctAnswer: 0,
        explanation: "The Treaty of Yandabo in 1826 marked the end of the First Anglo-Burmese War and the beginning of British colonial administration in Assam."
      }
    ]
  },
  {
    id: "assamese-lit",
    name: "Assamese Literature",
    questions: [
      {
        id: 6,
        question: "Who compiled the first etymological Assamese dictionary 'Hemkosh'?",
        options: ["Hemchandra Barua", "Lakshminath Bezbaroa", "Nathan Brown", "Jyoti Prasad Agarwala"],
        correctAnswer: 0,
        explanation: "Hemchandra Barua compiled the dictionary 'Hemkosh' in the late 19th century, serving as the linguistic standard for spelling."
      },
      {
        id: 7,
        question: "Who was the first Assamese writer to receive the prestigious Jnanpith Award?",
        options: ["Indira Goswami", "Birendra Kumar Bhattacharya", "Homen Borgohain", "Nilmani Phookan"],
        correctAnswer: 1,
        explanation: "Dr. Birendra Kumar Bhattacharya won the Jnanpith Award in 1979 for his landmark Assamese novel 'Mrityunjay'."
      },
      {
        id: 8,
        question: "The famous collection of folk tales 'Burhi Aair Xadhu' was written by whom?",
        options: ["Lakshminath Bezbaroa", "Padmanath Gohain Baruah", "Agatha Christie", "Jyoti Prasad Agarwala"],
        correctAnswer: 0,
        explanation: "Lakshminath Bezbaroa composed 'Burhi Aair Xadhu' (Grandmother's Tales), a staple of Assamese children's literature."
      },
      {
        id: 9,
        question: "The Assamese patriotic song 'O Mur Apunar Desh' was first published in which magazine?",
        options: ["Orunodoi", "Jonaki", "Bahi", "Alochyani"],
        correctAnswer: 2,
        explanation: "'O Mur Apunar Desh' by Lakshminath Bezbaroa was first published in the Assamese journal 'Bahi' in 1909."
      },
      {
        id: 10,
        question: "Who is popularly known as 'Rupkonwar' in Assamese culture?",
        options: ["Bishnu Prasad Rabha", "Jyoti Prasad Agarwala", "Bhupen Hazarika", "Phani Sarma"],
        correctAnswer: 1,
        explanation: "Jyoti Prasad Agarwala, a revolutionary playwright, filmmaker, and lyricist, is revered as 'Rupkonwar'."
      }
    ]
  },
  {
    id: "polity-gk",
    name: "Polity & Recruitment Prep",
    questions: [
      {
        id: 11,
        question: "High Court of Assam (Gauhati High Court) is established in which year?",
        options: ["1935", "1948", "1950", "1972"],
        correctAnswer: 1,
        explanation: "The Gauhati High Court was established in 1948, originally known as the High Court of Assam and Nagaland."
      },
      {
        id: 12,
        question: "How many Lok Sabha constituencies represent the State of Assam?",
        options: ["14", "7", "20", "126"],
        correctAnswer: 0,
        explanation: "Assam is represented by 14 Members of Parliament (MPs) in the Lok Sabha (Lower House of Parliament)."
      },
      {
        id: 13,
        question: "The headquarters of the Assam Police force is situated at which location?",
        options: ["Dispur, Guwahati", "Ulubari, Guwahati", "Jorhat Police Lines", "Silchar Cachar Bureau"],
        correctAnswer: 1,
        explanation: "The Director General of Assam Police operates from the general headquarters located at Ulubari, Guwahati."
      },
      {
        id: 14,
        question: "Who was the first Chief Minister of Assam after Indian Independence?",
        options: ["Gopinath Bordoloi", "Bishnuram Medhi", "Bimala Prasad Chaliha", "Sarat Chandra Sinha"],
        correctAnswer: 0,
        explanation: "Lokpriya Gopinath Bordoloi became the first Chief Minister of Assam, recognized for keeping Assam integrated with India during Partition."
      },
      {
        id: 15,
        question: "Which article of the Indian Constitution grants special provisions to North Eastern states?",
        options: ["Article 370", "Article 371-B", "Article 356", "Article 244"],
        correctAnswer: 1,
        explanation: "Article 371-B of the Constitution contains special provisions concerning the State of Assam."
      }
    ]
  }
];

interface DailyGoal {
  id: string;
  text: string;
  completed: boolean;
  timestamp: string;
}

export default function AssamExamPrep() {
  const [activeSubjectId, setActiveSubjectId] = useState<string>("gs-assam");
  
  // Quiz State
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [questionStats, setQuestionStats] = useState<{ qIndex: number; selected: number; isCorrect: boolean }[]>([]);

  // Daily Tasks/Goals State
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [newGoalText, setNewGoalText] = useState<string>(" ");

  // Load goals from localstorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pkc_library_exam_goals");
      if (saved) {
        setGoals(JSON.parse(saved));
      } else {
        // Preset goals for demonstration
        const defaultGoals: DailyGoal[] = [
          { id: "g1", text: "Practice 1 daily mock test for APSC exam preparation", completed: true, timestamp: "2026-05-26" },
          { id: "g2", text: "Read 2 chapters on Ahom history in Assam History book", completed: false, timestamp: "2026-05-26" },
          { id: "g3", text: "Search and read an excerpt of Burhi Aair Xadhu", completed: false, timestamp: "2026-05-26" }
        ];
        setGoals(defaultGoals);
        localStorage.setItem("pkc_library_exam_goals", JSON.stringify(defaultGoals));
      }
    } catch (e) {
      console.error("Localstorage goals fetch error", e);
    }
  }, []);

  // Save goals helper
  const saveGoals = (updated: DailyGoal[]) => {
    setGoals(updated);
    try {
      localStorage.setItem("pkc_library_exam_goals", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleGoal = (id: string) => {
    const next = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    saveGoals(next);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newGoalText.trim();
    if (!clean) return;
    const added: DailyGoal = {
      id: "g_" + Date.now(),
      text: clean,
      completed: false,
      timestamp: new Date().toISOString().split("T")[0]
    };
    saveGoals([...goals, added]);
    setNewGoalText("");
  };

  const handleDeleteGoal = (id: string) => {
    const next = goals.filter(g => g.id !== id);
    saveGoals(next);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setUserScore(0);
    setQuizFinished(false);
    setQuestionStats([]);
  };

  const activeSubject = EXAM_SUBJECTS.find(s => s.id === activeSubjectId) || EXAM_SUBJECTS[0];
  const currentQuestion = activeSubject.questions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswerIndex !== null) return; // Prevent changing answer
    setSelectedAnswerIndex(index);
    const isCorrect = index === currentQuestion.correctAnswer;
    if (isCorrect) {
      setUserScore(prev => prev + 1);
    }
    setQuestionStats(prev => [
      ...prev,
      { qIndex: currentQuestionIndex, selected: index, isCorrect }
    ]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeSubject.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerIndex(null);
    } else {
      setQuizFinished(true);
    }
  };

  const completedCount = goals.filter(g => g.completed).length;

  return (
    <div id="assam-exam-workspace" className="bg-slate-905 border border-slate-800/80 rounded-3xl overflow-hidden p-6 sm:p-8 space-y-8">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-450 font-mono">
              Assam Government Career Desk
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-1.5">
            APSC & State Employment Exam Prep
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Organize daily mock tests and catalog-synced syllabus goals for Assam State Civil Services, Assam Police recruitment, and Grade III/IV examinations.
          </p>
        </div>

        {/* Quick prep stats */}
        <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-850 p-4 rounded-2xl">
          <div className="text-center">
            <span className="text-[10px] font-mono font-bold text-slate-500 block leading-tight">MOCKS COMPLETED</span>
            <p className="text-lg font-bold text-emerald-400 font-mono">
              {quizFinished ? "1" : "0"} / 1 today
            </p>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center">
            <span className="text-[10px] font-mono font-bold text-slate-500 block leading-tight">STUDY TARGETS</span>
            <p className="text-lg font-bold text-amber-400 font-mono">
              {completedCount} / {goals.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Daily short mock tests */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-emerald-400" />
              1. Daily Quick MCQ Mock Test
            </h3>
            
            {!quizStarted && (
              <div className="flex gap-1.5 bg-slate-950 p-1 border border-slate-900 rounded-xl">
                {EXAM_SUBJECTS.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setActiveSubjectId(subject.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      activeSubjectId === subject.id
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-900/55"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!quizStarted && !quizFinished ? (
            <div className="bg-slate-950 p-8 border border-slate-900 rounded-2xl text-center space-y-5">
              <div className="h-12 w-12 rounded-full bg-emerald-950/40 border border-emerald-900 text-emerald-400 flex items-center justify-center mx-auto text-sm font-black">
                MCQ
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="font-sans text-sm font-bold text-white">
                  Start {activeSubject.name} Mock Tracker
                </h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Consists of 5 targeted standard questions retrieved from genuine Assam recruitment curriculum guides.
                </p>
              </div>

              <button
                onClick={startQuiz}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg hover:shadow-emerald-900/20 active:scale-95 transition-all inline-flex items-center gap-1.5"
              >
                Launch Mock Exam
              </button>
            </div>
          ) : quizFinished ? (
            <div className="bg-slate-950/60 p-6 border border-slate-900 rounded-2xl space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-950/20 p-4 border border-emerald-900/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-950 border border-emerald-900 rounded-xl flex items-center justify-center text-emerald-400 text-sm font-bold font-mono">
                    {userScore * 20}%
                  </div>
                  <div>
                    <h4 className="font-sans text-xs font-bold text-white">Quiz Practice Session Complete!</h4>
                    <p className="text-[11px] text-slate-400">Score Achieved: <span className="font-mono text-emerald-400 font-bold">{userScore} correct</span> out of {activeSubject.questions.length}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={startQuiz}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-200 rounded-lg transition-transform cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      setQuizStarted(false);
                      setQuizFinished(false);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg transition-transform cursor-pointer"
                  >
                    Finish Desk Goal
                  </button>
                </div>
              </div>

              {/* Detail recap list */}
              <div className="space-y-3">
                <p className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">PRACTICAL REVIEW SUMMARY:</p>
                {activeSubject.questions.map((q, qidx) => {
                  const stat = questionStats.find(s => s.qIndex === qidx);
                  return (
                    <div key={q.id} className="p-3 bg-slate-950/90 border border-slate-900 rounded-xl space-y-1.5">
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-[10px] font-mono font-bold text-slate-500 block leading-none mt-0.5">Q{qidx + 1}</span>
                        {stat?.isCorrect ? (
                          <span className="text-[9px] font-bold bg-emerald-950/60 border border-emerald-900 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-mono tracking-widest leading-none">CORRECT</span>
                        ) : (
                          <span className="text-[9px] font-bold bg-rose-950/60 border border-rose-900 text-rose-405 px-1.5 py-0.5 rounded uppercase font-mono tracking-widest leading-none">INCORRECT</span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-white leading-relaxed">{q.question}</p>
                      <p className="text-[11px] text-slate-400 leading-normal bg-slate-900/40 p-2.5 rounded border border-slate-900 text-[10px] font-mono italic">
                        <strong className="text-emerald-555 not-italic font-bold tracking-tight">Key Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="bg-slate-950/45 p-6 border border-slate-850 rounded-2xl space-y-5">
              
              {/* Progress bar */}
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 border-b border-slate-900 pb-2">
                <span className="text-emerald-450 uppercase tracking-widest">TESTING MODEL IN PROGRESS</span>
                <span>QUESTION {currentQuestionIndex + 1} OF {activeSubject.questions.length}</span>
              </div>

              {/* Progress Bar visual indicator */}
              <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / activeSubject.questions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="space-y-4 py-1">
                <div className="flex gap-2.5 items-start">
                  <HelpCircle className="h-4.5 w-4.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-bold text-white leading-relaxed font-sans">
                    {currentQuestion.question}
                  </p>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 gap-2 pl-7.5">
                  {currentQuestion.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswerIndex === oIdx;
                    const isCorrectAnswer = oIdx === currentQuestion.correctAnswer;
                    let optionStyle = "bg-slate-900/40 hover:bg-slate-900 border-slate-800 text-slate-300";
                    
                    if (selectedAnswerIndex !== null) {
                      if (isSelected) {
                        optionStyle = isCorrectAnswer 
                          ? "bg-emerald-950/50 border-emerald-500 text-emerald-300 font-semibold"
                          : "bg-rose-950/50 border-rose-500 text-rose-300 font-semibold";
                      } else if (isCorrectAnswer) {
                        optionStyle = "bg-emerald-954/40 border-emerald-600/50 text-emerald-300";
                      } else {
                        optionStyle = "bg-slate-950/20 border-slate-900 text-slate-600 pointer-events-none";
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={selectedAnswerIndex !== null}
                        onClick={() => handleAnswerSelect(oIdx)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs tracking-tight transition cursor-pointer flex items-center justify-between ${optionStyle}`}
                      >
                        <span>{opt}</span>
                        {selectedAnswerIndex !== null && isCorrectAnswer && (
                          <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950 px-1 py-0.5 rounded border border-emerald-800">CORECT</span>
                        )}
                        {selectedAnswerIndex !== null && isSelected && !isCorrectAnswer && (
                          <span className="text-[9px] font-mono text-rose-400 font-bold bg-rose-950 px-1 py-0.5 rounded border border-rose-800">WRONG</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanation & Next action button */}
              {selectedAnswerIndex !== null && (
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">EXPLANATORY COMMENTARY:</span>
                    <p className="text-xs text-slate-300 leading-relaxed italic pr-1">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg text-xs font-bold text-white rounded-lg cursor-pointer transition flex items-center gap-1"
                    >
                      {currentQuestionIndex < activeSubject.questions.length - 1 ? "Next Question" : "View Exam Report"}
                      <Clock className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right column: Target Study Goals upload */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5 text-amber-400" />
            2. Daily Study Target Upload & List
          </h3>

          <div className="bg-slate-950 p-4 sm:p-5 border border-slate-900 rounded-2xl space-y-4">
            
            {/* Form to submit daily task/goal */}
            <form onSubmit={handleAddGoal} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Upload exam practice goal... e.g. Read 2 Assamese prose"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-slate-650 text-slate-200"
              />
              <button
                type="submit"
                className="px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-bold text-xs transition-transform hover:scale-105 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            {/* List of goals */}
            <div className="space-y-2 max-h-[295px] overflow-y-auto pr-1">
              {goals.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  No registered targets for today. Enter a study goal!
                </div>
              ) : (
                goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 group transition ${
                      goal.completed
                        ? "bg-slate-950/20 border-slate-950 text-slate-500 line-through"
                        : "bg-slate-900/50 border-slate-850 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleGoal(goal.id)}
                        className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition cursor-pointer flex-shrink-0 ${
                          goal.completed
                            ? "bg-emerald-950 border-emerald-500 text-emerald-400"
                            : "border-slate-700 hover:border-amber-500"
                        }`}
                      >
                        {goal.completed && <CheckCircle2 className="h-3 w-3" />}
                      </button>
                      <span className="text-xs truncate">{goal.text}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 text-slate-500 hover:text-rose-455 hover:bg-slate-950 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick motivative badge */}
            <div className="bg-slate-900/30 p-3.5 border border-slate-900 rounded-xl flex items-center justify-between">
              <span className="text-[10px] text-slate-550 font-mono tracking-tight font-bold">SYLLABUS RETENTION STATS:</span>
              <span className="text-[10px] font-bold text-amber-455 font-mono">
                {goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0}% Target Reached
              </span>
            </div>

          </div>

          {/* Quick links to catalog syllabus recommendations */}
          <div className="bg-slate-950/20 p-4 border border-slate-900 rounded-2xl flex items-start gap-3">
            <span className="p-1.5 bg-emerald-950/60 border border-emerald-900/30 rounded-lg text-emerald-400 mt-0.5">💡</span>
            <div className="text-[10.5px] text-slate-400 leading-normal">
              <strong className="text-slate-200 font-semibold block">APSC Syllabus Catalog Hack:</strong> 
              Students can query the integrated <span className="text-emerald-400">Alex AI Librarian</span> to request personalized reading list guidelines (e.g., "Recommend top 5 history books about Assam for APSC").
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

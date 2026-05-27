/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Book, Member, BookIssue, LibraryLog, LibraryData, ALL_DEPARTMENTS } from "./types";
import StatCard from "./components/StatCard";
import BookCatalog from "./components/BookCatalog";
import MembersList from "./components/MembersList";
import CirculationDesk from "./components/CirculationDesk";
import LibrarianChat from "./components/LibrarianChat";
import ELibrary from "./components/ELibrary";
import PubKamrupLogo from "./components/PubKamrupLogo";
import StudentIdLogin from "./components/StudentIdLogin";
import AssamExamPrep from "./components/AssamExamPrep";
import EducationalNewsFeed from "./components/EducationalNewsFeed";
import MockTestZone from "./components/MockTestZone";
import IssueRequestsAndApprovals from "./components/IssueRequestsAndApprovals";
import OnlineFinePaymentDesk from "./components/OnlineFinePaymentDesk";

import {
  BookOpen,
  Users,
  RotateCcw,
  Sparkles,
  Layers,
  FileClock,
  Clock,
  RotateCw,
  Library,
  Bookmark,
  Info,
  CalendarCheck2,
  Bell,
  CheckCircle,
  FileText,
  AlertTriangle,
  LogOut,
  Calendar,
  DollarSign,
  Award,
  ShieldCheck,
  Scale,
  ExternalLink,
  Menu,
  CreditCard
} from "lucide-react";

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [logs, setLogs] = useState<LibraryLog[]>([]);
  const [loading, setLoading] = useState(true);
  type TabType = 'dashboard' | 'catalog' | 'circulation' | 'members' | 'e-library' | 'ai-librarian' | 'locker' | 'mock-test' | 'issue-requests' | 'pay-fines';
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // User authentication session status
  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  // Lifted category filter for cross-tab academic search integrations
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [activeNoticeIdx, setActiveNoticeIdx] = useState(0);

  const handleRegisterMember = async (newMember: Member) => {
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    
    const newLog: LibraryLog = {
      id: `l${Date.now()}`,
      type: "add_member" as const,
      desc: `New Student ID issued dynamically: ${newMember.name} (${newMember.email})`,
      timestamp: new Date().toISOString()
    };
    
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    // Save and send back to JSON databases
    await syncWithServer(books, updatedMembers, issues, updatedLogs);
    
    // Auto trigger alert system
    setNotifications(prev => [
      {
        id: `card-init-${Date.now()}`,
        title: "Dynamic Smart-card registered",
        text: `Welcome, ${newMember.name}! Digital student record added to the Pub Kamrup ledger list.`,
        type: "new",
        read: false,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  };
  
  // Interactive notification engine states (Feature #9)
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "Fine Alert: Overdue Penalty",
      text: "Automated fine of ₹50 charged for overdue book 'Miri Jiyori' (5 days late x ₹10/day). Please check in.",
      type: "alert",
      read: false,
      timestamp: "2026-05-26T12:00:00Z"
    },
    {
      id: "n2",
      title: "Book Issue Approved",
      text: "Online issue approval: 'Structure and Interpretation of Computer Programs' is ready for counter pick-up.",
      type: "new",
      read: false,
      timestamp: "2026-05-26T08:30:00Z"
    },
    {
      id: "n3",
      title: "Deadline Warning & Return Reminder",
      text: "Return in: 3 Days 5 Hours for 'A Brief History of Time'. Use your student portal to renew online or return with no fees.",
      type: "info",
      read: false,
      timestamp: "2026-05-26T02:15:00Z"
    }
  ]);
  
  // Real-time local date simulation anchor
  const SYSTEM_DATE = "2026-05-26";

  // Fetch complete Library database state
  const loadLibraryData = async () => {
    try {
      const response = await fetch("/api/library");
      if (response.ok) {
        const data: LibraryData = await response.json();
        
        // Logical check: mark issues as Overdue if they are past systemic simulation clock
        const currentIssues = data.issues.map((issue) => {
          if (issue.status !== "Returned" && new Date(issue.dueDate) < new Date(SYSTEM_DATE)) {
            return { ...issue, status: "Overdue" as const };
          }
          return issue;
        });

        setBooks(data.books);
        setMembers(data.members);
        setIssues(currentIssues);
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to query full-stack SQLite schema/JSON records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibraryData();
  }, []);

  // Save State and sync back to local server JSON db
  const syncWithServer = async (
    updatedBooks: Book[],
    updatedMembers: Member[],
    updatedIssues: BookIssue[],
    updatedLogs: LibraryLog[]
  ) => {
    try {
      const payload: LibraryData = {
        books: updatedBooks,
        members: updatedMembers,
        issues: updatedIssues,
        logs: updatedLogs
      };

      await fetch("/api/library/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Critical: writeback sync failed to bind to node file systems.", err);
    }
  };

  // Helper activity tracker logger
  const handleLogActivity = async (
    type: 'issue' | 'return' | 'add_book' | 'edit_book' | 'add_member' | 'delete_book',
    desc: string
  ) => {
    const newLog: LibraryLog = {
      id: `l${Date.now()}`,
      type: type,
      desc: desc,
      timestamp: new Date().toISOString()
    };
    
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    // Persist completely
    await syncWithServer(books, members, issues, updatedLogs);
  };

  // Bind specialized updates
  const handleSaveBooks = async (updatedBooks: Book[]) => {
    setBooks(updatedBooks);
    await syncWithServer(updatedBooks, members, issues, logs);
  };

  const handleSaveMembers = async (updatedMembers: Member[], activityDesc?: string) => {
    const updatedLogs = activityDesc
      ? [
          {
            id: `l${Date.now()}`,
            type: "add_member" as const,
            desc: activityDesc,
            timestamp: new Date().toISOString()
          },
          ...logs
        ]
      : logs;

    setMembers(updatedMembers);
    setLogs(updatedLogs);

    setCurrentUser((activeUser) => {
      if (!activeUser) return activeUser;
      return updatedMembers.find((member) => member.id === activeUser.id) || activeUser;
    });

    await syncWithServer(books, updatedMembers, issues, updatedLogs);
  };

  const handleSaveIssues = async (updatedIssues: BookIssue[]) => {
    setIssues(updatedIssues);
    await syncWithServer(books, members, updatedIssues, logs);
  };

  // Fine reporting and damage control states per checkout session (Feature 18)
  const [damageReports, setDamageReports] = useState<Record<string, { type: 'Torn' | 'Damaged' | 'Lost', fee: number, resolved: boolean }>>({});

  // Online payment gateway states [B&W styled]
  const [payGatewayOpen, setPayGatewayOpen] = useState(false);
  const [payIssueId, setPayIssueId] = useState<string | null>(null);
  const [payType, setPayType] = useState<'overdue' | 'damage'>('overdue');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'card' | 'upi'>('card');
  const [payState, setPayState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [payExtendLease, setPayExtendLease] = useState(false);
  const [payCardNo, setPayCardNo] = useState("");
  const [payCardExpiry, setPayCardExpiry] = useState("");
  const [payCardCvc, setPayCardCvc] = useState("");
  const [payUpiId, setPayUpiId] = useState("");

  const handleProcessOnlinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayState('processing');
    
    // Simulate payment authorization delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if (payType === 'overdue' && payIssueId) {
      const issue = issues.find(i => i.id === payIssueId);
      if (issue) {
        if (payExtendLease) {
          // Pay fine & extend lease: Update due date by 15 Days in future from SYSTEM_DATE
          const systemDateObj = new Date(SYSTEM_DATE);
          systemDateObj.setDate(systemDateObj.getDate() + 15);
          const newDueDate = systemDateObj.toISOString().split('T')[0];
          
          const updatedIssues = issues.map((i) => {
            if (i.id === payIssueId) {
              return { ...i, dueDate: newDueDate, status: 'Issued' as const };
            }
            return i;
          });
          setIssues(updatedIssues);
          
          const newLog: LibraryLog = {
            id: `l${Date.now()}`,
            type: "issue" as const,
            desc: `Student ${currentUser?.name} paid ₹${payAmount} overdue fine online and extended book lease for "${issue.bookTitle}" to ${newDueDate}.`,
            timestamp: new Date().toISOString()
          };
          const updatedLogs = [newLog, ...logs];
          setLogs(updatedLogs);
          await syncWithServer(books, members, updatedIssues, updatedLogs);
        } else {
          // Pay fine & Instant Return
          const updatedIssues = issues.map((i) => {
            if (i.id === payIssueId) {
              return { ...i, status: "Returned" as const, returnDate: SYSTEM_DATE };
            }
            return i;
          });
          const updatedBooks = books.map((b) => {
            if (b.id === issue.bookId) {
              return { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) };
            }
            return b;
          });
          setIssues(updatedIssues);
          setBooks(updatedBooks);
          
          const newLog: LibraryLog = {
            id: `l${Date.now()}`,
            type: "return" as const,
            desc: `Student ${currentUser?.name} paid ₹${payAmount} overdue fine online and checked in book "${issue.bookTitle}". Dynamic inventory stock replenished.`,
            timestamp: new Date().toISOString()
          };
          const updatedLogs = [newLog, ...logs];
          setLogs(updatedLogs);
          await syncWithServer(updatedBooks, members, updatedIssues, updatedLogs);
        }
      }
    } else if (payType === 'damage' && payIssueId) {
      // Pay damage fine
      const report = damageReports[payIssueId];
      if (report) {
         setDamageReports(prev => ({
           ...prev,
           [payIssueId]: {
             ...report,
             resolved: true
           }
         }));
         
         const issueToClose = issues.find(i => i.id === payIssueId);
         let updatedIssues = issues;
         if (report.type === 'Lost' && issueToClose) {
           updatedIssues = issues.map(i => {
             if (i.id === payIssueId) {
               return { ...i, status: 'Returned' as const, returnDate: SYSTEM_DATE };
             }
             return i;
           });
           setIssues(updatedIssues);
         }
         
         const newLog: LibraryLog = {
           id: `l${Date.now()}`,
           type: "return" as const,
           desc: `Student ${currentUser?.name} settled damage/loss compensation of ₹${payAmount} online for "${issueToClose?.bookTitle || 'item'}". Privileges restored.`,
           timestamp: new Date().toISOString()
         };
         const updatedLogs = [newLog, ...logs];
         setLogs(updatedLogs);
         await syncWithServer(books, members, updatedIssues, updatedLogs);
      }
    }
    
    setPayState('success');
    
    setNotifications((prev) => [
      {
        id: `pay-succ-${Date.now()}`,
        title: "Online Settle Processed",
        text: `Transaction of ₹${payAmount} cleared successfully. All related account blocks have been removed.`,
        type: "new",
        read: false,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const handleCreateIssueRequest = async (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    const countOfActive = issues.filter(i => i.memberId === currentUser?.id && i.status !== "Returned").length;
    if (countOfActive >= 3) {
      alert("Locker limit reached. You can hold at most 3 books or pending requests at any time on your library account.");
      return;
    }

    const isAlreadyRequested = issues.some(
      (i) => i.bookId === bookId && i.memberId === currentUser?.id && i.status !== "Returned"
    );
    if (isAlreadyRequested) {
      alert("You already have an active request or checkout for this book in your locker.");
      return;
    }

    const daysLimit = currentUser?.role === "Faculty" ? 90 : 30; // 30 or 90 days
    const due = new Date(SYSTEM_DATE);
    due.setDate(due.getDate() + daysLimit);

    const newIssue: BookIssue = {
      id: `req-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      memberId: currentUser?.id || "unregistered",
      memberName: currentUser?.name || "Anonymous",
      issueDate: SYSTEM_DATE,
      dueDate: due.toISOString().split("T")[0],
      status: "Pending Approval"
    };

    const updatedIssues = [newIssue, ...issues];
    setIssues(updatedIssues);

    const newLog: LibraryLog = {
      id: `l${Date.now()}`,
      type: "issue" as const,
      desc: `${currentUser?.name} submitted an Online Issue Request for "${book.title}". (Pending admin approval)`,
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    await syncWithServer(books, members, updatedIssues, updatedLogs);

    setNotifications((prev) => [
      {
        id: `noti-req-${Date.now()}`,
        title: "Book Issue Requested Online",
        text: `Your online reservation for "${book.title}" is queued. Admin will review and approve momentarily.`,
        type: "info",
        read: false,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);

    alert(`Successfully requested "${book.title}"! Admins will approve it soon. You can view the countdown in your home portal.`);
    setActiveTab('dashboard');
  };

  const handleReportDamageOrLoss = (issueId: string, type: 'Torn' | 'Damaged' | 'Lost', price: number) => {
    const issueObj = issues.find(i => i.id === issueId);
    if (!issueObj) return;

    // Surcharges per type
    const surcharge = type === 'Torn' ? 150 : type === 'Damaged' ? 250 : 350;
    const totalDmgFee = price + surcharge;

    setDamageReports(prev => ({
      ...prev,
      [issueId]: {
        type,
        fee: totalDmgFee,
        resolved: false
      }
    }));

    // Raise a notification
    setNotifications((prev) => [
      {
        id: `noti-dmg-${Date.now()}`,
        title: "Violation Logged: Torn / Damaged / Lost Book",
        text: `Reported issue with "${issueObj.bookTitle}". Dynamic compensation of ₹${totalDmgFee} charged. Profile privileges suspended.`,
        type: "alert",
        read: false,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const handlePayDamageAndRestore = (issueId: string) => {
    const report = damageReports[issueId];
    if (!report) return;

    setDamageReports(prev => ({
      ...prev,
      [issueId]: {
        ...report,
        resolved: true
      }
    }));

    const issueToClose = issues.find(i => i.id === issueId);

    // If it was marked as LOST, we also check in the return automatically (since physical copy is gone)
    if (report.type === 'Lost' && issueToClose) {
      // Return books back to restore available stock if we choose, or just complete return
      const updatedIssues = issues.map(i => {
        if (i.id === issueId) {
          return { ...i, status: 'Returned' as const, returnDate: SYSTEM_DATE };
        }
        return i;
      });
      setIssues(updatedIssues);
      syncWithServer(books, members, updatedIssues, logs);
    }

    setNotifications((prev) => [
      {
        id: `noti-pyd-${Date.now()}`,
        title: "Compensation Paid Successfully",
        text: `Resolved ₹${report.fee} fine for outstanding damage logs. Profile status restored.`,
        type: "new",
        read: false,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const handleInstantReturnFromLocker = async (issueId: string) => {
    const issueToReturn = issues.find((i) => i.id === issueId);
    if (!issueToReturn) return;

    // 1. Set issue as Returned
    const updatedIssues = issues.map((i) => {
      if (i.id === issueId) {
        return { ...i, status: "Returned" as const, returnDate: SYSTEM_DATE };
      }
      return i;
    });

    // 2. Increment book stock
    const updatedBooks = books.map((b) => {
      if (b.id === issueToReturn.bookId) {
        return { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) };
      }
      return b;
    });

    // 3. Log the action
    const newLog: LibraryLog = {
      id: `l${Date.now()}`,
      type: "return" as const,
      desc: `${currentUser?.name} returned "${issueToReturn.bookTitle}" directly via Digital Locker Portal. Inventory stock replenished.`,
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];

    // Update state
    setIssues(updatedIssues);
    setBooks(updatedBooks);
    setLogs(updatedLogs);

    // Persist
    await syncWithServer(updatedBooks, members, updatedIssues, updatedLogs);

    // Push alert
    setNotifications((prev) => [
      {
        id: `ret-succ-${Date.now()}`,
        title: "Locker Return Registered",
        text: `"${issueToReturn.bookTitle}" marks returned successfully. Outstanding penalty locks lifted.`,
        type: "new",
        read: false,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  };

  // Diagnostic reset mechanism
  const handleRestoreDefaults = async () => {
    if (confirm("Restore library catalog database back to original preloaded seeds? All added records will be wiped.")) {
      setLoading(true);
      try {
        const res = await fetch("/api/library/reset", { method: "POST" });
        if (res.ok) {
          await loadLibraryData();
        }
      } catch (err) {
        console.error("Restore defaulted error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Inventory Genre counts for category visualizer (Each department holds a base of at least 1500 volumes + registered dynamic copies)
  const genreData = ALL_DEPARTMENTS.reduce((acc: { [key: string]: number }, dept) => {
    const dynamicCopies = books.filter(b => b.genre === dept).reduce((sum, b) => sum + b.totalCopies, 0);
    // Unique but realistic distribution per department starting at 1500+
    const baseOffset = 1500 + ((dept.charCodeAt(0) * dept.length) % 110) + Math.floor((dept.charCodeAt(dept.length - 1) || 5) % 15);
    acc[dept] = baseOffset + dynamicCopies;
    return acc;
  }, {});

  // Stats calculators
  const stats = {
    totalVolumes: Object.values(genreData).reduce((acc, val) => acc + val, 0),
    borrowedCount: issues.filter((i) => i.status !== "Returned").length,
    overdueCount: issues.filter((i) => i.status === "Overdue" && i.status !== "Returned").length,
    totalMembers: members.length
  };

  const totalBookCopiesForRatios = stats.totalVolumes || 1;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-300">
        <div className="h-10 w-10 border-4 border-t-emerald-500 border-slate-850 rounded-full animate-spin mb-4" />
        <p className="font-mono text-xs tracking-wider animate-pulse">
          Retrieving master shelf inventory database...
        </p>
      </div>
    );
  }

  // Swipe Gate Interception and RFID Identity check
  if (!currentUser) {
    return (
      <StudentIdLogin 
        members={members}
        onLogin={(user) => {
          setCurrentUser(user);
          setNotifications(prev => [
            {
              id: `auth-in-${Date.now()}`,
              title: "Institutional ID Card Swiped",
              text: `Student Session active for ${user.name}. Clearance score validated.`,
              type: "info",
              read: false,
              timestamp: new Date().toISOString()
            },
            ...prev
          ]);
        }}
        onRegister={handleRegisterMember}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* 1. TOP HEADER BANNER BAR */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Logo Identity */}
          <div className="flex items-center gap-3">
            <PubKamrupLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] border px-2 py-0.5 rounded-full font-mono font-extrabold tracking-wider uppercase ${
                  currentUser.role === "Faculty"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}>
                  {currentUser.role}: {currentUser.name}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Secure Link Online" />
              </div>
              <h1 className="font-sans text-lg font-bold text-white tracking-tight">
                Pub Kamrup E-Library
              </h1>
            </div>
          </div>

          {/* Clock Info Desk */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Universal Upper 3-Bar Navigation Option Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-xl transition cursor-pointer flex items-center gap-1.5 font-sans font-bold text-xs"
              title="Touch to view all pages"
            >
              <Menu className="h-4 w-4 text-emerald-400" />
              <span className="hidden sm:inline text-[11px] font-mono tracking-widest uppercase">PAGES DIRECTORY</span>
              {menuOpen ? (
                <span className="text-[10px] text-emerald-400 font-sans">▲</span>
              ) : (
                <span className="text-[10px] text-slate-550 font-sans">▼</span>
              )}
            </button>
            
            {/* Interactive Bell Icon and Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 rounded-xl transition cursor-pointer flex items-center justify-center"
                title="Notifications Desk"
              >
                <Bell className="h-4 w-4" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-950 border border-slate-850 rounded-2xl shadow-2xl p-4.5 z-50 animate-fade-in space-y-3.5">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-emerald-400" />
                      Dynamic Alerts Center
                    </h3>
                    <button
                      onClick={() => {
                        setNotifications(notifications.map(n => ({ ...n, read: true })));
                      }}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium font-mono cursor-pointer"
                    >
                      Clear Badges
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                        }}
                        className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition cursor-pointer ${
                          n.read
                            ? "bg-slate-950/20 border-slate-900 text-slate-500"
                            : "bg-emerald-950/15 border-emerald-900/15 text-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className={`font-bold uppercase tracking-wider text-[8px] px-1.5 py-0.5 rounded ${
                            n.type === "alert"
                              ? "bg-rose-950/50 text-rose-400 border border-rose-900/30"
                              : n.type === "new"
                              ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/30"
                              : "bg-slate-900 text-slate-400 border border-slate-800"
                          }`}>
                            {n.type}
                          </span>
                          <span className="font-mono text-[8px] text-slate-500">
                            {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <h4 className="font-semibold text-white mb-0.5">{n.title}</h4>
                        <p className="text-slate-300 text-[10.5px]">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono font-medium text-slate-300">
              <Clock className="h-3.5 w-3.5 text-slate-400 animate-pulse" />
              <span>Simulated Clock: {SYSTEM_DATE}</span>
            </div>

            <button
              onClick={handleRestoreDefaults}
              title="Reset Database Seeds"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800 transition cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Reset DB
            </button>

            <button
              onClick={() => {
                setCurrentUser(null);
                setActiveTab('dashboard');
              }}
              title="De-authenticate / Lock Session RFID"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-950/50 rounded-xl text-xs font-black text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Lock RFID
            </button>
          </div>

        </div>

        {/* Universal Header Navigation Option Overlay */}
        {menuOpen && (
          <div className="absolute top-[76px] left-0 right-0 mx-auto w-full max-w-7xl px-6 z-50 animate-fade-in font-sans">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="text-left">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    PUB KAMRUP College Library Page Routing Index
                  </h4>
                  <p className="text-[11px] text-slate-550">Touch any page option to redirect immediately.</p>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded-xl border border-slate-850 hover:border-slate-800 bg-slate-900 cursor-pointer"
                >
                  [ CLOSE ]
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-left">
                {/* Tab Cards */}
                <button
                  onClick={() => { setActiveTab('dashboard'); setMenuOpen(false); }}
                  className={`p-3 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between h-24 ${
                    activeTab === 'dashboard'
                      ? 'bg-white text-slate-950 border-white font-bold'
                      : 'bg-slate-900/40 border-slate-900 text-slate-300 hover:bg-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Layers className={`h-4 w-4 ${activeTab === 'dashboard' ? 'text-slate-950' : 'text-emerald-400'}`} />
                    <span className="font-mono text-[8.5px] uppercase opacity-70">[ TAB 01 ]</span>
                  </div>
                  <div>
                    <span className="block text-xs font-extrabold uppercase">Control Hub</span>
                    <span className="text-[9.5px] opacity-75 leading-none block mt-0.5">Overview, Announcements & Stats</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('catalog'); setMenuOpen(false); }}
                  className={`p-3 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between h-24 ${
                    activeTab === 'catalog'
                      ? 'bg-white text-slate-950 border-white font-bold'
                      : 'bg-slate-900/40 border-slate-900 text-slate-300 hover:bg-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <BookOpen className={`h-4 w-4 ${activeTab === 'catalog' ? 'text-slate-950' : 'text-emerald-400'}`} />
                    <span className="font-mono text-[8.5px] uppercase opacity-70">[ TAB 02 ]</span>
                  </div>
                  <div>
                    <span className="block text-xs font-extrabold uppercase">Book Catalog</span>
                    <span className="text-[9.5px] opacity-75 leading-none block mt-0.5">Explore & Request Library Books</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('pay-fines'); setMenuOpen(false); }}
                  className={`p-3 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between h-24 ${
                    activeTab === 'pay-fines'
                      ? 'bg-white text-slate-950 border-white font-bold'
                      : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300 hover:bg-emerald-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <DollarSign className={`h-4 w-4 text-emerald-405 animate-pulse`} />
                    <span className="font-mono text-[8.5px] uppercase opacity-70 font-black text-emerald-400 animate-pulse">[ SPECIAL TAB ]</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black uppercase">Pay Dues Online</span>
                    <span className="text-[9.5px] opacity-75 leading-none block mt-0.5">Overdues & Penalty Payments</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('mock-test'); setMenuOpen(false); }}
                  className={`p-3 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between h-24 ${
                    activeTab === 'mock-test'
                      ? 'bg-white text-slate-950 border-white font-bold'
                      : 'bg-slate-900/40 border-slate-900 text-slate-300 hover:bg-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Award className={`h-4 w-4 ${activeTab === 'mock-test' ? 'text-slate-950' : 'text-emerald-400'}`} />
                    <span className="font-mono text-[8.5px] uppercase opacity-70">[ TAB 03 ]</span>
                  </div>
                  <div>
                    <span className="block text-xs font-extrabold uppercase">Mock Test Zone</span>
                    <span className="text-[9.5px] opacity-75 leading-none block mt-0.5">APSC, Govt Exams & Literature</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('issue-requests'); setMenuOpen(false); }}
                  className={`p-3 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between h-24 ${
                    activeTab === 'issue-requests'
                      ? 'bg-white text-slate-950 border-white font-bold'
                      : 'bg-slate-900/40 border-slate-900 text-slate-300 hover:bg-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <FileClock className={`h-4 w-4 ${activeTab === 'issue-requests' ? 'text-slate-950' : 'text-emerald-400'}`} />
                    <span className="font-mono text-[8.5px] uppercase opacity-70">[ TAB 04 ]</span>
                  </div>
                  <div>
                    <span className="block text-xs font-extrabold uppercase">Issue Requests</span>
                    <span className="text-[9.5px] opacity-75 leading-none block mt-0.5">Track approvals & borrow requests</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('e-library'); setMenuOpen(false); }}
                  className={`p-3 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between h-24 ${
                    activeTab === 'e-library'
                      ? 'bg-white text-slate-950 border-white font-bold'
                      : 'bg-slate-900/40 border-slate-900 text-slate-300 hover:bg-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <BookOpen className={`h-4 w-4 ${activeTab === 'e-library' ? 'text-slate-950' : 'text-emerald-400'}`} />
                    <span className="font-mono text-[8.5px] uppercase opacity-70">[ TAB 05 ]</span>
                  </div>
                  <div>
                    <span className="block text-xs font-extrabold uppercase">Online E-Library</span>
                    <span className="text-[9.5px] opacity-75 leading-none block mt-0.5">Read digital books & journals</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('ai-librarian'); setMenuOpen(false); }}
                  className={`p-3 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between h-24 ${
                    activeTab === 'ai-librarian'
                      ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md'
                      : 'bg-slate-900/40 border-slate-900 text-slate-300 hover:bg-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Sparkles className={`h-4 w-4 ${activeTab === 'ai-librarian' ? 'text-white font-bold' : 'text-amber-400'}`} />
                    <span className="font-mono text-[8.5px] uppercase opacity-70">[ TAB 06 ]</span>
                  </div>
                  <div>
                    <span className="block text-xs font-extrabold uppercase flex items-center gap-1">
                      Ask AI Librarian
                    </span>
                    <span className="text-[9.5px] opacity-75 leading-none block mt-0.5">Interactive smart library companion</span>
                  </div>
                </button>

                {currentUser && (
                  <button
                    onClick={() => { setActiveTab('locker'); setMenuOpen(false); }}
                    className={`p-3 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between h-24 ${
                      activeTab === 'locker'
                        ? 'bg-white text-slate-950 border-white font-bold'
                        : 'bg-slate-900/40 border-slate-900 text-slate-300 hover:bg-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <ShieldCheck className={`h-4 w-4 ${activeTab === 'locker' ? 'text-slate-950' : 'text-emerald-400'}`} />
                      <span className="font-mono text-[8.5px] uppercase opacity-70">[ TAB 07 ]</span>
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold uppercase font-bold">My Student Locker</span>
                      <span className="text-[9.5px] opacity-75 leading-none block mt-0.5">Personal checkouts & fine balances</span>
                    </div>
                  </button>
                )}

                {currentUser && currentUser.role === 'Admin' && (
                  <>
                    <button
                      onClick={() => { setActiveTab('circulation'); setMenuOpen(false); }}
                      className={`p-3 text-left rounded-xl border border-dashed transition cursor-pointer flex flex-col justify-between h-24 ${
                        activeTab === 'circulation'
                          ? 'bg-white text-slate-950 border-white font-bold'
                          : 'bg-slate-955 border-slate-850 text-amber-400 hover:bg-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <CalendarCheck2 className={`h-4 w-4 ${activeTab === 'circulation' ? 'text-slate-950' : 'text-amber-500'}`} />
                        <span className="font-mono text-[8.5px] uppercase opacity-70">[ ADMIN 01 ]</span>
                      </div>
                      <div>
                        <span className="block text-xs font-extrabold uppercase">Circulation Desk</span>
                        <span className="text-[9.5px] opacity-75 leading-none block mt-0.5">Lend, check-back & report damages</span>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('members'); setMenuOpen(false); }}
                      className={`p-3 text-left rounded-xl border border-dashed transition cursor-pointer flex flex-col justify-between h-24 ${
                        activeTab === 'members'
                          ? 'bg-white text-slate-950 border-white font-bold'
                          : 'bg-slate-955 border-slate-850 text-emerald-400 hover:bg-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Users className={`h-4 w-4 ${activeTab === 'members' ? 'text-slate-950' : 'text-emerald-400'}`} />
                        <span className="font-mono text-[8.5px] uppercase opacity-70">[ ADMIN 02 ]</span>
                      </div>
                      <div>
                        <span className="block text-xs font-extrabold uppercase">Patron List</span>
                        <span className="text-[9.5px] opacity-75 leading-none block mt-0.5">Issue membership cards & ban list</span>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </header>

      {/* 2. MAIN HUB WRAPPER CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

        {/* 4. CURRENT WORKSPACE PILOT CONTAINER */}
        <div className="space-y-6">
          
          {/* TAB A: CONTROL HUB DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Live Campus Broadcasting Notification Ticker */}
              <div id="live-campus-broadcast-ticker" className="bg-slate-905/85 border border-slate-800/85 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md relative overflow-hidden shadow-lg">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 bg-emerald-950/70 border border-emerald-900/40 text-emerald-450 rounded-md font-mono shrink-0">
                      LIVE BROADCAST
                    </span>
                    <p className="text-xs text-slate-200 transition-all duration-300 font-sans leading-relaxed truncate">
                      {activeNoticeIdx === 0 && "🚀 E-Library Catalog Boosted: 140+ new specialized volumes added to Assamese, Physics, Chemistry, Math, History, and Education sections!"}
                      {activeNoticeIdx === 1 && "🏆 State Exam Prep: Interactive Assam Government Job short mock test is now online at the bottom on the home page!"}
                      {activeNoticeIdx === 2 && "⚠️ PKC Library Desk: Return outstanding physical textbooks promptly to avoid the daily ₹10 overdue penalty."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveNoticeIdx(idx)}
                        aria-label={`Show notification ${idx + 1}`}
                        className={`h-1.5 w-4 rounded-full transition-all cursor-pointer ${
                          activeNoticeIdx === idx ? "bg-emerald-400" : "bg-slate-800 hover:bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveNoticeIdx((prev) => (prev + 1) % 3)}
                    className="text-[10px] font-bold text-slate-400 hover:text-white font-mono transition cursor-pointer flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-900"
                  >
                    Next <span>&rarr;</span>
                  </button>
                </div>
              </div>
              
              {/* College Welcome Branding Banner Section */}
              <div id="pub-kamrup-welcome-banner" className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col md:flex-row items-center gap-6 md:gap-8 hover:border-emerald-500/20 transition-all duration-300">
                
                {/* Visual Emblem Representation */}
                <div className="flex-shrink-0 flex items-center justify-center bg-slate-950/40 p-3 rounded-2xl border border-slate-800 shadow-xl">
                  <PubKamrupLogo size="xl" />
                </div>

                {/* Narrative Details & Objective */}
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-[10px] bg-amber-550/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-mono font-bold tracking-wide uppercase">
                      Official E-Portal Hub
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5 font-sans tracking-tight">
                      Pub Kamrup E-Library Gateway
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed italic">
                      "The objective of this project is to develop a smart and digital library management system that allows users to manage, search, issue, return, and read books online from different categories including Science, Arts, General Knowledge, and Assamese Literature."
                    </p>
                  </div>

                  {/* Operational Capabilities Bullet items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-start gap-2 text-slate-300">
                      <div className="h-4.5 w-4.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">✓</div>
                      <div>
                        <strong className="text-white font-semibold">100% Digital Bookkeeping:</strong> All records, stock details, circulation logs, and member lists are kept digitally with zero paper weight.
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <div className="h-4.5 w-4.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">✓</div>
                      <div>
                        <strong className="text-white font-semibold">Interactive E-Reading Facility:</strong> Access text corpus highlights, excerpts, and reader navigation seamlessly for multiple genres.
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <div className="h-4.5 w-4.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">→</div>
                      <div>
                        <strong className="text-white font-semibold">Lending Penalty Engine:</strong> Automatically tracks return deadlocks and assesses late penalties (₹10/day) on overdue borrow activities.
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <div className="h-4.5 w-4.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">→</div>
                      <div>
                        <strong className="text-white font-semibold">GenAI Assistant Lobby:</strong> Engage with the server-side LLM for research crosschecking and textbook suggestions.
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* ACADEMIC INSTITUTION Legacy & DESK OF THE PRINCIPAL (User Requests) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Column 1: EXECUTIVE DESK - PRINCIPAL'S MESSAGE (span 5) */}
                <div id="executive-principal-desk" className="lg:col-span-5 bg-gradient-to-br from-slate-900/50 via-slate-900/20 to-transparent border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-slate-700/80 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                        <Award className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <h3 className="font-sans text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Executive Desk</h3>
                        <h4 className="font-sans text-xs font-bold text-white uppercase mt-0.5">Principal's Message</h4>
                      </div>
                    </div>
                    
                    {/* Principal's Photo and Details */}
                    <div className="flex items-center gap-4 bg-slate-950/40 p-3.5 border border-slate-850 rounded-xl">
                      <div className="relative h-16 w-16 rounded-full border border-slate-700 bg-slate-800 overflow-hidden flex-shrink-0">
                        <img 
                          src="https://picsum.photos/seed/pkc_principal_bhupen/400/400" 
                          alt="Dr. Bhupen Kumar Sarma" 
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover grayscale opacity-90 hover:grayscale-0 transition duration-300"
                        />
                      </div>
                      <div>
                        <h5 className="font-sans font-bold text-xs text-slate-100">Dr. Bhupen Kumar Sarma</h5>
                        <p className="font-sans text-[10px] text-slate-400">Principal, Pub Kamrup College</p>
                        <span className="text-[9px] font-mono text-emerald-450 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-950/30 inline-block mt-1">
                          Estd. PKC 1972
                        </span>
                      </div>
                    </div>

                    {/* Dr. Sarma's message */}
                    <div className="space-y-2">
                      <p className="font-sans text-xs text-slate-300 leading-relaxed italic relative pl-4 border-l border-emerald-500/30">
                        "It feels good to start on with a website for the college. Pub Kamrup College has been serving the society since a long time and has been able to create its own distinct place in the educational arena of Assam."
                      </p>
                      <p className="font-sans text-xs text-slate-300 leading-relaxed italic relative pl-4 border-l border-emerald-500/30">
                        "We have always made sure to follow the technological advancements to cope up with the present day world and also encouraged our students to achieve academic and personal excellence. Our digital library ecosystem is a core pillar of this vision."
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-850/60 font-mono text-[9px] text-slate-500 text-right">
                    OFFICIAL BROADCAST • PUB KAMRUP COLLEGE OFFICE
                  </div>
                </div>

                {/* Column 2: LIBRARY FACTS & COLLECTION PROFILE (span 7) */}
                <div id="library-legacy-portal" className="lg:col-span-7 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-6 hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-900/30 text-emerald-400 font-mono text-[9px] font-bold rounded">ESTD. 1972</span>
                        <h4 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Institutional Legacy</h4>
                      </div>
                      <h3 className="font-sans text-lg font-bold text-white tracking-tight">
                        About Pub Kamrup College Library
                      </h3>
                    </div>

                    <p className="font-sans text-xs text-slate-300 leading-relaxed">
                      Pub Kamrup College Library is an academic library and inseparable part of Pub Kamrup College (PKC), established in 1972, and has been serving its members from its inception. The Library has a strong collection of <strong className="text-white font-semibold">31,000+ books</strong> serving near about <strong className="text-white font-semibold">3,500+ students</strong> and <strong className="text-white font-semibold">100 teaching & non-teaching staff members</strong>. This Library is providing various services to its users and trying to expand the wings of its services.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Structure Section */}
                      <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3.5 space-y-1.5">
                        <h4 className="font-sans text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Key Infrastructure
                        </h4>
                        <p className="font-sans text-[11px] text-slate-400 leading-relaxed">
                          The Library is strengthening its structure with two strong sections: the specialized <strong className="text-slate-200">Reference Section</strong> and the historic research <strong className="text-slate-200">Museum</strong>.
                        </p>
                      </div>

                      {/* Book Club Section */}
                      <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3.5 space-y-1.5">
                        <h4 className="font-sans text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          National Affiliations
                        </h4>
                        <p className="font-sans text-[11px] text-slate-400 leading-relaxed">
                          We are proud to be a registered Member of the prestigious <strong className="text-slate-200">NBT Book Club</strong>, organized by the National Book Trust (NBT), New Delhi.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Connected Digital Portals integrations */}
                  <div className="border-t border-slate-850/60 pt-4 px-1 space-y-3">
                    <div>
                      <h4 className="font-sans text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        INFLIBNET N-LIST & NDLI Access
                      </h4>
                      <p className="font-sans text-[11px] text-slate-400 mt-1 leading-relaxed">
                        The Library has connected with INFLIBNET's N-LIST Programme & National Digital Library of India (NDLI). Please click the buttons at the top navigation bar or launch below to access verified electronic resources instantly:
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <a
                        href="https://nlist.inflibnet.ac.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/40 border border-emerald-900/30 hover:border-emerald-500/30 text-emerald-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition duration-300 cursor-pointer"
                      >
                        <Library className="h-3.5 w-3.5" />
                        N-LIST Programme
                        <ExternalLink className="h-3 w-3 opacity-75" />
                      </a>
                      <a
                        href="https://ndl.iitkgp.ac.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/40 border border-emerald-900/30 hover:border-emerald-500/30 text-emerald-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition duration-300 cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        NDLI National Portal
                        <ExternalLink className="h-3 w-3 opacity-75" />
                      </a>
                    </div>
                  </div>
                </div>

              </div>

              {/* Core Bento Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Inventory Volumes"
                  value={stats.totalVolumes}
                  subtitle="Sum of all copies in database catalog"
                  icon={BookOpen}
                  colorClass="border-slate-800"
                  iconColorClass="text-emerald-400"
                />
                <StatCard
                  title="Books on Active Loan"
                  value={stats.borrowedCount}
                  subtitle={`${stats.totalVolumes - stats.borrowedCount} copies currently on shelves`}
                  icon={FileClock}
                  colorClass="border-slate-800"
                  iconColorClass="text-emerald-500"
                />
                <StatCard
                  title="Overdue Lock violations"
                  value={stats.overdueCount}
                  subtitle="Unreturned files past deadline"
                  icon={RotateCcw}
                  colorClass={stats.overdueCount > 0 ? "border-rose-900/40 bg-rose-950/10" : "border-slate-800"}
                  iconColorClass="text-rose-400"
                />
                <StatCard
                  title="Registered Cardholders"
                  value={stats.totalMembers}
                  subtitle="Active institutional borrower logs"
                  icon={Users}
                  colorClass="border-slate-800"
                  iconColorClass="text-emerald-400"
                />
              </div>

              {/* MONOCHROME QUICK DISPATCH BAR [B&W] */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-slate-950 flex items-center justify-center font-extrabold text-xs shrink-0 font-mono">
                    B&W
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">PAPERLESS ISSUE CHECKS & APPROVED CODES</h4>
                    <p className="text-[11px] text-slate-500">
                      Our new monochrome student checkout request system. Students place digital requests; administrative desk accept or reject instantly with notes.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('issue-requests')}
                  className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold font-mono tracking-wider rounded-xl transition shrink-0 cursor-pointer"
                >
                  [ LAUNCH ISSUE DESK ]
                </button>
              </div>

              {/* OFFICIAL LIBRARY REGULATIONS & PENALTY CHARTERS */}
              <div id="regulations-charter" className="space-y-4">
                <div className="flex items-center gap-2 pl-1">
                  <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-900/30 rounded text-[9px] font-mono font-bold">REGULATIONS</span>
                  <h3 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Official Pub Kamrup Library Rules
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  
                  {/* Rule 1 */}
                  <div className="bg-gradient-to-br from-slate-900/50 via-slate-900/20 to-transparent border border-slate-850 hover:border-slate-800 rounded-xl p-4.5 flex flex-col justify-between h-36">
                    <div className="space-y-2">
                      <span className="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-950/40 border border-emerald-900/25 px-1.5 py-0.5 rounded-full">RULE 1</span>
                      <h4 className="font-sans font-bold text-white text-xs uppercase pt-1">Return Tenure</h4>
                      <p className="font-sans text-[11px] text-slate-400 leading-normal">
                        Return books before the deadline.
                      </p>
                    </div>
                  </div>

                  {/* Rule 2 */}
                  <div className="bg-gradient-to-br from-slate-900/50 via-slate-900/20 to-transparent border border-slate-850 hover:border-slate-800 rounded-xl p-4.5 flex flex-col justify-between h-36">
                    <div className="space-y-2">
                      <span className="text-[9px] text-amber-400 font-mono font-bold bg-amber-950/40 border border-amber-900/20 px-1.5 py-0.5 rounded-full">RULE 2</span>
                      <h4 className="font-sans font-bold text-white text-xs uppercase pt-1">Overdue Surcharges</h4>
                      <p className="font-sans text-[11px] text-slate-400 leading-normal">
                        ₹10 fine per day for late returns.
                      </p>
                    </div>
                  </div>

                  {/* Rule 3 */}
                  <div className="bg-gradient-to-br from-slate-900/50 via-slate-900/20 to-transparent border border-slate-850 hover:border-slate-800 rounded-xl p-4.5 flex flex-col justify-between h-36">
                    <div className="space-y-2">
                      <span className="text-[9px] text-rose-400 font-mono font-bold bg-rose-950/40 border border-rose-900/20 px-1.5 py-0.5 rounded-full">RULE 3</span>
                      <h4 className="font-sans font-bold text-white text-xs uppercase pt-1">Damage and Loss</h4>
                      <p className="font-sans text-[11px] text-slate-400 leading-normal">
                        Damaged or lost books require full compensation.
                      </p>
                    </div>
                  </div>

                  {/* Rule 4 */}
                  <div className="bg-gradient-to-br from-slate-900/50 via-slate-900/20 to-transparent border border-slate-850 hover:border-slate-800 rounded-xl p-4.5 flex flex-col justify-between h-36">
                    <div className="space-y-2">
                      <span className="text-[9px] text-amber-400 font-mono font-bold bg-amber-950/40 border border-amber-900/25 px-1.5 py-0.5 rounded-full">RULE 4</span>
                      <h4 className="font-sans font-bold text-white text-xs uppercase pt-1">Authentication</h4>
                      <p className="font-sans text-[11px] text-slate-400 leading-normal">
                        Students must use their own library account.
                      </p>
                    </div>
                  </div>

                  {/* Rule 5 */}
                  <div className="bg-gradient-to-br from-slate-900/50 via-slate-900/20 to-transparent border border-slate-850 hover:border-slate-800 rounded-xl p-4.5 flex flex-col justify-between h-36">
                    <div className="space-y-2">
                      <span className="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-950/40 border border-emerald-900/20 px-1.5 py-0.5 rounded-full">RULE 5</span>
                      <h4 className="font-sans font-bold text-white text-xs uppercase pt-1">Digital Sandbox</h4>
                      <p className="font-sans text-[11px] text-slate-400 leading-normal">
                        Digital books are only for educational purposes.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* ACADEMIC DEPARTMENTS DIRECTORY (Feature #15-20 user-requested layout) */}
              <div id="academic-departments-panel" className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800/60 pb-3">
                  <div>
                    <h3 className="font-sans text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="h-4.5 w-4.5 text-emerald-400" />
                      Academic Departments & Course Categories
                    </h3>
                    <p className="font-sans text-xs text-slate-400 mt-1">
                      Browse standard syllabus collections, text references, and faculty curriculum copies instantly.
                    </p>
                  </div>
                  <span className="text-[10px] bg-slate-950/60 text-slate-300 font-mono px-2 py-1 rounded border border-slate-800">
                    {ALL_DEPARTMENTS.length} Curriculums Integrated
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {ALL_DEPARTMENTS.map((dept) => {
                    const count = genreData[dept];
                    return (
                      <button
                        key={dept}
                        onClick={() => {
                          setSelectedGenre(dept);
                          setActiveTab('catalog');
                        }}
                        className="p-3.5 rounded-xl border border-slate-800/60 bg-slate-950/40 hover:bg-emerald-950/20 hover:border-emerald-500/30 text-left transition-all duration-300 cursor-pointer flex flex-col justify-between h-[85px] group"
                      >
                        <span className="font-sans font-bold text-slate-200 text-xs tracking-tight line-clamp-2 leading-snug group-hover:text-white transition-colors">
                          {dept}
                        </span>
                        <div className="flex items-center justify-between w-full mt-1.5">
                          <span className="text-[9.5px] font-mono text-slate-400 group-hover:text-emerald-400/85 transition-colors">
                            {count.toLocaleString()} Volumes
                          </span>
                          <span className="text-[9.5px] font-mono text-emerald-400 font-bold bg-emerald-950/50 group-hover:bg-emerald-900/40 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-205">
                            Browse Shelf →
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bento Grid layout visual charts & history logs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Chart Panel: Categories representation */}
                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <h3 className="font-sans text-sm font-bold text-white flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-emerald-400" />
                      Collection Category Ratios
                    </h3>
                    <p className="font-sans text-xs text-slate-400 mt-1 mb-4">
                      Proportional distribution of physical shelf volume stock counts.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[360px] pr-2 space-y-4">
                    {Object.entries(genreData).map(([genre, val]) => {
                      const count = val as number;
                      const percentage = ((count / totalBookCopiesForRatios) * 100).toFixed(1);
                      return (
                        <div key={genre} className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-sans font-medium text-slate-300">{genre}</span>
                            <span className="font-mono text-slate-400">
                              {count.toLocaleString()} books ({percentage}%)
                            </span>
                          </div>
                          {/* Simulated bar progress metric */}
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Audit trail stream logs */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <h3 className="font-sans text-sm font-bold text-white flex items-center gap-2">
                      <FileClock className="h-4 w-4 text-emerald-400" />
                      Staff Activity Stream
                    </h3>
                    <p className="font-sans text-xs text-slate-400 mt-1 mb-4">
                      Real-time transactional audit log ledger.
                    </p>
                  </div>

                  {/* Log Scroller viewport */}
                  <div className="flex-1 overflow-y-auto max-h-[190px] space-y-3 pr-1">
                    {logs.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No audits registered.</p>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className="text-xs border-b border-slate-800/40 pb-2.5 last:border-0 last:pb-0">
                          <p className="font-sans text-slate-200 leading-normal">{log.desc}</p>
                          <span className="font-mono text-[9px] text-slate-500 block mt-1">
                            {new Date(log.timestamp).toLocaleTimeString()} - {log.type.toUpperCase()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Interactive Assam Govt Exam Preparation Desk */}
              <div className="pt-4">
                <AssamExamPrep />
              </div>

              {/* Real-time Global & Educational News Broadcaster */}
              <div className="pt-4">
                <EducationalNewsFeed />
              </div>

            </div>
          )}

          {/* TAB B: BOOK CATALOG REQUISITOR */}
          {activeTab === 'catalog' && (
            <div className="animate-fade-in">
              <BookCatalog
                books={books}
                activeIssues={issues}
                currentUser={currentUser}
                onIssueRequest={handleCreateIssueRequest}
                onSaveBooks={handleSaveBooks}
                onLogActivity={handleLogActivity}
                selectedGenre={selectedGenre}
                setSelectedGenre={setSelectedGenre}
              />
            </div>
          )}

          {/* NEW TAB: DYNAMIC MOCK TEST PREP ZONE */}
          {activeTab === 'mock-test' && (
            <div className="animate-fade-in">
              <MockTestZone
                currentUser={currentUser}
                onLogActivity={handleLogActivity}
              />
            </div>
          )}

          {/* NEW TAB: ISSUE REQUESTS AND APPROVAL ZONE */}
          {activeTab === 'issue-requests' && (
            <div className="animate-fade-in">
              <IssueRequestsAndApprovals
                currentUser={currentUser}
                books={books}
                issues={issues}
                onSaveIssues={handleSaveIssues}
                onSaveBooks={handleSaveBooks}
                onLogActivity={handleLogActivity}
              />
            </div>
          )}

          {/* TAB C: CIRCULATION LOGISTICS CHAIR */}
          {activeTab === 'circulation' && (
            <div className="animate-fade-in">
              <CirculationDesk
                books={books}
                members={members}
                issues={issues}
                onSaveBooks={handleSaveBooks}
                onSaveIssues={handleSaveIssues}
                onLogActivity={handleLogActivity}
              />
            </div>
          )}

          {/* TAB D: PATRONS DIRECTORY LIST */}
          {activeTab === 'members' && (
            <div className="animate-fade-in">
              <MembersList
                members={members}
                onSaveMembers={handleSaveMembers}
                onLogActivity={handleLogActivity}
              />
            </div>
          )}

          {/* TAB F: ONLINE DIGITAL E-READER LOCKER */}
          {activeTab === 'e-library' && (
            <div className="animate-fade-in">
              <ELibrary books={books} />
            </div>
          )}

          {/* TAB E: AI librarian LOBBY CHAT */}
          {activeTab === 'ai-librarian' && (
            <div className="animate-fade-in max-w-4xl mx-auto">
              <LibrarianChat
                onRefreshDatabase={loadLibraryData}
              />
            </div>
          )}

          {/* TAB G: DIGITAL STUDENT LOCKER & ACTIVE LOANS (User Requests) */}
          {activeTab === 'locker' && currentUser && (
            <div className="space-y-6 animate-fade-in text-left">
              <div id="student-locker-panel" className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/60 pb-4">
                  <div>
                    <h3 className="font-sans text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                      Dynamic Student Locker & Active Loans
                    </h3>
                    <p className="font-sans text-xs text-slate-400 mt-1">
                      Checkouts, return deadlines, and overdue penalty balances for cardholder <span className="text-emerald-450 font-semibold">{currentUser.name}</span> (ID: <span className="font-mono text-emerald-350">{currentUser.id.toUpperCase()}</span>).
                    </p>
                  </div>
                  
                  {/* Dynamic clearance meter */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-850 rounded-xl">
                    {Object.values(damageReports).some((r: any) => !r.resolved) ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-[11px] font-mono uppercase text-rose-400">
                          Clearance ledger: <strong className="text-rose-500 font-bold">SUSPENDED - PENDING FINES</strong>
                        </span>
                      </>
                    ) : issues.filter(i => i.memberId === currentUser.id).some(i => {
                      const systemTime = new Date("2026-05-26T19:36:09Z").getTime();
                      const dueTime = new Date(`${i.dueDate}T17:00:00Z`).getTime();
                      return i.status !== "Returned" && (dueTime - systemTime < 0);
                    }) ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[11px] font-mono uppercase text-amber-400">
                          Clearance ledger: <strong className="text-amber-400">RESTRICTED - CARD LOCKED</strong>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-mono uppercase text-slate-300">
                          Clearance ledger: <strong className="text-emerald-400">ACTIVE - NO LOCKS</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Miniature compact student cardholder representation */}
                  <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4.5 flex flex-col justify-between h-56 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-full pointer-events-none" />
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <PubKamrupLogo size="sm" />
                        <div>
                          <span className="text-[7px] text-slate-500 font-mono block leading-none">IDENTITY FILE</span>
                          <span className="text-[10px] uppercase font-black text-white tracking-tight">Pub Kamrup College</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">
                        {currentUser.status}
                      </span>
                    </div>

                    <div className="space-y-1 py-1">
                      <span className="text-[8px] text-slate-500 font-mono block leading-none">STUDENT DETAILS</span>
                      <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>

                    {/* Integrated dynamic stats counters */}
                    <div className="py-2 border-t border-b border-slate-900/80 bg-slate-950/20 px-1 text-[10.5px] text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Locker Fines Due:</span>
                        <span className="font-mono text-amber-400 font-bold">
                          ₹{
                            (issues
                              .filter(i => i.memberId === currentUser.id && i.status !== "Returned")
                              .reduce((sum, i) => {
                                const systemTime = new Date("2026-05-26T19:36:09Z").getTime();
                                const dueTime = new Date(`${i.dueDate}T17:00:00Z`).getTime();
                                const diffMs = dueTime - systemTime;
                                if (diffMs < 0) {
                                  const diffDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
                                  return sum + (diffDays * 10); // ₹10 fine per day for late returns
                                }
                                return sum;
                              }, 0)
                            ) + 
                            (Object.values(damageReports) as any[]).filter((r) => !r.resolved).reduce((sum, r) => sum + r.fee, 0)
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Digital Books Access:</span>
                        <span className="text-emerald-400 uppercase font-mono font-bold text-[9px]">unlimited educational sandbox</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1.5">
                      <div>
                        <span className="text-[7px] text-slate-500 font-mono block">RFID CARD NO</span>
                        <span className="text-[10.5px] font-mono text-amber-400 font-bold">{currentUser.id.toUpperCase()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[7px] text-slate-500 font-mono block">ACCESSED ON</span>
                        <span className="text-[9px] text-slate-300 font-mono">{SYSTEM_DATE}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Borrowed Books List (Feat #6 - Books taken and Order details) */}
                  <div className="md:col-span-2 space-y-4">
                    <span className="text-xs font-bold text-slate-400 font-mono tracking-wider block uppercase flex justify-between items-center">
                      <span>BOOKS CURRENTLY TAKEN & PENDING:</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-normal">limit 3 checkouts</span>
                    </span>

                    {(() => {
                      const systemTime = new Date("2026-05-26T19:36:09Z").getTime();
                      const activeUserFines = issues.filter(i => i.memberId === currentUser.id && i.status !== "Returned");
                      const overdueCount = activeUserFines.filter(i => {
                        if (i.status === "Pending Approval") return false;
                        const dueTime = new Date(`${i.dueDate}T17:00:00Z`).getTime();
                        return dueTime < systemTime;
                      }).length;
                      const hasUnresolvedDamaged = (Object.values(damageReports) as any[]).some(r => !r.resolved);
                      
                      if (overdueCount > 0 || hasUnresolvedDamaged) {
                        return (
                          <div className="p-4 bg-rose-950/20 border border-slate-850 rounded-xl space-y-2 animate-fade-in">
                            <div className="flex items-start gap-2.5">
                              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-rose-300 font-mono uppercase tracking-wider">⚠️ LOCK STATUS: OUTSTANDING PENALTY WARNING</h4>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                                  Your student credentials hold an active library lock block. You have <strong className="text-rose-400">{overdueCount} overdue volume(s)</strong> or pending damage dues. Please settle all fine penalties online using our secure black-and-white payment terminal below.
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {issues.filter(i => i.memberId === currentUser.id && i.status !== "Returned").length === 0 ? (
                      <div className="h-40 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                        <BookOpen className="h-6 w-6 text-slate-600 mb-2" />
                        <p className="text-xs text-slate-400 max-w-sm leading-normal">
                          Your active digital locker is currently empty. Visit the <span className="font-semibold text-slate-300">Book Catalog</span> tab below to issue your first volume!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
                        {issues.filter(i => i.memberId === currentUser.id && i.status !== "Returned").map((issue) => {
                          const systemTime = new Date("2026-05-26T19:36:09Z").getTime();
                          const dueTime = new Date(`${issue.dueDate}T17:00:00Z`).getTime();
                          const diffMs = dueTime - systemTime;
                          const isOverdue = diffMs < 0;
                          
                          const absDiffMs = Math.abs(diffMs);
                          const diffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
                          const diffHours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                          
                          const penaltyAmt = isOverdue ? diffDays * 10 : 0.00; // ₹10 fine per day automatically
                          const activeReport = damageReports[issue.id];

                          return (
                            <div key={issue.id} className="p-4 bg-slate-950/45 border border-slate-850 rounded-xl space-y-3 hover:border-slate-800 transition duration-150">
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-white">{issue.bookTitle}</span>
                                    {issue.status === "Pending Approval" ? (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-900/30 text-amber-500 font-mono font-bold animate-pulse">
                                        ⏳ PENDING DESK APPROVAL
                                      </span>
                                    ) : isOverdue ? (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-900/30 text-rose-450 font-mono font-bold animate-pulse">
                                        🚨 OVERDUE: {diffDays} Days {diffHours} Hours
                                      </span>
                                    ) : (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/20 text-emerald-400 font-mono font-semibold">
                                        ⏳ Return in: {diffDays} Days {diffHours} Hours
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-[10.5px] text-slate-400 font-mono">
                                    <span>Issue Date: <strong className="text-slate-300">{issue.issueDate}</strong></span>
                                    <span>Deadline: <strong className="text-slate-300">{issue.dueDate}</strong></span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3.5 justify-between sm:justify-end">
                                  {issue.status !== "Pending Approval" && (
                                    <>
                                      {isOverdue ? (
                                        <div className="flex items-center gap-2">
                                          <div className="text-right mr-1">
                                            <span className="text-[8px] text-slate-500 font-mono block leading-none font-medium">AUTO FINE ACCRUAL</span>
                                            <span className="text-xs font-mono font-bold text-rose-400 font-bold">₹{penaltyAmt}</span>
                                          </div>
                                          <button
                                            onClick={() => {
                                              setPayIssueId(issue.id);
                                              setPayType('overdue');
                                              setPayAmount(penaltyAmt);
                                              setPayMethod('card');
                                              setPayState('idle');
                                              setPayExtendLease(false);
                                              setPayGatewayOpen(true);
                                            }}
                                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10.5px] rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-1 shadow-md hover:scale-[1.02]"
                                          >
                                            <DollarSign className="h-3 w-3" />
                                            Pay Fine Online
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => handleInstantReturnFromLocker(issue.id)}
                                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-555 text-white font-bold text-[10.5px] rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-1 shadow-md hover:scale-[1.02]"
                                        >
                                          <RotateCcw className="h-3 w-3" />
                                          Instant Return
                                        </button>
                                      )}
                                    </>
                                  )}
                                  {issue.status === "Pending Approval" && (
                                    <span className="text-[10px] text-slate-500 font-mono">Collect from library counters on approval</span>
                                  )}
                                </div>
                              </div>

                              {/* Damage and Lost Book Surcharge Options (Feature 18) */}
                              {issue.status !== "Pending Approval" && (
                                <div className="pt-2 border-t border-slate-900/60 flex flex-col gap-2">
                                  {!activeReport ? (
                                    <div className="flex items-center justify-between gap-2 text-[11px] flex-wrap">
                                      <span className="text-slate-500">Is this volume damaged, torn, or lost?</span>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => handleReportDamageOrLoss(issue.id, 'Torn', 150)}
                                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-450 text-[10px] border border-slate-800 transition cursor-pointer"
                                        >
                                          Report Torn Page (₹150)
                                        </button>
                                        <button
                                          onClick={() => handleReportDamageOrLoss(issue.id, 'Damaged', 250)}
                                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-[10px] border border-slate-800 transition cursor-pointer"
                                        >
                                          Report Damaged Cover (₹250)
                                        </button>
                                        <button
                                          onClick={() => handleReportDamageOrLoss(issue.id, 'Lost', 450)}
                                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-[10px] border border-slate-800 transition cursor-pointer"
                                        >
                                          Report Lost Copy (₹450)
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-2.5 rounded bg-rose-950/20 border border-rose-900/30 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                      <div className="text-[11px] text-rose-300">
                                        ⚠️ <strong>Account Suspended:</strong> Volume reported as <strong>{activeReport.type}</strong> (Requires replacement + maintenance charge). Penalty Due: <strong>₹{activeReport.fee}</strong>
                                      </div>
                                      {!activeReport.resolved ? (
                                        <button
                                          onClick={() => {
                                            setPayIssueId(issue.id);
                                            setPayType('damage');
                                            setPayAmount(activeReport.fee);
                                            setPayMethod('card');
                                            setPayState('idle');
                                            setPayExtendLease(false);
                                            setPayGatewayOpen(true);
                                          }}
                                          className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-950 font-mono font-bold text-[10px] rounded transition-all cursor-pointer shadow border border-slate-300 hover:scale-105"
                                        >
                                          Pay Fine Online ₹{activeReport.fee}
                                        </button>
                                      ) : (
                                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-900/35 px-1.5 py-0.5 rounded font-mono">
                                          Resolved & Privileges Restored
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

                {/* Sub-Queue Reservation details */}
                <div className="pt-2 border-t border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-900/30 text-emerald-400 font-mono text-[9px] font-bold rounded">
                      DIGITAL ORDER/QUEUE QUEUES
                    </span>
                    <span className="font-sans font-medium">Stephen Hawking's "A Brief History of Time" - <strong className="text-amber-400">Position #1</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    *Queue resets every 24 hours starting from systemic notification desk clearances.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB H: DEDICATED STUDENT ONLINE FINE PAYMENT PANEL */}
          {activeTab === 'pay-fines' && (
            <div className="animate-fade-in">
              <OnlineFinePaymentDesk
                issues={issues}
                members={members}
                currentUser={currentUser}
                damageReports={damageReports}
                systemDate={SYSTEM_DATE}
                logs={logs}
                onInitiatePayment={(issueId, type, amount) => {
                  setPayIssueId(issueId);
                  setPayType(type);
                  setPayAmount(amount);
                  setPayMethod('card');
                  setPayState('idle');
                  setPayExtendLease(false);
                  setPayGatewayOpen(true);
                }}
              />
            </div>
          )}

          {/* 3. BOTTOM NAVIGATION BAR TAB PILOTS */}
          <div className="flex justify-center w-full pt-6">
            <div className="flex flex-wrap gap-1 bg-slate-900/40 p-1 border border-slate-850 rounded-xl backdrop-blur-md w-full md:w-fit items-center justify-center">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="h-4 w-4 text-emerald-400" />
                Control Hub
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'catalog'
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="h-4 w-4 text-emerald-400" />
                Book Catalog
              </button>
              <button
                onClick={() => setActiveTab('mock-test')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'mock-test'
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Award className="h-4 w-4 text-emerald-400" />
                Academic Mock Test
              </button>
              
              <button
                onClick={() => setActiveTab('issue-requests')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'issue-requests'
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileClock className="h-4 w-4 text-white" />
                Issue Requests Desk
              </button>
              
              {currentUser && currentUser.role === 'Admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('circulation')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'circulation'
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <CalendarCheck2 className="h-4 w-4 text-amber-500" />
                    Circulation Desk
                  </button>
                  <button
                    onClick={() => setActiveTab('members')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'members'
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Users className="h-4 w-4 text-emerald-400" />
                    Patron List
                  </button>
                </>
              )}

              {currentUser && (
                <button
                  onClick={() => setActiveTab('locker')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'locker'
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Digital Locker
                </button>
              )}

              <button
                onClick={() => setActiveTab('pay-fines')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'pay-fines'
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Pay Dues Online
              </button>

              <button
                onClick={() => setActiveTab('e-library')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'e-library'
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="h-4 w-4 text-emerald-400" />
                Online E-Library
              </button>
              <button
                onClick={() => setActiveTab('ai-librarian')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'ai-librarian'
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-emerald-300"
                }`}
              >
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                Ask AI Librarian
              </button>

              {/* Integrated N-LIST & NDLI external portal buttons in navigation bar */}
              <div className="h-5 w-px bg-slate-850 mx-1 hidden lg:block" />
              <a
                href="https://nlist.inflibnet.ac.in/"
                target="_blank"
                rel="noopener noreferrer"
                title="Click to visit INFLIBNET N-LIST Page"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-amber-400 hover:text-amber-200 hover:bg-slate-800 border border-transparent hover:border-slate-800/80 cursor-pointer"
              >
                <Library className="h-3.5 w-3.5 text-amber-500" />
                <span>N-LIST</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
              <a
                href="https://ndl.iitkgp.ac.in/"
                target="_blank"
                rel="noopener noreferrer"
                title="Click to visit National Digital Library of India"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-emerald-400 hover:text-emerald-350 hover:bg-slate-800 border border-transparent hover:border-slate-800/80 cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                <span>NDLI</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* 5. FOOTER WORKSPACE SPONSOR INFO & CONTACT US (Feature Request) */}
      <footer className="border-t border-slate-900 py-12 mt-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          
          {/* Detailed Portal Directory Indexes (User Requested) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-slate-900/60">
            {/* Library Modules */}
            <div className="space-y-3">
              <h5 className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">PORTAL MODULES</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition duration-200 cursor-pointer text-left">
                    Dashboard Hub
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('catalog'); setSelectedGenre('All'); }} className="hover:text-white transition duration-200 cursor-pointer text-left">
                    Standard Book Catalog
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('e-library')} className="hover:text-white transition duration-200 cursor-pointer text-left">
                    Online E-Library Reader
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('ai-librarian')} className="hover:text-white transition duration-200 cursor-pointer text-left">
                    Alex GenAI Librarian Chat
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('mock-test')} className="hover:text-white transition duration-200 cursor-pointer text-left text-emerald-400">
                    Academic Mock Test Center
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('issue-requests')} className="hover:text-white transition duration-200 cursor-pointer text-left text-slate-200 font-medium">
                    Issue Desk & Admin Approvals [B&W]
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('pay-fines')} className="hover:text-white transition duration-200 cursor-pointer text-left text-emerald-400">
                    Online Dues & Fines Desk
                  </button>
                </li>
              </ul>
            </div>

            {/* Academic Curriculums */}
            <div className="space-y-3">
              <h5 className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">POPULAR SUBJECT SHELVES</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => { setActiveTab('catalog'); setSelectedGenre('Computer Science'); }} className="hover:text-white transition duration-200 cursor-pointer text-left">
                    Computer Science & IT
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('catalog'); setSelectedGenre('Physics'); }} className="hover:text-white transition duration-200 cursor-pointer text-left">
                    Physical Sciences (Physics)
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('catalog'); setSelectedGenre('Mathematics'); }} className="hover:text-white transition duration-200 cursor-pointer text-left">
                    Higher Mathematics
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('catalog'); setSelectedGenre('Assamese'); }} className="hover:text-white transition duration-200 cursor-pointer text-left">
                    Assamese Literature
                  </button>
                </li>
              </ul>
            </div>

            {/* State Recruitment Prep */}
            <div className="space-y-3">
              <h5 className="text-[10px] uppercase font-bold tracking-widest text-emerald-450 font-mono">CAREER DESK DESK</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <span className="text-slate-300 font-medium">Assam Govt Mock Tests:</span>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('dashboard'); setTimeout(() => document.getElementById('assam-exam-workspace')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-emerald-400 text-[11px] transition duration-200 cursor-pointer text-left text-slate-400 flex items-center gap-1">
                    🎯 Practice 5 Daily MCQs
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('dashboard'); setTimeout(() => document.getElementById('assam-exam-workspace')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-emerald-400 text-[11px] transition duration-200 cursor-pointer text-left text-slate-400 flex items-center gap-1">
                    📋 Track Study Goals
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('ai-librarian'); }} className="hover:text-emerald-400 text-[11px] transition duration-200 cursor-pointer text-left text-slate-400 flex items-center gap-1">
                    🤖 Consult AI study companion
                  </button>
                </li>
              </ul>
            </div>

            {/* Institutional info */}
            <div className="space-y-3">
              <h5 className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">INSTITUTION</h5>
              <p className="text-xs text-slate-400 leading-normal">
                Pub Kamrup College holds a NAAC accredited grade 'A'. Serving Kamrup district, Assam since its golden establishment in 1972.
              </p>
            </div>
          </div>

          {/* Contact Details Grid (Feature Request) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 pb-6 border-b border-slate-900/40">
            {/* Address */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                Contact Us
              </span>
              <h4 className="font-sans text-xs font-bold text-white uppercase">Address</h4>
              <p className="font-sans text-xs text-slate-400 leading-normal">
                Baihata Chariali, Kamrup, Assam 781381
              </p>
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                E-mail
              </span>
              <h4 className="font-sans text-xs font-bold text-white uppercase">E-mail</h4>
              <p className="font-sans text-xs text-slate-300 font-mono hover:text-emerald-400 transition-colors">
                <a href="mailto:principal@pubkamrupcollege.org">principal@pubkamrupcollege.org</a>
              </p>
            </div>

            {/* Telephone */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                Telephone
              </span>
              <h4 className="font-sans text-xs font-bold text-white uppercase">Telephone</h4>
              <div className="text-xs text-slate-400 font-mono space-y-0.5">
                <p>+91 8638375658</p>
                <p>+91 9435409567</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-slate-500 font-sans">
              &copy; 2026 Smart Library Management System | Academic Project Submission Platform | Pub Kamrup College. All rights reserved.
            </div>
            <div className="flex gap-4 text-xs text-slate-500 font-mono">
              <span>Built with React 19 / Tailwind 4 / Express / Node / Gemini AI</span>
            </div>
          </div>
        </div>
      </footer>
 
      {/* RETHINK: BLACK & WHITE ONLINE SECURE PAYMENT GATEWAY (Feature Request) */}
      {payGatewayOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white text-slate-900 border-2 border-slate-950 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-300">SECURE BILLING DESK</span>
              </div>
              <button 
                onClick={() => { setPayGatewayOpen(false); setPayState('idle'); }}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer px-2 py-1 rounded border border-slate-800 hover:border-slate-700 select-none bg-slate-900"
              >
                [ CLOSE ]
              </button>
            </div>
 
            {/* Core Body Container */}
            <div className="p-6 space-y-6">
              
              {payState === 'idle' && (
                <form onSubmit={handleProcessOnlinePayment} className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono block leading-none uppercase">ACCOUNT TYPE</span>
                    <h3 className="text-base font-extrabold text-slate-950 uppercase">
                      {payType === 'overdue' ? 'Late Return Overdue Penalty' : 'Damage/Loss Compensation'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Processing online dues settlement for library account identification: <span className="font-mono text-slate-800 font-bold">{currentUser?.id?.toUpperCase()}</span>
                    </p>
                  </div>
 
                  {/* Summary Box */}
                  <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-mono">BILL AMOUNT DUE:</span>
                      <span className="text-lg font-black text-slate-950 font-mono">₹{payAmount.toFixed(2)}</span>
                    </div>
                    
                    {payType === 'overdue' && (
                      <div className="pt-2 border-t border-slate-200 space-y-2">
                        <span className="text-[10px] text-slate-500 font-mono block uppercase">POST-PAYMENT DISPATCH PLAN</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPayExtendLease(false)}
                            className={`p-2.5 rounded-lg text-left border text-[10.5px] transition-all cursor-pointer ${
                              !payExtendLease 
                                ? 'bg-slate-950 text-white border-slate-950 shadow-sm' 
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span className="font-extrabold block">Pay & Check-In</span>
                            <span className="text-[9px] opacity-80 block mt-0.5">Settle late fee & return book</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setPayExtendLease(true)}
                            className={`p-2.5 rounded-lg text-left border text-[10.5px] transition-all cursor-pointer ${
                              payExtendLease 
                                ? 'bg-slate-950 text-white border-slate-950 shadow-sm' 
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span className="font-extrabold block">Pay & Keep (Extend)</span>
                            <span className="text-[9px] opacity-80 block mt-0.5">Settle late fee & renew 15 days</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
 
                  {/* Payment Method Tabs */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-mono block leading-none uppercase">CHOOSE DIGITAL CHANNEL</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayMethod('card')}
                        className={`py-2 text-xs font-bold font-mono uppercase border rounded-lg transition-all cursor-pointer ${
                          payMethod === 'card' 
                            ? 'bg-slate-950 text-white border-slate-950' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        💳 Debit/Credit Card
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setPayMethod('upi')}
                        className={`py-2 text-xs font-bold font-mono uppercase border rounded-lg transition-all cursor-pointer ${
                          payMethod === 'upi' 
                            ? 'bg-slate-950 text-white border-slate-950' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        📱 BHIM UPI Scan
                      </button>
                    </div>
                  </div>
 
                  {/* Payment Forms */}
                  {payMethod === 'card' ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-bold text-slate-600 font-mono block uppercase">CARDHOLDER NAME</label>
                        <input
                          type="text"
                          required
                          placeholder="Alvis Khandakar"
                          className="w-full px-3 py-1.5 border border-slate-300 text-xs text-slate-900 rounded-lg focus:outline-none focus:border-slate-950"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-bold text-slate-600 font-mono block uppercase">CARD NUMBER</label>
                        <input
                          type="text"
                          required
                          value={payCardNo}
                          onChange={(e) => setPayCardNo(e.target.value.replace(/\D/g, "").slice(0, 16))}
                          placeholder="4532 •••• •••• 8812"
                          className="w-full px-3 py-1.5 border border-slate-300 text-xs text-slate-900 font-mono rounded-lg focus:outline-none focus:border-slate-950 text-left"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-bold text-slate-600 font-mono block uppercase">EXPIRY DATE</label>
                          <input
                            type="text"
                            required
                            value={payCardExpiry}
                            onChange={(e) => setPayCardExpiry(e.target.value.slice(0, 5))}
                            placeholder="MM/YY"
                            className="w-full px-3 py-1.5 border border-slate-300 text-xs text-slate-900 font-mono rounded-lg focus:outline-none focus:border-slate-950"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-bold text-slate-600 font-mono block uppercase">SECURITY CVC</label>
                          <input
                            type="password"
                            required
                            value={payCardCvc}
                            onChange={(e) => setPayCardCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                            placeholder="•••"
                            className="w-full px-3 py-1.5 border border-slate-300 text-xs text-slate-900 font-mono rounded-lg focus:outline-none focus:border-slate-950"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2.5 px-3 border border-slate-200 bg-slate-50 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1.5 shrink-0">
                        <label className="text-[9.5px] font-bold text-slate-600 font-mono block uppercase">ENTER UPI ADDRESS</label>
                        <input
                          type="text"
                          required={payMethod === 'upi'}
                          value={payUpiId}
                          onChange={(e) => setPayUpiId(e.target.value)}
                          placeholder="student@okaxis"
                          className="px-3 py-1.5 border border-slate-300 text-xs text-slate-900 font-mono rounded-lg focus:outline-none focus:border-slate-950 w-44"
                        />
                      </div>
                      <div className="flex flex-col items-center justify-center shrink-0">
                        <div className="w-16 h-16 bg-slate-950 text-white rounded-lg border border-slate-950 flex items-center justify-center text-[8px] font-mono p-1 text-center font-bold">
                          [ QR CODE ]
                        </div>
                        <span className="text-[8px] text-slate-500 font-mono block mt-1 tracking-tight leading-none text-center">Scan with UPI App</span>
                      </div>
                    </div>
                  )}
 
                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-950 text-white hover:bg-slate-850 text-xs font-bold font-mono tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    AUTHORIZE SECURED PAYMENT: ₹{payAmount.toFixed(2)}
                  </button>
                </form>
              )}
 
              {payState === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-950 animate-spin" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Verifying Ledger Standing</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto text-[11px]">
                      Contacting Pub Kamrup College transaction engine. Please hold to establish secure verification token.
                    </p>
                  </div>
                </div>
              )}
 
              {payState === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-5">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-black text-xl border border-emerald-300">
                    ✓
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-extrabold text-slate-950 uppercase font-mono text-xs">DUES CLEARED SUCCESSFULLY</h4>
                    <p className="text-xs text-slate-500 max-w-sm leading-relaxed text-[11px]">
                      Your online virtual payment has been logged in full. Outstanding academic fine blocks have been removed, inventory records adjusted, and account privileges fully restored.
                    </p>
                  </div>
                  <button
                    onClick={() => { setPayGatewayOpen(false); setPayState('idle'); }}
                    className="px-5 py-2 bg-slate-950 text-white hover:bg-slate-850 text-xs font-bold font-mono tracking-wide rounded-xl transition-all cursor-pointer"
                  >
                    CONTINUE STUDY SANDBOX
                  </button>
                </div>
              )}
 
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { Book, BookIssue, Member, ALL_DEPARTMENTS } from "../types";
import { 
  Check, 
  X, 
  Search, 
  BookOpen, 
  Clock, 
  AlertCircle, 
  Inbox, 
  FileText,
  User,
  Filter,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface IssueRequestsAndApprovalsProps {
  currentUser: Member | null;
  books: Book[];
  issues: BookIssue[];
  onSaveIssues: (updatedIssues: BookIssue[]) => Promise<void> | void;
  onSaveBooks: (updatedBooks: Book[]) => Promise<void> | void;
  onLogActivity: (type: "issue" | "return" | "add_book" | "edit_book" | "add_member" | "delete_book", desc: string) => void;
}

export default function IssueRequestsAndApprovals({
  currentUser,
  books,
  issues,
  onSaveIssues,
  onSaveBooks,
  onLogActivity
}: IssueRequestsAndApprovalsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [rejectingIssueId, setRejectingIssueId] = useState<string | null>(null);
  const [customRejectReason, setCustomRejectReason] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick feedback alert helper
  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // Student checkout/request logic
  const handleRequestBook = async (bookId: string) => {
    if (!currentUser) {
      triggerError("Please log in to submit physical book requests.");
      return;
    }

    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    if (book.availableCopies < 1) {
      triggerError(`"${book.title}" is currently out of stock. Please check again later or read its digital excerpt.`);
      return;
    }

    // Checking if maximum active requests of student are reached (Locker limit: 3 active checkouts or requests)
    const countOfActive = issues.filter(
      (i) => i.memberId === currentUser.id && i.status !== "Returned" && i.status !== "Rejected"
    ).length;

    if (countOfActive >= 3) {
      triggerError("Issue Limit Reached: You can have at most 3 active checkouts or pending requests at one time.");
      return;
    }

    // Checking if already requested
    const isAlreadyRequested = issues.some(
      (i) => i.bookId === bookId && i.memberId === currentUser.id && i.status !== "Returned" && i.status !== "Rejected"
    );

    if (isAlreadyRequested) {
      triggerError("Duplicate Request: You already have an active request or checkout for this book on record.");
      return;
    }

    const defaultDueDays = currentUser.role === "Faculty" ? 90 : 30;
    const due = new Date();
    due.setDate(due.getDate() + defaultDueDays);

    const newRequest: BookIssue = {
      id: `req-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      memberId: currentUser.id,
      memberName: currentUser.name,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: due.toISOString().split("T")[0],
      status: "Pending Approval"
    };

    const updatedIssues = [newRequest, ...issues];
    await onSaveIssues(updatedIssues);
    onLogActivity("issue", `${currentUser.name} requested book "${book.title}" (Awaiting administrative approval)`);
    triggerSuccess(`Successfully requested "${book.title}". Track approval status in real-time below.`);
  };

  // Admin Acceptance
  const handleApproveRequest = async (issueId: string) => {
    const issueObj = issues.find((i) => i.id === issueId);
    if (!issueObj) return;

    // Check inventory
    const bookObj = books.find((b) => b.id === issueObj.bookId);
    if (!bookObj) {
      triggerError("Requested book does not exist in our active inventory catalog.");
      return;
    }

    if (bookObj.availableCopies < 1) {
      triggerError(`"${bookObj.title}" holds zero physical copies left on shelves. Approval blocked.`);
      return;
    }

    // Update Issue status
    const updatedIssues = issues.map((i) => {
      if (i.id === issueId) {
        return { 
          ...i, 
          status: "Issued" as const,
          issueDate: new Date().toISOString().split("T")[0] // set actual issue timestamp
        };
      }
      return i;
    });

    // Update Book copies
    const updatedBooks = books.map((b) => {
      if (b.id === bookObj.id) {
        return { ...b, availableCopies: Math.max(0, b.availableCopies - 1) };
      }
      return b;
    });

    await onSaveIssues(updatedIssues);
    await onSaveBooks(updatedBooks);
    onLogActivity("issue", `Admin APPROVED online library issue request for "${bookObj.title}" to student: ${issueObj.memberName}`);
    triggerSuccess(`Approved and issued "${bookObj.title}" to ${issueObj.memberName}. Digital receipt logged.`);
  };

  // Admin Rejection
  const handleRejectRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingIssueId) return;

    const issueId = rejectingIssueId;
    const issueObj = issues.find((i) => i.id === issueId);
    if (!issueObj) {
      setRejectingIssueId(null);
      return;
    }

    const reason = customRejectReason.trim() || "Policy constraint / Overuse limit reached.";

    const updatedIssues = issues.map((i) => {
      if (i.id === issueId) {
        return { 
          ...i, 
          status: "Rejected" as const, 
          rejectReason: reason 
        };
      }
      return i;
    });

    await onSaveIssues(updatedIssues);
    onLogActivity("issue", `Admin REJECTED online library request for "${issueObj.bookTitle}" (Student: ${issueObj.memberName}). Reason: ${reason}`);
    
    setRejectingIssueId(null);
    setCustomRejectReason("");
    triggerSuccess(`Successfully decline-notified "${issueObj.memberName}" regarding request for "${issueObj.bookTitle}".`);
  };

  // Filter Catalog
  const filteredCatalogBooks = books.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);

    const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;

    return matchesSearch && matchesGenre;
  });

  // Split calculations
  const totalPending = issues.filter((i) => i.status === "Pending Approval");
  const studentPending = issues.filter((i) => i.memberId === currentUser?.id && i.status === "Pending Approval");
  const studentHistory = issues.filter(
    (i) => i.memberId === currentUser?.id && (i.status === "Issued" || i.status === "Rejected" || i.status === "Returned")
  );

  const allProcessedHistory = issues.filter(
    (i) => i.status === "Issued" || i.status === "Rejected" || i.status === "Returned"
  );

  const isAdmin = currentUser && currentUser.role === "Admin";

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1 sm:px-4 py-3 text-slate-100">
      
      {/* MONOCHROME HERO BANNER */}
      <div className="bg-white text-slate-950 p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-mono bg-slate-900 text-white px-2 py-1 rounded">
            System Protocol
          </span>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight mt-2">
            Issue Desk & Approval Registry
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
            A simplified, high-contrast monochrome terminal tailored for student paperless checkout requests and instant administrative logistics screening.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 self-start md:self-auto font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-pulse" />
            <span>Dual Operations Enabled</span>
          </div>
          <span className="text-slate-500 text-[10px]">AUTH ACCESS LEVEL: {currentUser ? currentUser.role.toUpperCase() : "PUBLIC"}</span>
        </div>
      </div>

      {/* DYNAMIC FLASH STATUS FEEDS */}
      {successMessage && (
        <div className="p-4 bg-slate-950 border border-slate-200 text-slate-200 text-xs rounded-xl flex items-center gap-3 animate-fade-in font-mono shadow-md">
          <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-950 flex items-center justify-center font-bold text-[10px]">
            ✓
          </div>
          <span className="flex-1">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-white border border-slate-950 text-slate-950 text-xs rounded-xl flex items-center gap-3 animate-fade-in font-mono shadow-md">
          <div className="w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-[10px]">
            ✕
          </div>
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {/* MAIN DUAL WORKSPACES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ========================================================
            LEFT COLUMN : SEARCH & REQUEST PLATFORM (FOR ALL / STUDENTS)
           ======================================================== */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold tracking-wider text-slate-200 font-mono">
                  1. CATALOG DISPATCH DESK
                </h2>
                <p className="text-slate-500 text-[11px]">
                  Browse real-time volumes to dispatch a formal issue request.
                </p>
              </div>
              <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                {filteredCatalogBooks.length} Available Items
              </span>
            </div>

            {/* BAR FILTERS */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Identify title, author, isbn or syllabus reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-slate-500 rounded-xl py-2 pl-9 pr-4 text-xs font-mono outline-none placeholder-slate-600 transition"
                />
              </div>

              <div className="flex items-center gap-2 min-w-[140px]">
                <Filter className="h-3 w-3 text-slate-500" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-slate-500 cursor-pointer text-ellipsis overflow-hidden"
                >
                  <option value="All">All Curriculums</option>
                  {ALL_DEPARTMENTS.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECTIONS LISTING */}
            {filteredCatalogBooks.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-900 rounded-xl space-y-2">
                <Inbox className="h-6 w-6 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-500 font-mono">No matching book records matches filter parameters.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1.5">
                {filteredCatalogBooks.map((book) => {
                  const isOutOfStock = book.availableCopies < 1;
                  const activeUserReqsCount = currentUser ? issues.filter(
                    (i) => i.memberId === currentUser.id && i.bookId === book.id && i.status !== "Returned" && i.status !== "Rejected"
                  ).length : 0;
                  
                  return (
                    <div 
                      key={book.id} 
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                        isOutOfStock 
                          ? "border-slate-900 bg-slate-950/40 opacity-60" 
                          : "border-slate-900 bg-slate-900/10 hover:border-slate-800 hover:bg-slate-900/30"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 font-medium px-2 py-0.5 bg-slate-950 border border-slate-900 rounded">
                            {book.genre}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            ISBN: {book.isbn}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-100 font-sans tracking-wide">
                          {book.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-sans">
                          by <strong className="text-slate-300 font-medium">{book.author}</strong> — Shelf Location: <code className="text-slate-400 font-mono text-[10px] bg-slate-900 px-1 py-0.2 rounded">{book.shelfLocation || "Rack 1-A"}</code>
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 shrink-0 justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-900">
                        <div className="text-right">
                          <span className="text-[11px] font-mono text-slate-400">
                            {book.availableCopies} left
                          </span>
                          <span className="text-[9px] text-slate-600 block">
                            of {book.totalCopies} total copies
                          </span>
                        </div>

                        {currentUser ? (
                          activeUserReqsCount > 0 ? (
                            <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-850">
                              Active Request Exists
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRequestBook(book.id)}
                              disabled={isOutOfStock}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono tracking-wider transition ${
                                isOutOfStock
                                  ? "bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed"
                                  : "bg-white text-slate-950 hover:bg-slate-200 shadow-sm border border-slate-200"
                              }`}
                            >
                              {isOutOfStock ? "[ OUT OF STOCK ]" : "[ REQUEST ISSUE ]"}
                            </button>
                          )
                        ) : (
                          <div className="text-[10px] text-slate-500 font-mono text-right italic">
                            Sign in to request
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MY SENT REQUESTS LEDGER (SHOWN FOR STUDENTS & LOGGED IN MEMBERS) */}
          {currentUser && !isAdmin && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold tracking-wider text-slate-200 font-mono">
                  2. MY REQUEST LEDGER
                </h2>
                <span className="text-slate-500 text-[11px]">
                  Real-time approval logs and history of requested issues for {currentUser.name}.
                </span>
              </div>

              {/* PENDING ITEMS */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest pl-1">
                  • Outstanding Submissions ({studentPending.length})
                </h3>

                {studentPending.length === 0 ? (
                  <p className="text-xs text-slate-600 font-mono italic pl-1">
                    No active requests waiting for admin logistics review.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {studentPending.map((req) => (
                      <div key={req.id} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl flex items-center justify-between gap-3 font-mono">
                        <div>
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-slate-400 font-bold">
                            PENDING APPROVAL
                          </span>
                          <h4 className="text-xs font-bold text-slate-200 mt-1.5">{req.bookTitle}</h4>
                          <span className="text-[10px] text-slate-500 block">Requested Date: {req.issueDate} | Return Deadline: {req.dueDate}</span>
                        </div>
                        <div className="text-slate-500 flex items-center gap-1.5 shrink-0 text-xs">
                          <Clock className="w-4 h-4 animate-spin text-slate-400" />
                          <span>Screening</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ARCHIVE ITEMS */}
              <div className="space-y-3 pt-3 border-t border-slate-900">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest pl-1">
                  • Past Decisions Ledger ({studentHistory.length})
                </h3>

                {studentHistory.length === 0 ? (
                  <p className="text-xs text-slate-600 font-mono italic pl-1">
                    No history of approved or rejected drafts on this account.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {studentHistory.map((req) => {
                      const isRejected = req.status === "Rejected";
                      const isReturned = req.status === "Returned";
                      return (
                        <div 
                          key={req.id} 
                          className={`p-4 rounded-xl border font-mono ${
                            isRejected 
                              ? "bg-slate-950/20 border-slate-900" 
                              : "bg-slate-900/10 border-slate-900"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[9px] mb-1">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${
                              isRejected 
                                ? "bg-white text-slate-950" 
                                : isReturned 
                                  ? "bg-slate-900 text-slate-400 border border-slate-800"
                                  : "bg-slate-200 text-slate-950"
                            }`}>
                              {req.status.toUpperCase()}
                            </span>
                            <span className="text-slate-600">ID: {req.id}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-200">{req.bookTitle}</h4>
                          <div className="text-[10px] text-slate-500 mt-1 flex flex-col gap-0.5">
                            <span>Sent on: {req.issueDate}</span>
                            {!isRejected && <span>Due Back: {req.dueDate}</span>}
                            {isRejected && (
                              <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-850 text-slate-300 text-[10.5px]">
                                <span className="text-slate-500 block text-[9.5px] uppercase font-bold tracking-wider">Declined Notice reason:</span>
                                {req.rejectReason || "Standard administrative issue buffer."}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* ========================================================
            RIGHT COLUMN : ADMIN DESK SCREENING (FOR ADMINS ONLY)
           ======================================================== */}
        <div className="space-y-6">
          
          {/* USER SIGN-REGISTRY NOTICE */}
          {!currentUser ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <User className="h-8 w-8 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200">AUTHENTICATION REQUIRED</h3>
                <p className="text-slate-500 text-[11px]">
                  Please sign in with your student RFID Card or ID number code to access the book request desk and track clearances.
                </p>
              </div>
              <div className="text-slate-600 font-mono text-[10px] uppercase border border-slate-900 p-2 rounded bg-slate-950">
                Locker Policy Limit: Max 3 active volumes.
              </div>
            </div>
          ) : (
            <div className="bg-slate-955 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-xs uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 font-sans">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{currentUser.role} Account Status: {currentUser.status}</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                RFID ACTIVE
              </span>
            </div>
          )}

          {/* ADMIN DECISION PANEL (ONLY FOR ADMINS) */}
          {isAdmin && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold tracking-wider text-slate-100 font-mono">
                    ADMIN DESK SCREENING
                  </h2>
                  <span className="text-xs bg-white text-slate-950 font-mono font-bold px-2 py-0.5 rounded-full">
                    {totalPending.length} NEW
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">
                  Decide outstanding book volumes issues directly in this simple black & white decision portal.
                </p>
              </div>

              {/* REJECT FORM DOCK */}
              {rejectingIssueId && (
                <form onSubmit={handleRejectRequestSubmit} className="p-4 bg-slate-900 font-mono rounded-xl border border-slate-700 animate-slide-down space-y-3">
                  <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-100 font-bold">REJECTION RATIONAL</span>
                    <button 
                      type="button" 
                      onClick={() => setRejectingIssueId(null)}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block uppercase">Decline Remark (Optional)</label>
                    <textarea
                      placeholder="e.g. Target curriculum book reserved for incoming mid-term examinations."
                      value={customRejectReason}
                      onChange={(e) => setCustomRejectReason(e.target.value)}
                      className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-slate-500 rounded p-2 text-xs h-16 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 bg-white text-slate-950 hover:bg-slate-200 font-bold rounded text-xs transition"
                  >
                    CONFIRM REJECTION & DECLINE
                  </button>
                </form>
              )}

              {/* PENDING LIST */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest pl-1 flex items-center justify-between">
                  <span>Pending Screening Queue</span>
                  <span>({totalPending.length})</span>
                </h3>

                {totalPending.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-900 rounded-xl space-y-2">
                    <Check className="h-5 w-5 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-500 font-mono">No student issue drafts are holding in screening.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {totalPending.map((req) => {
                      const bookObj = books.find(b => b.id === req.bookId);
                      const isOutOfStock = bookObj ? bookObj.availableCopies < 1 : true;

                      return (
                        <div key={req.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
                          <div className="space-y-1 font-mono">
                            <div className="flex justify-between items-center text-[9px]">
                              <span className="text-slate-400 tracking-wider">RFID: {req.memberId}</span>
                              <span className="text-slate-500">{req.issueDate}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-100">{req.bookTitle}</h4>
                            <p className="text-[10px] text-slate-400">
                              Student: <strong className="text-slate-300 font-normal">{req.memberName}</strong>
                            </p>
                            <span className="text-[10px] text-slate-500 block">
                              Stock: {bookObj ? `${bookObj.availableCopies}/${bookObj.totalCopies}` : "Unk"} available
                            </span>
                          </div>

                          <div className="flex gap-2 font-mono">
                            <button
                              onClick={() => {
                                setRejectingIssueId(req.id);
                                setCustomRejectReason("");
                              }}
                              className="flex-1 py-1 px-2.5 bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-500 rounded text-[11px] font-bold tracking-wider transition"
                            >
                              DECLINE
                            </button>
                            <button
                              onClick={() => handleApproveRequest(req.id)}
                              disabled={isOutOfStock}
                              className={`flex-1 py-1 px-2.5 rounded text-[11px] font-bold tracking-wider transition ${
                                isOutOfStock
                                  ? "bg-slate-950 text-slate-700 border border-slate-900 cursor-not-allowed"
                                  : "bg-white text-slate-950 hover:bg-slate-200 border border-slate-200"
                              }`}
                            >
                              {isOutOfStock ? "OUT OF COPIES" : "APPROVE & HANDOUT"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* STATS RATIO SUMMARY */}
              <div className="pt-4 border-t border-slate-900 text-slate-500 text-[10.5px] font-mono grid grid-cols-2 gap-2">
                <div className="space-y-0.5 border-r border-slate-900 pr-2">
                  <span className="block text-[9px] uppercase tracking-wider">Approved Actions (Historical)</span>
                  <span className="text-slate-200 font-bold block text-sm">{allProcessedHistory.filter(i => i.status === "Issued" || i.status === "Returned").length}</span>
                </div>
                <div className="space-y-0.5 pl-2">
                  <span className="block text-[9px] uppercase tracking-wider">Rejected Requests</span>
                  <span className="text-slate-200 font-bold block text-sm">{allProcessedHistory.filter(i => i.status === "Rejected").length}</span>
                </div>
              </div>
              
              {/* HISTORICAL WORKFLOW LISTS */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest pl-1 flex justify-between items-center">
                  <span>Recent Archives</span>
                  <span className="text-[10px] text-slate-600 font-normal">Last {Math.min(5, allProcessedHistory.length)} transactions</span>
                </h3>

                {allProcessedHistory.length === 0 ? (
                  <p className="text-[11px] text-slate-600 font-mono italic pl-1">No action records currently compiled.</p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {allProcessedHistory.slice(0, 5).map((h) => (
                      <div key={h.id} className="p-2.5 bg-slate-900/20 border border-slate-900 rounded-lg text-[10.5px] font-mono space-y-1">
                        <div className="flex justify-between items-center text-[8.5px]">
                          <span className={`px-1.5 py-0.2 rounded ${h.status === "Rejected" ? "bg-white text-slate-900 text-[8px]" : "bg-slate-900 text-slate-400 border border-slate-850"}`}>
                            {h.status.toUpperCase()}
                          </span>
                          <span className="text-slate-600">{h.issueDate}</span>
                        </div>
                        <p className="text-slate-200 font-semibold line-clamp-1">{h.bookTitle}</p>
                        <p className="text-slate-500 text-[9.5px]">Student: {h.memberName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SYSTEM STANDARDS METRICS */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono space-y-3">
            <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">SYSTEM STANDARDS</h3>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li className="flex justify-between border-b border-slate-900 pb-1.5">
                <span>Hold Duration Limit</span>
                <span className="text-slate-200 font-bold">30 Days</span>
              </li>
              <li className="flex justify-between border-b border-slate-900 pb-1.5">
                <span>Maximum Active Cards Hold</span>
                <span className="text-slate-200 font-bold">3 Volumes</span>
              </li>
              <li className="flex justify-between border-b border-slate-900 pb-1.5">
                <span>Verification Method</span>
                <span className="text-slate-200 font-bold">RFID Card ID</span>
              </li>
              <li className="flex justify-between">
                <span>Automatic Lock Penalty</span>
                <span className="text-slate-200 font-bold">₹10 / Overdue Day</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}

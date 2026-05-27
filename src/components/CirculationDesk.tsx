/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Book, Member, BookIssue } from "../types";
import { BookOpenCheck, RotateCcw, UserCheck, CalendarDays, AlertCircle, PlusCircle, CheckCircle } from "lucide-react";

interface CirculationDeskProps {
  books: Book[];
  members: Member[];
  issues: BookIssue[];
  onSaveBooks: (updatedBooks: Book[]) => void;
  onSaveIssues: (updatedIssues: BookIssue[]) => void;
  onLogActivity: (type: 'issue' | 'return', desc: string) => void;
}

export default function CirculationDesk({
  books,
  members,
  issues,
  onSaveBooks,
  onSaveIssues,
  onLogActivity
}: CirculationDeskProps) {
  // Issue states
  const [selectedBookId, setSelectedBookId] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    // Default due date: 14 days from active local date (2026-05-26 -> 2026-06-09)
    const d = new Date("2026-05-26");
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const handleIssueBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!selectedBookId || !selectedMemberId) {
      setFormError("Please select both a valid book and a registered cardholder.");
      return;
    }

    const book = books.find((b) => b.id === selectedBookId);
    const member = members.find((m) => m.id === selectedMemberId);

    if (!book) {
      setFormError("Selected book was not found.");
      return;
    }

    if (!member) {
      setFormError("Selected member was not found.");
      return;
    }

    if (book.availableCopies < 1) {
      setFormError(`"${book.title}" is out of physical stock at the moment. All shelf copies are loaned.`);
      return;
    }

    if (member.status === "Suspended") {
      setFormError(`Membership for ${member.name} has been suspended. Resolve outstanding violations first.`);
      return;
    }

    // Check duplicate active issue for same book to same member
    const alreadyBorrowing = issues.some(
      (i) => i.bookId === selectedBookId && i.memberId === selectedMemberId && i.status !== "Returned"
    );
    if (alreadyBorrowing) {
      setFormError(`${member.name} is already borrowing an active copy of this book.`);
      return;
    }

    // Issue Book Transaction
    const newIssue: BookIssue = {
      id: `i${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      memberId: member.id,
      memberName: member.name,
      issueDate: "2026-05-26", // Anchor standard active simulation time
      dueDate: dueDate,
      status: "Issued"
    };

    // Update book count
    const updatedBooks = books.map((b) => {
      if (b.id === book.id) {
        return { ...b, availableCopies: b.availableCopies - 1 };
      }
      return b;
    });

    onSaveBooks(updatedBooks);
    onSaveIssues([newIssue, ...issues]);
    onLogActivity("issue", `Issued "${book.title}" to ${member.name} (Due: ${dueDate})`);
    
    // Clear select fields
    setSelectedBookId("");
    setSelectedMemberId("");
    setFormSuccess(`Book lent successfully! Checkout slip issued to ${member.name}.`);
  };

  const handleReturnBook = (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;

    // Update issues index
    const updatedIssues = issues.map((i) => {
      if (i.id === issueId) {
        return {
          ...i,
          returnDate: "2026-05-26",
          status: "Returned" as const
        };
      }
      return i;
    });

    // Increment available copies of book on shelf
    const updatedBooks = books.map((b) => {
      if (b.id === issue.bookId) {
        return { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) };
      }
      return b;
    });

    onSaveBooks(updatedBooks);
    onSaveIssues(updatedIssues);
    onLogActivity("return", `Returned "${issue.bookTitle}" from ${issue.memberName}`);
    setFormSuccess(`Book "${issue.bookTitle}" checkin recorded successfully.`);
  };

  const handleApprovePendingRequest = (issueId: string) => {
    const issueObj = issues.find(i => i.id === issueId);
    if (!issueObj) return;

    const bookObj = books.find(b => b.id === issueObj.bookId);
    if (!bookObj) return;

    if (bookObj.availableCopies < 1) {
      alert(`"${bookObj.title}" is out of physical copies! Cannot approve issue request.`);
      return;
    }

    const updatedIssues = issues.map(i => {
      if (i.id === issueId) {
        return { ...i, status: "Issued" as const };
      }
      return i;
    });

    const updatedBooks = books.map(b => {
      if (b.id === bookObj.id) {
        return { ...b, availableCopies: b.availableCopies - 1 };
      }
      return b;
    });

    onSaveBooks(updatedBooks);
    onSaveIssues(updatedIssues);
    onLogActivity("issue", `Approved Online Book Issue for "${bookObj.title}" to student: ${issueObj.memberName}`);
    setFormSuccess(`Online request approved! "${bookObj.title}" is now issued to ${issueObj.memberName}.`);
  };

  const handleRejectPendingRequest = (issueId: string) => {
    const issueObj = issues.find(i => i.id === issueId);
    if (!issueObj) return;

    const updatedIssues = issues.filter(i => i.id !== issueId);
    onSaveIssues(updatedIssues);
    onLogActivity("return", `Admin declined Online Issue Request for "${issueObj.bookTitle}" from student: ${issueObj.memberName}`);
    setFormSuccess(`Declined request from ${issueObj.memberName} for "${issueObj.bookTitle}".`);
  };

  // Compute lists of active issues
  const pendingRequests = issues.filter((i) => i.status === "Pending Approval");
  const activeIssues = issues.filter((i) => i.status === "Issued" || i.status === "Overdue");
  const returnedIssues = issues.filter((i) => i.status === "Returned");

  return (
    <div id="circulation-desk-module" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Issue Transaction desk Form */}
      <div className="bg-slate-900/40 p-5 border border-slate-800 rounded-2xl backdrop-blur-md h-fit">
        <h3 className="font-sans text-sm font-bold text-white flex items-center gap-2">
          <BookOpenCheck className="h-4 w-4 text-emerald-400" />
          Outbound Lending Terminal
        </h3>
        <p className="font-sans text-xs text-slate-400 mt-1">
          Lend available volumes and record return due schedules.
        </p>

        {formError && (
          <div className="mt-3.5 p-3 bg-rose-950/50 border border-rose-900/60 rounded-xl text-rose-300 text-xs font-sans">
            ⚠️ {formError}
          </div>
        )}

        {formSuccess && (
          <div className="mt-3.5 p-3 bg-emerald-950/50 border border-emerald-900/60 rounded-xl text-emerald-300 text-xs font-sans flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleIssueBookSubmit} className="mt-4 space-y-4">
          {/* Book Dropdown Option */}
          <div>
            <label className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-1">
              Select Book Volume *
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 cursor-pointer outline-none"
            >
              <option value="">-- Choose Volume --</option>
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.availableCopies === 0}>
                  {b.title} ({b.availableCopies} left) {b.availableCopies === 0 && "[Out of Stock]"}
                </option>
              ))}
            </select>
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-1">
              Borrower Cardholder *
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full bg-slate-955/80 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 cursor-pointer outline-none"
            >
              <option value="">-- Choose Borrower --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id} disabled={m.status === "Suspended"}>
                  {m.name} ({m.role}) {m.status === "Suspended" && "[Suspended Account]"}
                </option>
              ))}
            </select>
          </div>

          {/* Due dates */}
          <div>
            <label className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-1">
              Due Date Deadline *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <CalendarDays className="h-4 w-4" />
              </span>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-955/80 border border-slate-850 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-555 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer mt-1"
          >
            Issue Books Receipt
          </button>
        </form>
      </div>

      {/* 2. Active Lending Register & Pending Requests Drawer */}
      <div className="lg:col-span-2 space-y-6">

        {/* Pending Approval Requests Section (Feature 15) */}
        <div className="space-y-3">
          <h3 className="font-sans text-xs font-bold tracking-wider text-amber-505 uppercase flex items-center gap-1.5 pl-1.5 font-semibold animate-pulse">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Online Book Issue Requests Queue ({pendingRequests.length})
          </h3>

          {pendingRequests.length === 0 ? (
            <div className="p-4 border border-slate-850 bg-slate-955/20 rounded-xl text-center text-xs text-slate-500 animate-fade-in">
              No online requests waiting for admin approval.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => {
                const requestedBook = books.find(b => b.id === req.bookId);
                const isOutOfStock = requestedBook ? requestedBook.availableCopies < 1 : true;

                return (
                  <div key={req.id} className="p-4 bg-gradient-to-r from-slate-955/60 to-slate-900/35 border border-amber-550/30 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-955 text-amber-400 font-mono font-bold border border-amber-900/40">
                          AWAITING DESK APPROVAL
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">RFID CARD No: {req.memberId}</span>
                      </div>
                      <h4 className="font-sans font-bold text-white text-sm">
                        Requesting: {req.bookTitle}
                      </h4>
                      <p className="font-sans text-xs text-slate-400">
                        Student Patron: <strong className="text-slate-200">{req.memberName}</strong> (Requested on: {req.issueDate})
                      </p>
                    </div>

                    <div className="flex gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleRejectPendingRequest(req.id)}
                        className="px-2.5 py-1.5 border border-slate-850 hover:bg-rose-955/40 hover:text-rose-400 text-slate-400 rounded-lg text-xs font-semibold cursor-pointer transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleApprovePendingRequest(req.id)}
                        disabled={isOutOfStock}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow hover:scale-105 ${
                          isOutOfStock 
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white"
                        }`}
                      >
                        Approve & Issue
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="font-sans text-xs font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5 pl-1.5 animate-fade-in">
            <RotateCcw className="h-3.5 w-3.5 text-orange-400" />
            Active Lending Transaction Register ({activeIssues.length})
          </h3>

          {activeIssues.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 bg-slate-950/10 rounded-2xl animate-fade-in">
              <UserCheck className="h-10 w-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No books are currently borrowed from shelves.</p>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              {activeIssues.map((issue) => {
                const systemTime = new Date("2026-05-26T19:36:09Z").getTime();
                const dueTime = new Date(`${issue.dueDate}T17:00:00Z`).getTime();
                const isOverdue = dueTime - systemTime < 0;
                
                // Computes overdue rates past 2026-05-26
                const calculateFine = (dueDateStr: string): number => {
                  const due = new Date(dueDateStr);
                  const now = new Date("2026-05-26");
                  if (now > due) {
                    const diffTime = Math.abs(now.getTime() - due.getTime());
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays * 10; // ₹10 per day late return fine (Feature 17)
                  }
                  return 0;
                };

                const fine = calculateFine(issue.dueDate);
                
                return (
                  <div
                    key={issue.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-slate-900/40 border border-slate-800 hover:border-slate-750 rounded-xl transition duration-300 gap-4 hover:bg-slate-900/60"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9.5px] px-2 py-0.5 rounded font-mono font-bold tracking-wide uppercase ${
                          isOverdue
                            ? "bg-rose-955/60 text-rose-450 border border-rose-800/40 shadow text-rose-455 font-bold"
                            : "bg-emerald-950/50 text-emerald-400 border border-emerald-905/35"
                        }`}>
                          {isOverdue ? "Overdue" : "Issued"}
                        </span>
                        <h4 className="font-sans text-xs text-slate-400 text-[11.5px]">
                          Cardholder: <span className="font-bold text-white pr-1 text-[11.5px]">{issue.memberName}</span>
                          (Ref RFID: <span className="font-mono text-amber-400 font-bold">{issue.memberId.toUpperCase()}</span>)
                        </h4>
                      </div>
                      
                      <h3 className="font-sans text-sm font-semibold text-white line-clamp-1">
                        {issue.bookTitle}
                      </h3>
    
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono flex-wrap">
                        <span>Lent Date: {issue.issueDate}</span>
                        <span className={`flex items-center gap-1 ${isOverdue ? "text-rose-450 font-semibold" : ""}`}>
                          <AlertCircle className="h-3.5 w-3.5 inline" />
                          Due Date: {issue.dueDate}
                        </span>
                        {isOverdue && fine > 0 && (
                          <span className="text-[10px] px-2 py-0.5 font-bold bg-rose-500/10 text-rose-400 border border-rose-550/20 rounded-lg">
                            Overdue fine: ₹{fine}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleReturnBook(issue.id)}
                      className="flex-shrink-0 px-4 py-2 bg-slate-850 hover:bg-emerald-950/50 border border-slate-700/60 hover:border-emerald-600/30 text-xs text-slate-300 hover:text-emerald-400 font-semibold rounded-xl tracking-wide transition cursor-pointer self-start md:self-center hover:scale-105"
                    >
                      Check In Return
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Historic return desk records section */}
        {returnedIssues.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <h4 className="font-sans text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2.5 pl-1.5">
              Archived Transactions checkins
            </h4>
            <div className="max-h-[185px] overflow-y-auto space-y-1.5 opacity-65 hover:opacity-100 transition-opacity pr-1">
              {returnedIssues.slice(0, 6).map((r) => (
                <div key={r.id} className="flex justify-between items-center text-xs py-2 px-3 border border-slate-800 bg-slate-950/20 rounded-lg">
                  <span className="text-slate-300 truncate max-w-[210px] font-medium">{r.bookTitle}</span>
                  <span className="text-slate-500 font-mono text-[10px]">Returned by {r.memberName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

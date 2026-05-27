import React, { useState } from "react";
import { BookIssue, Member, LibraryLog } from "../types";
import { 
  ShieldCheck, 
  Search, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  User, 
  Calendar,
  CreditCard,
  Layers,
  ArrowRight
} from "lucide-react";

interface OnlineFinePaymentDeskProps {
  issues: BookIssue[];
  members: Member[];
  currentUser: Member | null;
  damageReports: Record<string, { type: 'Torn' | 'Damaged' | 'Lost', fee: number, resolved: boolean }>;
  systemDate: string;
  onInitiatePayment: (issueId: string, type: 'overdue' | 'damage', amount: number) => void;
  logs: LibraryLog[];
}

export default function OnlineFinePaymentDesk({
  issues,
  members,
  currentUser,
  damageReports,
  systemDate,
  onInitiatePayment,
  logs
}: OnlineFinePaymentDeskProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(currentUser?.id || "");

  // All student members
  const studentMembers = members.filter(m => m.role === "Student");

  // Get active selected member
  const activeMember = members.find(m => m.id === selectedStudentId) || currentUser;

  // Filter student members based on search term
  const filteredStudents = studentMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate overdue fines and active issues for active chosen member
  const activeMemberIssues = issues.filter(i => i.memberId === activeMember?.id && i.status !== "Returned");

  // Compute calculated values for each issue of the active member
  const processedIssues = activeMemberIssues.map(issue => {
    const systemTime = new Date(`${systemDate}T19:36:09Z`).getTime();
    const dueTime = new Date(`${issue.dueDate}T17:00:00Z`).getTime();
    const diffMs = dueTime - systemTime;
    const isOverdue = diffMs < 0;
    
    const absDiffMs = Math.abs(diffMs);
    const diffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
    const penaltyAmt = isOverdue ? diffDays * 10 : 0;
    const report = damageReports[issue.id];

    return {
      ...issue,
      isOverdue,
      daysOverdue: isOverdue ? diffDays : 0,
      penalty: penaltyAmt,
      damageReport: report
    };
  });

  // Calculate totals
  const totalOverduePenalty = processedIssues.reduce((sum, item) => sum + item.penalty, 0);
  const totalDamageFee = processedIssues.reduce((sum, item) => {
    if (item.damageReport && !item.damageReport.resolved) {
      return sum + item.damageReport.fee;
    }
    return sum;
  }, 0);

  const netDues = totalOverduePenalty + totalDamageFee;

  // Filter logs related to payment settlements
  const paymentLogs = logs.filter(l => 
    l.desc.toLowerCase().includes("paid") || 
    l.desc.toLowerCase().includes("settled") || 
    l.desc.toLowerCase().includes("fine")
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              Assam College Online Fine & Dues Desk
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Search student IDs, track overdue return limits, view penalty fine accumulations, and clear outstanding balances instantly.
            </p>
          </div>
          <span className="px-3 py-1 bg-slate-950 font-mono text-[10px] text-slate-450 border border-slate-800 rounded-lg shrink-0">
            Current Date: {systemDate}
          </span>
        </div>
      </div>

      {/* Grid: Left column (Search & Student select) | Right Column (Dues lists & Statistics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
        
        {/* Left Side: Student Selection Section */}
        <div className="lg:col-span-4 bg-slate-900/30 border border-slate-850 p-5 rounded-2xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs uppercase font-extrabold font-mono tracking-wider text-slate-300">
              Select student member
            </h3>
            <p className="text-[11px] text-slate-500">
              Verify outstanding logs by typing a name or ID of any legal student member.
            </p>
          </div>

          {/* Quick Shortcuts for testing */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">
              QUICK SELECTION HUB:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {studentMembers.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`px-3 py-2 text-xs rounded-xl flex items-center justify-between border cursor-pointer transition ${
                    activeMember?.id === student.id
                      ? "bg-white text-slate-950 border-white font-bold shadow-md"
                      : "bg-slate-950/40 border-slate-900 text-slate-300 hover:bg-slate-900/60 hover:border-slate-850"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`w-2.5 h-2.5 rounded-full ${activeMember?.id === student.id ? "bg-slate-950" : "bg-emerald-500"}`} />
                    <span className="truncate text-left">{student.name}</span>
                  </div>
                  <span className={`font-mono text-[10px] uppercase font-bold shrink-0 ${activeMember?.id === student.id ? "text-slate-650" : "text-slate-500"}`}>
                    {student.id.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name or RFID ID..."
              className="w-full bg-slate-950 text-slate-200 border border-slate-850 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-slate-700 placeholder-slate-600 font-sans"
            />
          </div>

          {searchTerm && (
            <div className="max-h-44 overflow-y-auto space-y-1 bg-slate-950 border border-slate-900 rounded-xl p-1.5">
              {filteredStudents.length === 0 ? (
                <p className="text-[10px] text-slate-600 text-center py-2">No matching students found.</p>
              ) : (
                filteredStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setSearchTerm("");
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-[11.5px] rounded-lg hover:bg-slate-900 transition flex items-center justify-between text-slate-350 hover:text-white"
                  >
                    <span>{student.name}</span>
                    <span className="text-[9px] font-mono text-slate-505 uppercase">{student.id}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {activeMember && (
            <div className="pt-2 border-t border-slate-850/60 space-y-2">
              <span className="text-[9px] font-mono text-slate-550 block uppercase">
                ACTIVE INQUIRY CARD:
              </span>
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-900 space-y-2 font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px]">NAME</span>
                  <span className="text-slate-200 font-bold text-xs">{activeMember.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px]">RFID ID</span>
                  <span className="text-slate-205 font-mono text-xs uppercase font-bold">{activeMember.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px]">EMAIL ADDRESS</span>
                  <span className="text-slate-400 text-xs truncate max-w-[140px]">{activeMember.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px]">MEMBERSHIP CARD</span>
                  <span className="font-mono text-[9px] bg-slate-900 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded font-bold uppercase">
                    {activeMember.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Account Balances & Fine Settling lists */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick statistics ledger panels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between space-y-2">
              <span className="text-[10px] text-slate-500 font-mono block leading-none uppercase">
                OVERDUE RETURN FINE
              </span>
              <h4 className="text-xl font-bold text-white font-mono leading-none">
                ₹{totalOverduePenalty.toFixed(2)}
              </h4>
              <p className="text-[9px] text-slate-500 leading-none">
                Accruing at ₹10 per delayed day.
              </p>
            </div>

            <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between space-y-2">
              <span className="text-[10px] text-slate-500 font-mono block leading-none uppercase">
                PHYSICAL COVER DAMAGES
              </span>
              <h4 className="text-xl font-bold text-white font-mono leading-none">
                ₹{totalDamageFee.toFixed(2)}
              </h4>
              <p className="text-[9px] text-slate-500 leading-none">
                Logged during returns inspection.
              </p>
            </div>

            <div className="bg-white text-slate-950 rounded-2xl p-4 border border-white flex flex-col justify-between space-y-2 shadow-lg">
              <span className="text-[10px] text-slate-600 font-mono block leading-none uppercase font-bold">
                TOTAL PAYABLE DUES
              </span>
              <h4 className="text-2xl font-black font-mono leading-none">
                ₹{netDues.toFixed(2)}
              </h4>
              <span className="text-[9px] text-slate-700 font-bold">
                {netDues > 0 ? "⚠️ PRIVILEGES PARTIALLY SEIZED" : "✓ IMMUNE GENERAL STATUS"}
              </span>
            </div>

          </div>

          {/* Dues breakdown table */}
          <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs uppercase font-extrabold font-mono tracking-wider text-slate-300">
                Outstanding Fines & Damages Log for {activeMember?.name}
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 rounded">
                {activeMemberIssues.length} Active checkouts
              </span>
            </div>

            {processedIssues.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-800 rounded-xl text-center space-y-2.5">
                <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-200">No Outstanding Debits Found</h4>
                  <p className="text-[10.5px] text-slate-500 max-w-sm mx-auto">
                    Excellent! This student currently has no book liabilities, overdue penalties, or registered damage reports in this academic semester.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {processedIssues.map((item) => {
                  const hasDamageFee = item.damageReport && !item.damageReport.resolved;
                  const itemNetDue = item.penalty + (hasDamageFee ? item.damageReport!.fee : 0);

                  return (
                    <div 
                      key={item.id} 
                      className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-3 hover:border-slate-800 transition"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white font-sans">{item.bookTitle}</span>
                            {item.isOverdue && (
                              <span className="text-[8px] font-mono font-bold bg-rose-950/80 text-rose-400 border border-rose-900/40 px-1 rounded uppercase">
                                Overdue by {item.daysOverdue} Days
                              </span>
                            )}
                            {hasDamageFee && (
                              <span className="text-[8px] font-mono font-bold bg-amber-950/80 text-amber-500 border border-amber-900/40 px-1 rounded uppercase">
                                Custom Damage: {item.damageReport?.type}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                            <div>
                              <span className="text-slate-500 block leading-none text-[8.5px] uppercase font-mono mb-0.5">ISSUE PASS</span>
                              <span className="text-slate-300 font-mono font-medium">{item.issueDate}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block leading-none text-[8.5px] uppercase font-mono mb-0.5">RETURN LIMIT</span>
                              <span className="text-slate-300 font-mono font-medium">{item.dueDate}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block leading-none text-[8.5px] uppercase font-mono mb-0.5">OVERDUE FINE</span>
                              <span className={`font-mono font-bold ${item.penalty > 0 ? "text-rose-450" : "text-slate-400"}`}>
                                ₹{item.penalty.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block leading-none text-[8.5px] uppercase font-mono mb-0.5">BOOK EXAMS</span>
                              <span className="text-slate-405 font-mono">RFID-{item.id}</span>
                            </div>
                          </div>

                          {/* Detail of damge */}
                          {hasDamageFee && (
                            <div className="p-2.5 bg-rose-950/20 border border-rose-950/40 rounded-lg flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                                <span className="text-[10.5px] text-rose-350">
                                  Physical book was found: <strong className="font-bold">{item.damageReport?.type}</strong>. Inspection penalty charged.
                                </span>
                              </div>
                              <span className="font-mono text-rose-400 font-bold">₹{item.damageReport?.fee}</span>
                            </div>
                          )}
                        </div>

                        {/* Pay Buttons */}
                        <div className="flex flex-col gap-1.5 sm:self-center shrink-0">
                          {itemNetDue > 0 ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[9px] font-mono text-slate-500">PAYABLE ITEM DUES</span>
                              <button
                                onClick={() => {
                                  // Settle specifically based on priority
                                  if (item.penalty > 0) {
                                    onInitiatePayment(item.id, 'overdue', item.penalty);
                                  } else if (hasDamageFee) {
                                    onInitiatePayment(item.id, 'damage', item.damageReport!.fee);
                                  }
                                }}
                                className="px-3 py-1.5 bg-white text-slate-950 hover:bg-slate-100 font-bold font-mono text-[10px] rounded-lg border border-slate-200 shadow hover:scale-[1.02] active:scale-95 transition cursor-pointer flex items-center justify-center gap-1 shrink-0"
                              >
                                <DollarSign className="h-3 w-3" />
                                Clear Item ₹{itemNetDue}
                              </button>
                            </div>
                          ) : (
                            <div className="text-right py-1">
                              <span className="text-[9px] font-mono text-emerald-450 font-bold block leading-none">✓ IN ORDER</span>
                              <span className="text-[10.5px] text-slate-450 font-medium">No current fines due</span>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Payment History / Ledger verification trail */}
          <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-5 space-y-3 text-left">
            <h3 className="text-xs uppercase font-extrabold font-mono tracking-wider text-slate-350">
              Recent Online Settlements & Audit logs
            </h3>
            <p className="text-[11px] text-slate-500">
              Dynamically verifying transaction signatures matching the digital ledger desk in Pub Kamrup College.
            </p>

            {paymentLogs.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-2">No fine ledger settlements logged in current sandbox uptime.</p>
            ) : (
              <div className="space-y-1.5">
                {paymentLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex justify-between items-center gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] text-slate-205 block font-medium truncate">{log.desc}</span>
                      <span className="text-[8px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-450 font-bold uppercase shrink-0">
                      [ SIGNED & CLEAR ]
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

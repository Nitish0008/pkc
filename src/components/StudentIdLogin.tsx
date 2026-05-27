/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useEffect, useState } from "react";
import { Member, ALL_DEPARTMENTS } from "../types";
import PubKamrupLogo from "./PubKamrupLogo";
import { ShieldCheck, UserPlus, KeyRound, ArrowRight, User, GraduationCap, Laptop, Sparkles, BookOpen } from "lucide-react";

interface StudentIdLoginProps {
  members: Member[];
  onLogin: (member: Member) => void;
  onRegister: (newMember: Member) => void;
}

const ADMIN_ACCOUNTS = [
  {
    id: "a1",
    name: "Alvis Khandakar (Admin)",
    displayName: "Alvis Khandakar",
    email: "alviskhandakar@gmail.com",
    cardId: "PKC-A01"
  },
  {
    id: "a2",
    name: "Risita Khandakar (Admin)",
    displayName: "Risita Khandakar",
    email: "risitakhandakar@gmail.com",
    cardId: "PKC-A02"
  },
  {
    id: "a3",
    name: "Raihan Siddique (Admin)",
    displayName: "Raihan Siddique",
    email: "raihansiddique@gmail.com",
    cardId: "PKC-A03"
  }
] as const;

export default function StudentIdLogin({ members, onLogin, onRegister }: StudentIdLoginProps) {
  const [activeMode, setActiveMode] = useState<"signin" | "signup" | "admin">("signin");
  
  // Sign In inputs
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [loginPasscode, setLoginPasscode] = useState("");
  const [signinError, setSigninError] = useState("");

  // Admin Login inputs
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPasskey, setAdminPasskey] = useState("");
  const [adminError, setAdminError] = useState("");

  // Sign Up (Card Creation) inputs
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [dept, setDept] = useState("Computer Science");
  const [signupPasscode, setSignupPasscode] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Quick Demo Fast Bypass list
  const demoMembers = members.length > 0 ? members : [
    { id: "m1", name: "Alvis Khandakar", email: "alviskhandakar2@gmail.com", role: "Student" as const, joiningDate: "2026-03-01", status: "Active" as const },
    { id: "m3", name: "Karabi Gogoi", email: "karabi.gogoi@campus.edu", role: "Student" as const, joiningDate: "2026-01-15", status: "Active" as const }
  ];
  const eligibleMembers = members.filter((m) => m.status === "Active" && m.role !== "Admin");
  const selectedMember = eligibleMembers.find((m) => m.id === selectedMemberId);
  const demoEligibleMembers = demoMembers.filter((m) => m.status === "Active" && m.role !== "Admin");
  const selectedAdminAccount = ADMIN_ACCOUNTS.find(
    (account) => account.email === adminEmail.trim().toLowerCase()
  );

  useEffect(() => {
    if (!selectedMemberId) return;
    const selectedAccount = members.find((m) => m.id === selectedMemberId);
    if (!selectedAccount || selectedAccount.status === "Suspended" || selectedAccount.role === "Admin") {
      setSelectedMemberId("");
      setSigninError("That ID card account is suspended and cannot be swiped.");
    }
  }, [members, selectedMemberId]);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSigninError("");

    if (!selectedMemberId) {
      setSigninError("Please select an ID cardholder account to swipe.");
      return;
    }

    const matched = eligibleMembers.find((m) => m.id === selectedMemberId);
    if (matched) {
      onLogin(matched);
    } else {
      setSigninError("Specified cardholder profile is suspended or could not be unlocked.");
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setSignupSuccess(false);

    if (!fullName.trim()) {
      setSignupError("Please provide the borrower's full name.");
      return;
    }
    if (!emailAddress.trim() || !emailAddress.includes("@")) {
      setSignupError("Please provide a valid institutional email address.");
      return;
    }

    // Logical creation
    const newId = `m${Date.now()}`;
    const newMemberProfile: Member = {
      id: newId,
      name: fullName.trim(),
      email: emailAddress.trim().toLowerCase(),
      role: "Student",
      joiningDate: new Date().toISOString().split("T")[0],
      status: "Active"
    };

    onRegister(newMemberProfile);
    setSignupSuccess(true);
    
    // Auto-swipe into active portal session
    setTimeout(() => {
      onLogin(newMemberProfile);
    }, 1200);
  };

  const handleAdminSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");

    const email = adminEmail.trim().toLowerCase();
    const key = adminPasskey.trim();

    if (!email) {
      setAdminError("Please enter your Admin E-mail address.");
      return;
    }
    if (!key) {
      setAdminError("Please enter your Admin Pass Key.");
      return;
    }
    if (key !== "123") {
      setAdminError("Invalid Administrator authentication pass key.");
      return;
    }

    const adminAccount = ADMIN_ACCOUNTS.find((account) => account.email === email);

    if (!adminAccount) {
      setAdminError("This email address is not registered with Administrator clearance.");
      return;
    }

    // Attempt to locate in existing database
    let adminMember = members.find((m) => m.email.toLowerCase() === email);
    if (!adminMember) {
      adminMember = {
        id: adminAccount.id,
        name: adminAccount.name,
        email: adminAccount.email,
        role: "Admin",
        joiningDate: new Date().toISOString().split("T")[0],
        status: "Active"
      };
      // Let's also trigger database save so they are in the database permanently
      onRegister(adminMember);
    }
    onLogin(adminMember);
  };

  // Helper code to map a initials for avatar previews
  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(" ");
    if (parts.length === 0 || !parts[0]) return "PK";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div id="student-auth-portal" className="min-h-screen flex flex-col items-center justify-center p-4 bg-radial from-slate-950 via-slate-950 to-emerald-950/70 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-emerald-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      {/* Main Container Cardholder Box */}
      <div className="w-full max-w-5xl bg-slate-950/40 border border-slate-900 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8 z-10 flex flex-col lg:flex-row items-center gap-10">
        
        {/* LEFT PANEL: INPUT FORM PANEL */}
        <div className="w-full lg:w-[48%] space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase">
              <Sparkles className="h-3 w-3 animate-spin" /> Campus Portal Entry
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black font-sans text-white tracking-tight leading-none mt-1">
              Pub Kamrup College
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              E-Library Gateway & Smart ID Card Registration Hub
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex flex-col sm:flex-row bg-slate-900/60 p-1 border border-slate-800 rounded-2xl gap-1">
            <button
              onClick={() => {
                setActiveMode("signin");
                setSigninError("");
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeMode === "signin"
                  ? "bg-slate-800 text-white shadow-md border-b-2 border-amber-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-400" />
              Swipe ID
            </button>
            <button
              onClick={() => {
                setActiveMode("signup");
                setSignupError("");
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeMode === "signup"
                  ? "bg-slate-800 text-white shadow-md border-b-2 border-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
              Register
            </button>
            <button
              onClick={() => {
                setActiveMode("admin");
                setAdminError("");
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeMode === "admin"
                  ? "bg-slate-800 text-white shadow-md border-b-2 border-rose-500"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-rose-450" />
              Admin Access
            </button>
          </div>

          {/* ADMIN LOGIN VIEW */}
          {activeMode === "admin" ? (
            <form onSubmit={handleAdminSignInSubmit} className="space-y-4">
              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-bold text-slate-300 font-mono tracking-wider block">
                  ADMINISTRATOR EMAIL ADDRESS
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="alviskhandakar@gmail.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-3.5 py-3 text-xs focus:outline-none placeholder-slate-600"
                  />
                  <User className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-bold text-slate-300 font-mono tracking-wider block">
                  ADMIN SECURITY KEY (123)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Enter admin password key"
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-3.5 py-3 text-xs focus:outline-none placeholder-slate-600"
                  />
                  <ShieldCheck className="absolute right-3.5 top-3.5 h-4 w-4 text-rose-500" />
                </div>
              </div>

              {adminError && (
                <div className="p-3 bg-rose-950/30 border border-rose-900/30 text-rose-400 rounded-xl text-xs font-medium leading-relaxed">
                  ⚠️ {adminError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-lg transition duration-200 uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
              >
                UNCLOAK ADMIN PANEL
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Quick test admin accounts */}
              <div className="border-t border-slate-900/60 pt-4 space-y-2">
                <p className="text-[10px] text-slate-500 font-mono font-bold tracking-wider block">
                  AUTHORIZED SYS-OP ACCESS:
                </p>
                <div className="flex flex-col gap-2">
                  {ADMIN_ACCOUNTS.map((account) => (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => {
                        setAdminEmail(account.email);
                        setAdminPasskey("123");
                      }}
                      className="px-3 py-2 bg-slate-950/40 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-300 font-mono tracking-tight transition cursor-pointer flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        <span>{account.email}</span>
                      </div>
                      <span className="text-[10px] text-rose-450 font-bold uppercase">Pass: 123</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : activeMode === "signin" ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono tracking-wider block">
                  CHOOSE REGISTERED STUDENT ID
                </label>
                <div className="relative">
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-3 text-xs font-medium focus:outline-none appearance-none cursor-pointer text-slate-200"
                  >
                    <option value="" className="bg-slate-950">--- SELECT REGISTERED MEMBERS ---</option>
                    {eligibleMembers.map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-950">
                        {m.name} ({m.role} - ID: {m.id.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-3.5 pointer-events-none text-slate-500 text-[10px] font-mono">
                    ▼
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-300 font-mono tracking-wider">
                    PIN CODE ACCESS PASS
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono italic">Optional in demo</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter virtual RFID passcode"
                    value={loginPasscode}
                    onChange={(e) => setLoginPasscode(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-3 text-xs focus:outline-none"
                  />
                  <ShieldCheck className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-600" />
                </div>
              </div>

              {signinError && (
                <div className="p-3 bg-rose-950/30 border border-rose-900/30 text-rose-400 rounded-xl text-xs font-medium leading-relaxed">
                  ⚠️ {signinError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs py-3.5 px-4 rounded-xl shadow-lg transition duration-200 uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
              >
                SWIPE SIGN-IN ID CARD
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Instant prefill tool */}
              <div className="border-t border-slate-900/60 pt-4 space-y-2">
                <p className="text-[10px] text-slate-550 font-mono font-medium block">
                  QUICK-TEST CREDENTIAL PRESETS:
                </p>
                <div className="flex flex-wrap gap-2">
                  {demoEligibleMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMemberId(m.id);
                        setLoginPasscode("8942");
                      }}
                      className="px-2.5 py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg text-[10px] text-slate-300 font-mono tracking-tight transition cursor-pointer flex items-center gap-1.5"
                    >
                      <User className="h-3 w-3 text-amber-400" />
                      {m.name.split(" ")[0]} ({m.id})
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* SIGN UP (CARD REGISTRATION) VIEW */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono tracking-wider block">
                  FULL STUDENT NAME
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alvis Khandakar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-3 text-xs focus:outline-none"
                  />
                  <User className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono tracking-wider block">
                  CAMPUS EMAIL ADDRESS
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. studentname@pubkamrup.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-3 text-xs focus:outline-none"
                  />
                  <GraduationCap className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono block">
                    DEPARTMENT BRANCH
                  </label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-3 text-xs focus:outline-none text-slate-300 cursor-pointer text-slate-200"
                  >
                    {ALL_DEPARTMENTS.map((deptName) => (
                      <option key={deptName} value={deptName} className="bg-slate-950">
                        {deptName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono block">
                    SECURITY RFID PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="e.g. 1234"
                    value={signupPasscode}
                    onChange={(e) => setSignupPasscode(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {signupError && (
                <div className="p-3 bg-rose-950/30 border border-rose-900/30 text-rose-400 rounded-xl text-xs font-medium">
                  ⚠️ {signupError}
                </div>
              )}

              {signupSuccess && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-900/30 text-emerald-300 rounded-xl text-xs font-medium">
                  🎉 ID Card Created! Swiping you in...
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs py-3.5 px-4 rounded-xl shadow-lg transition duration-200 uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
              >
                ISSUE VIRTUAL CAMPUS ID
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

        {/* RIGHT PANEL: INTERACTIVE STUDENT ID CARD PREVIEW (High Fidelity Mockup) */}
        <div className="w-full lg:w-[48%] flex flex-col items-center justify-center p-2">
          
          <p className="text-[10px] text-slate-500 font-mono tracking-widest text-center uppercase mb-3.5">
            - Real-Time Live RFID Preview -
          </p>

          <div
            id="rfid-card-view"
            className={`w-full max-w-sm h-60 rounded-3xl p-5 relative overflow-hidden border-2 shadow-2xl flex flex-col justify-between group transition-all duration-300 hover:scale-[1.03] ${
              activeMode === "admin"
                ? "bg-gradient-to-br from-slate-950 via-slate-950 to-rose-950/50 border-rose-900 hover:border-rose-500/50"
                : "bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-900/60 border-slate-800 hover:border-amber-500/30"
            }`}
          >
            {/* Gloss Highlight Glint */}
            <div className="absolute top-0 right-0 left-0 h-[40%] bg-gradient-to-b from-white/5 to-transparent skew-y-6 -translate-y-4 pointer-events-none" />
            
            {/* Hologram Circle Badge */}
            <div className={`absolute top-1/2 right-4 -translate-y-12 h-20 w-20 rounded-full border blur-[2px] flex items-center justify-center pointer-events-none ${
              activeMode === "admin"
                ? "border-rose-500/20 bg-rose-500/5"
                : "border-amber-400/20 bg-amber-400/5"
            }`}>
              <Sparkles className={`h-8 w-8 animate-pulse ${activeMode === "admin" ? "text-rose-450/25" : "text-amber-400/25"}`} />
            </div>

            {/* Smart ID Header */}
            <div className="flex justify-between items-start border-b border-emerald-950/60 pb-3 z-10">
              <div className="flex items-center gap-2">
                <PubKamrupLogo size="sm" />
                <div>
                  <h3 className="text-[11px] font-black uppercase text-white tracking-wider leading-none">
                    Pub Kamrup College
                  </h3>
                  <span className={`text-[7.5px] font-mono font-bold uppercase tracking-widest leading-none ${activeMode === "admin" ? "text-rose-400/80" : "text-amber-400/80"}`}>
                    {activeMode === "admin" ? "Administrative Master Key" : "E-Library Access Credentials"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[8px] border px-1.5 py-0.5 rounded font-mono font-black ${
                  activeMode === "admin"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}>
                  {activeMode === "admin" ? "SYS ADMIN" : "RFID 02.26"}
                </span>
              </div>
            </div>

            {/* Smart Card Content Body with golden microchip */}
            <div className="grid grid-cols-12 gap-3 py-3 items-center z-10">
              {/* Photo Placeholder */}
              <div className="col-span-4 flex justify-center">
                <div className={`h-18 w-18 rounded-2xl bg-slate-900/90 border-2 flex flex-col items-center justify-center text-slate-400 font-bold text-lg shadow-inner shadow-black relative overflow-hidden transition-colors ${
                  activeMode === "admin" ? "border-rose-500/30 group-hover:border-rose-400/50" : "border-slate-800 group-hover:border-amber-400/40"
                }`}>
                  {/* Photo avatar backdrop pattern */}
                  <div className={`absolute bottom-0 h-7 w-12 rounded-t-full flex-shrink-0 ${activeMode === "admin" ? "bg-rose-950/40" : "bg-emerald-950/40"}`} />
                  <span className="relative text-white font-mono uppercase tracking-tighter">
                    {getInitials(
                      activeMode === "admin"
                        ? (selectedAdminAccount?.displayName || "ADM")
                        : activeMode === "signin"
                          ? (selectedMember?.name || "PK")
                          : (fullName || "PK")
                    )}
                  </span>
                </div>
              </div>

              {/* Text metadata */}
              <div className="col-span-8 space-y-2">
                <div>
                  <span className="text-[7.5px] text-slate-500 font-mono block leading-none">CARDHOLDER NAME</span>
                  <p className="text-xs font-bold text-white tracking-wide truncate max-w-[180px]">
                    {activeMode === "admin"
                      ? (selectedAdminAccount?.displayName || "Authorized Administrator")
                      : activeMode === "signin"
                        ? (selectedMember?.name || "Select Card Account")
                        : (fullName || "Create New User")
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <span className="text-[7px] text-slate-500 font-mono block leading-none">ROLE</span>
                    <span className="text-[9px] font-bold text-slate-300 block truncate">
                      {activeMode === "admin" ? "Library Admin" : activeMode === "signin" ? "Campus Member" : dept}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-500 font-mono block leading-none">CARD ID</span>
                    <span className={`text-[9.5px] font-mono font-semibold block ${activeMode === "admin" ? "text-rose-400" : "text-amber-300"}`}>
                      {activeMode === "admin"
                        ? (selectedAdminAccount?.cardId || "PKC-SYS")
                        : activeMode === "signin" && selectedMemberId
                          ? selectedMemberId.toUpperCase()
                          : "PKC-[PENDING]"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Card Footer with Golden RFID Chip & Barcode */}
            <div className="flex justify-between items-center border-t border-emerald-950/65 pt-2 w-full z-10">
              {/* Golden Smart-chip visual */}
              <div className="flex items-center gap-1">
                <div className="h-5 w-6 rounded bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border border-amber-600 shadow flex flex-col justify-around p-0.5">
                  <div className="grid grid-cols-3 gap-0.5 h-full w-full opacity-60">
                    <div className="border-r border-b border-amber-700" />
                    <div className="border-r border-b border-amber-700" />
                    <div className="border-b border-amber-700" />
                    <div className="border-r border-amber-700" />
                    <div className="border-r border-amber-700" />
                    <div className="border-amber-700" />
                  </div>
                </div>
                <span className="text-[7px] font-mono text-slate-500">EXECUTIVE BYPASS</span>
              </div>

              {/* Barcode representation */}
              <div className="flex flex-col items-end">
                <div className="flex items-end gap-[1px] h-4 bg-transparent">
                  <div className="w-1 bg-slate-305 h-full" />
                  <div className="w-[0.5px] bg-slate-305 h-full" />
                  <div className="w-1 bg-slate-205 h-full" />
                  <div className="w-[1px] bg-transparent h-full" />
                  <div className="w-1.5 bg-slate-305 h-full" />
                  <div className="w-1 bg-slate-305 h-full" />
                  <div className="w-[0.5px] bg-slate-305 h-full" />
                  <div className="w-[1.5px] bg-slate-305 h-full" />
                  <div className="w-[2px] bg-slate-305 h-full" />
                  <div className="w-[0.5px] bg-slate-305 h-full" />
                </div>
                <span className="text-[6.5px] text-slate-500 font-mono tracking-tighter leading-none mt-0.5 animate-pulse">
                  *PK-{activeMode === "admin" ? "ADMIN-SECURE" : activeMode === "signin" && selectedMemberId ? selectedMemberId.toUpperCase() : "STUDENT"}*
                </span>
              </div>
            </div>

          </div>

          <div className="mt-4 flex items-center gap-2 max-w-sm">
            <ShieldCheck className="h-4 w-4 text-rose-400 flex-shrink-0 animate-scale-up" />
            <p className="text-[10px] text-slate-400 leading-normal">
              Administrative bypass logs all modifications into the PKC institutional blockchain ledger. Unverified entries face automatic suspension.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Member } from "../types";
import { Search, UserPlus, Shield, User, Mail, Calendar, Sparkles } from "lucide-react";

interface MembersListProps {
  members: Member[];
  onSaveMembers: (updatedMembers: Member[], activityDesc?: string) => void;
  onLogActivity: (type: 'add_member', desc: string) => void;
}

export default function MembersList({
  members,
  onSaveMembers,
  onLogActivity
}: MembersListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<'Student' | 'Faculty' | 'General'>("Student");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegisterMember = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim() || !email.trim()) {
      setErrorMsg("Please fill out all required form variables.");
      return;
    }

    if (!email.includes("@")) {
      setErrorMsg("Please enter a valid institution or personal email address.");
      return;
    }

    // Check duplicate email
    if (members.some(m => m.email.toLowerCase() === email.trim().toLowerCase())) {
      setErrorMsg("A library member with this email is already registered.");
      return;
    }

    const newMember: Member = {
      id: `m${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role,
      joiningDate: new Date().toISOString().split('T')[0],
      status: "Active"
    };

    onSaveMembers(
      [...members, newMember],
      `Issued library membership card standard to: ${newMember.name} (${newMember.role})`
    );
    setSuccessMsg(`${newMember.name} was added to the borrower registry.`);
    
    // Clear forms
    setName("");
    setEmail("");
    setRole("Student");
    setIsFormOpen(false);
  };

  const toggleMemberStatus = (memberId: string) => {
    const updated = members.map(m => {
      if (m.id === memberId) {
        const nextStatus: 'Active' | 'Suspended' = m.status === "Active" ? "Suspended" : "Active";
        return { ...m, status: nextStatus };
      }
      return m;
    });
    onSaveMembers(updated);
    const changedMember = updated.find(m => m.id === memberId);
    if (changedMember) {
      setErrorMsg("");
      setSuccessMsg(`${changedMember.name} is now ${changedMember.status}.`);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="members-management-module" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Registration Form Widget */}
      <div className="bg-slate-900/40 p-5 border border-slate-800 rounded-2xl backdrop-blur-md h-fit">
        <h3 className="font-sans text-sm font-bold text-white flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-emerald-400" />
          Borrower Registration Card
        </h3>
        <p className="font-sans text-xs text-slate-400 mt-1">
          Issue library card access instantly.
        </p>

        {errorMsg && (
          <div className="mt-3 p-2.5 bg-rose-950/50 border border-rose-900/60 rounded-xl text-rose-300 text-xs font-sans">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-2.5 bg-emerald-950/50 border border-emerald-900/60 rounded-xl text-emerald-300 text-xs font-sans">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegisterMember} className="mt-4 space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Full Legal Name *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <User className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alvis Khandakar"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Primary Email *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail className="h-3.5 w-3.5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alviskhandakar2@gmail.com"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Account Classification *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 cursor-pointer outline-none"
            >
              <option value="Student">Student Cardholder</option>
              <option value="Faculty">University Faculty</option>
              <option value="General">General Public Patron</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer mt-2"
          >
            Authorize Library Card
          </button>
        </form>
      </div>

      {/* Members Directory List */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search header bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <Search className="h-3.5 w-3.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search membership directories by classification, name or email indexing..."
            className="w-full bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Directory Card items */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 bg-slate-900/10 rounded-2xl">
            <User className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No member files matching that tag query.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredMembers.map((member) => {
              const isFaculty = member.role === "Faculty";
              const isStudent = member.role === "Student";
              const isSuspended = member.status === "Suspended";

              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-900/40 border border-slate-800 hover:border-slate-750 rounded-xl transition duration-300 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300 border border-slate-700">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans text-xs sm:text-sm font-bold text-white">
                          {member.name}
                        </h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-medium ${
                          isFaculty
                            ? "bg-purple-950/50 text-purple-400 border border-purple-800/40"
                            : isStudent
                            ? "bg-amber-950/50 text-amber-400 border border-amber-800/40"
                            : "bg-slate-800 text-slate-400 border border-slate-700/40"
                        }`}>
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2.5 sm:pt-0 border-t sm:border-0 border-slate-800/60">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>Joined: {member.joiningDate}</span>
                    </div>

                    <button
                      onClick={() => toggleMemberStatus(member.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition tracking-wider uppercase flex items-center gap-1 cursor-pointer ${
                        isSuspended
                          ? "bg-rose-950/65 text-rose-400 border border-rose-900/60 hover:bg-rose-900/35"
                          : "bg-emerald-950/65 text-emerald-400 border border-emerald-900/60 hover:bg-emerald-900/35"
                      }`}
                    >
                      <Shield className="h-3 w-3" />
                      {isSuspended ? "Suspended" : "Active"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

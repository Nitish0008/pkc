/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  colorClass: string; // Tailwind bg or border class
  iconColorClass: string;
}

export default function StatCard({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  iconColorClass
}: StatCardProps) {
  return (
    <div
      id={id || `stat-${title.toLowerCase().replace(/\s+/g, "-")}`}
      className={`relative overflow-hidden rounded-xl border bg-slate-900/60 p-5 backdrop-blur-md transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg border-slate-800 ${colorClass}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-sans text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {title}
          </p>
          <h3 className="mt-2 font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {value}
          </h3>
        </div>
        <div className={`rounded-xl p-3 bg-slate-800/80 ${iconColorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="mt-4 font-sans text-xs text-slate-400 font-medium">
        {subtitle}
      </p>
      
      {/* Decorative gradient corner indicator */}
      <div className="absolute right-0 bottom-0 h-8 w-8 bg-gradient-to-br from-transparent to-white/5 rounded-tl-full opacity-30" />
    </div>
  );
}

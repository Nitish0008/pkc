/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface PubKamrupLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "huge";
  animate?: boolean;
}

export default function PubKamrupLogo({ className = "", size = "md", animate = true }: PubKamrupLogoProps) {
  // Determine pixel size based on props
  const dimensions = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-24 w-24",
    xl: "h-44 w-44",
    huge: "h-64 w-64 md:h-80 md:w-80",
  }[size];

  return (
    <div
      id={`pub-kamrup-svg-logo-${size}`}
      className={`relative inline-block select-none ${dimensions} ${className}`}
    >
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full object-contain filter drop-shadow-md"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Definitions for gradients and text paths */}
        <defs>
          {/* Gold Gradient for borders and stars */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="35%" stopColor="#FFC107" />
            <stop offset="70%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#FF8F00" />
          </linearGradient>

          {/* Deep Navy Radial Background */}
          <radialGradient id="navyRadial" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          {/* Warm Flame Glow */}
          <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFECB3" stopOpacity={0.9} />
            <stop offset="40%" stopColor="#FF9800" stopOpacity={0.6} />
            <stop offset="80%" stopColor="#EF4444" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
          </radialGradient>

          {/* Top text circular path (Clockwise, semi-circle at top) */}
          <path
            id="topTextPath"
            d="M 60,250 A 190,190 0 0,1 440,250"
            fill="none"
          />

          {/* Bottom text circular path (Right-to-left along bottom, so upright) */}
          <path
            id="bottomTextPath"
            d="M 440,250 A 190,190 0 0,1 60,250"
            fill="none"
          />
        </defs>

        {/* --- Backplate Shadow --- */}
        <circle cx="250" cy="250" r="235" fill="rgba(2, 6, 23, 0.4)" />

        {/* --- Outer Laurel Leaves (Background decoration) --- */}
        <g stroke="none" fill="#4ade80" fillOpacity="0.15">
          {/* Left Laurel */}
          <path d="M 55,250 C 50,150 120,80 160,60 C 130,100 80,180 85,250 Z" />
          <path d="M 35,250 C 30,150 100,80 140,60 C 110,100 60,180 65,250 Z" />
          {/* Right Laurel */}
          <path d="M 445,250 C 450,150 380,80 340,60 C 370,100 420,180 415,250 Z" />
          <path d="M 465,250 C 470,150 400,80 360,60 C 390,100 440,180 435,250 Z" />
        </g>

        {/* Golden Stem and Leaf outlines */}
        <g stroke="url(#goldGradient)" strokeWidth="2" fill="none" opacity="0.6">
          <path d="M 75,300 C 50,220 70,130 130,70" />
          <path d="M 425,300 C 450,220 430,130 370,70" />
        </g>

        {/* Leaf details */}
        <g fill="url(#goldGradient)" opacity="0.8">
          {/* Left leaves */}
          <path d="M 70,120 Q 55,100 75,95 Q 85,105 70,120" />
          <path d="M 85,160 Q 65,145 85,135 Q 95,145 85,160" />
          <path d="M 100,200 Q 80,190 95,175 Q 110,185 100,200" />
          <path d="M 115,240 Q 95,235 110,215 Q 125,225 115,240" />
          {/* Right leaves */}
          <path d="M 430,120 Q 445,100 425,95 Q 415,105 430,120" />
          <path d="M 415,160 Q 435,145 415,135 Q 405,145 415,160" />
          <path d="M 400,200 Q 420,190 405,175 Q 390,185 400,200" />
          <path d="M 385,240 Q 405,235 390,215 Q 375,225 385,240" />
        </g>

        {/* --- Core Circular Band --- */}
        <circle cx="250" cy="250" r="215" fill="url(#navyRadial)" stroke="url(#goldGradient)" strokeWidth="6" />
        <circle cx="250" cy="250" r="185" fill="none" stroke="url(#goldGradient)" strokeWidth="2.5" strokeDasharray="6,4" opacity="0.8" />
        <circle cx="250" cy="250" r="180" fill="none" stroke="url(#goldGradient)" strokeWidth="2" opacity="0.9" />

        {/* --- Gold Stars --- */}
        <g fill="url(#goldGradient)">
          {/* Left Star */}
          <polygon points="65,240 70,245 78,245 72,250 74,258 65,253 56,258 58,250 52,245 60,245" />
          {/* Right Star */}
          <polygon points="435,240 440,245 448,245 442,250 444,258 435,253 426,258 428,250 422,245 430,245" />
        </g>

        {/* --- Curved Typography --- */}
        {/* Top Text: PUB KAMRUP E-LIBRARY */}
        <text className="font-sans font-black tracking-[0.16em] text-white fill-white text-[25px]">
          <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
            PUB KAMRUP E-LIBRARY
          </textPath>
        </text>

        {/* Bottom Text: KNOWLEDGE AT YOUR FINGERTIPS */}
        <text className="font-sans font-bold tracking-[0.18em] fill-[#FFE082] text-[15.5px]">
          <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
            KNOWLEDGE AT YOUR FINGERTIPS
          </textPath>
        </text>

        {/* Inner core circle boundary */}
        <circle cx="250" cy="250" r="135" fill="#030712" fillOpacity="0.5" stroke="url(#goldGradient)" strokeWidth="3" />

        {/* --- Inner Details: Traditional Oil Diya Lamp & Seal --- */}
        <g transform="translate(0, -6)">
          {/* Traditional Decorative Radial Rays */}
          <circle cx="250" cy="180" r="38" fill="url(#flameGlow)" className={animate ? "animate-pulse" : ""} />
          
          <g stroke="url(#goldGradient)" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" fill="none">
            <line x1="250" y1="130" x2="250" y2="210" />
            <line x1="210" y1="180" x2="290" y2="180" />
            <line x1="220" y1="150" x2="280" y2="210" />
            <line x1="220" y1="210" x2="280" y2="150" />
          </g>

          {/* Golden cog / flower seal behind diaper */}
          <circle cx="250" cy="180" r="28" fill="#1e1b4b" stroke="url(#goldGradient)" strokeWidth="1.5" />
          
          {/* Indian/Assamese Oil Lamp Diya Stand */}
          <path
            d="M 235,190 C 235,178 265,178 265,190 C 265,198 235,198 235,190 Z"
            fill="url(#goldGradient)"
            stroke="#92400e"
            strokeWidth="1"
          />
          {/* Diya stem support */}
          <path
            d="M 246,191 L 244,204 L 256,204 L 254,191 Z"
            fill="url(#goldGradient)"
          />
          {/* Diya bottom plate base */}
          <path
            d="M 232,204 C 232,201 268,201 268,204 C 268,207 232,207 232,204 Z"
            fill="url(#goldGradient)"
            stroke="#92400e"
            strokeWidth="0.5"
          />

          {/* Glowing Animated Diya Flame */}
          <path
            d="M 250,165 C 243,176 250,183 250,183 C 250,183 257,176 250,165 Z"
            fill="#f97316"
          >
            {animate && (
              <animate
                attributeName="d"
                values="M 250,165 C 243,176 250,183 250,183 C 250,183 257,176 250,165 Z;
                        M 250,160 C 241,175 249,183 250,183 C 251,183 259,175 250,160 Z;
                        M 250,165 C 245,177 251,183 250,183 C 249,183 255,177 250,165 Z"
                dur="1.8s"
                repeatCount="indefinite"
              />
            )}
          </path>
          <path
            d="M 250,169 C 246,177 250,182 250,182 C 250,182 254,177 250,169 Z"
            fill="#facc15"
          >
            {animate && (
              <animate
                attributeName="opacity"
                values="1;0.8;1"
                dur="1s"
                repeatCount="indefinite"
              />
            )}
          </path>
        </g>

        {/* --- Books Column (Left-hand side) --- */}
        <g transform="translate(100, 240) scale(0.6)">
          {/* Base shadow */}
          <rect x="0" y="110" width="160" height="15" rx="5" fill="rgba(2,6,23,0.5)" filter="blur(2px)" />

          {/* Assamese Literature Book */}
          <g>
            <path d="M 12,90 L 140,90 L 148,103 L 20,103 Z" fill="#7f1d1d" stroke="#ef4444" strokeWidth="0.5" />
            <rect x="20" y="103" width="128" height="14" rx="1" fill="#991b1b" />
            {/* White pages */}
            <rect x="15" y="105" width="5" height="10" fill="#f1f5f9" />
            <text x="35" y="112" fill="#fca5a5" className="font-mono text-[8px] font-bold tracking-tight">ASSAMESE</text>
          </g>

          {/* General Knowledge Book */}
          <g transform="translate(0, -18)">
            <path d="M 10,90 L 142,90 L 150,103 L 18,103 Z" fill="#7c2d12" stroke="#f97316" strokeWidth="0.5" />
            <rect x="18" y="103" width="132" height="14" rx="1" fill="#ea580c" />
            {/* White pages */}
            <rect x="13" y="105" width="5" height="10" fill="#f1f5f9" />
            <text x="32" y="112" fill="#ffedd5" className="font-mono text-[8.5px] font-bold tracking-tight">GENERAL GK</text>
          </g>

          {/* Arts Book */}
          <g transform="translate(0, -36)">
            <path d="M 8,90 L 144,90 L 152,103 L 16,103 Z" fill="#065f46" stroke="#10b981" strokeWidth="0.5" />
            <rect x="16" y="103" width="136" height="14" rx="1" fill="#0f766e" />
            {/* White pages */}
            <rect x="11" y="105" width="5" height="10" fill="#f1f5f9" />
            <text x="50" y="112" fill="#ccfbf1" className="font-sans text-[9px] font-bold tracking-wider">ARTS</text>
          </g>

          {/* Science Book */}
          <g transform="translate(0, -54)">
            <path d="M 6,90 L 146,90 L 154,103 L 14,103 Z" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="0.5" />
            <rect x="14" y="103" width="140" height="14" rx="1" fill="#1d4ed8" />
            {/* White pages */}
            <rect x="9" y="105" width="5" height="10" fill="#f1f5f9" />
            <text x="45" y="112" fill="#dbeafe" className="font-sans text-[9px] font-bold tracking-wider">SCIENCE</text>
          </g>
        </g>

        {/* --- Central Device / Opened Laptop Presentation --- */}
        <g transform="translate(142, 280) scale(0.85)">
          {/* Laptop display back */}
          <rect x="25" y="10" width="166" height="102" rx="8" fill="#1e293b" stroke="url(#goldGradient)" strokeWidth="1.5" />
          {/* Laptop screen inner */}
          <rect x="31" y="16" width="154" height="90" fill="#090d16" />

          {/* Open textbook rendering inside the screen */}
          <path d="M 36,92 C 70,102 100,75 108,24 M 180,92 C 146,102 116,75 108,24" fill="none" stroke="url(#goldGradient)" strokeWidth="1.5" />
          
          <path d="M 36,92 C 70,102 100,75 108,24 L 108,22 C 100,73 70,100 36,90 Z" fill="#fdba74" opacity="0.15" />
          <path d="M 180,92 C 146,102 116,75 108,24 L 108,22 C 116,73 146,100 180,90 Z" fill="#fdba74" opacity="0.15" />

          {/* Book left page */}
          <path d="M 38,22 C 65,30 90,26 104,24 L 104,88 C 90,90 65,94 38,86 Z" fill="#ffffff" />
          {/* Book right page */}
          <path d="M 178,22 C 151,30 126,26 112,24 L 112,88 C 126,90 151,94 178,86 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />

          {/* Center page separator binding */}
          <line x1="108" y1="21" x2="108" y2="89" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Inside Page Details: "PUB KAMRUP E-LIBRARY" */}
          <text x="71" y="42" fill="#0f172a" className="font-serif text-[8.5px] font-bold" textAnchor="middle">PUB KAMRUP</text>
          <text x="71" y="55" fill="#1e3a8a" className="font-sans text-[9.5px] font-black tracking-tighter" textAnchor="middle">E-LIBRARY</text>
          
          <line x1="48" y1="62" x2="94" y2="62" stroke="#94a3b8" strokeWidth="0.5" />
          <line x1="48" y1="68" x2="94" y2="68" stroke="#cbd5e1" strokeWidth="0.5" />
          <line x1="48" y1="74" x2="84" y2="74" stroke="#cbd5e1" strokeWidth="0.5" />

          {/* Inside Page text right: "Read • Learn • Grow" */}
          <text x="145" y="44" fill="#030712" className="font-serif text-[9px] italic" textAnchor="middle">Read</text>
          <circle cx="145" cy="50" r="1.5" fill="#f97316" />
          <text x="145" y="62" fill="#030712" className="font-serif text-[9px] italic" textAnchor="middle">Learn</text>
          <circle cx="145" cy="68" r="1.5" fill="#f97316" />
          <text x="145" y="80" fill="#030712" className="font-serif text-[9px] italic" textAnchor="middle">Grow</text>

          {/* Laptop keyboard palm rest base */}
          <path d="M 21,112 C 21,112 11,122 25,122 L 191,122 C 205,122 195,112 195,112 Z" fill="#475569" stroke="url(#goldGradient)" strokeWidth="1" />
          {/* Base front lip lip */}
          <rect x="25" y="121" width="166" height="3" fill="#0f172a" rx="1.5" />
        </g>

        {/* --- E-Reader Tablet (Right-hand side) --- */}
        <g transform="translate(244, 252) scale(0.6)">
          {/* Base tablet frame shadow */}
          <rect x="180" y="88" width="80" height="12" rx="4" fill="rgba(2,6,23,0.5)" filter="blur(1px)" />

          {/* Device border */}
          <rect x="180" y="10" width="76" height="106" rx="6" fill="#0f172a" stroke="url(#goldGradient)" strokeWidth="1.5" />
          {/* Screen */}
          <rect x="185" y="15" width="66" height="96" fill="#1e293b" />
          
          {/* Text replication bookmark banner */}
          <path d="M 233,15 L 233,38 L 243,30 L 253,38 L 253,15 Z" fill="#1d4ed8" />

          {/* Electronic lines representing ebook content */}
          <line x1="193" y1="35" x2="225" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="193" y1="45" x2="245" y2="45" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="193" y1="53" x2="245" y2="53" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="193" y1="61" x2="245" y2="61" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="193" y1="69" x2="245" y2="69" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="193" y1="77" x2="228" y2="77" stroke="#94a3b8" strokeWidth="1" />
          <line x1="193" y1="85" x2="218" y2="85" stroke="#f97316" strokeWidth="1.5" />
        </g>

        {/* --- Golden Base Scroll Book Marker --- */}
        <path
          d="M 120,410 C 180,418 320,418 380,410 C 390,420 380,432 380,432 C 320,425 180,425 120,432 C 120,432 110,420 120,410 Z"
          fill="url(#goldGradient)"
          opacity="0.9"
        />

        {/* Dot separators at the absolute bottom coordinates */}
        <circle cx="232" cy="445" r="3.5" fill="url(#goldGradient)" />
        <circle cx="250" cy="445" r="5" fill="#fff" />
        <circle cx="268" cy="445" r="3.5" fill="url(#goldGradient)" />
      </svg>
    </div>
  );
}

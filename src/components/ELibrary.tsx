/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Book } from "../types";
import { BookOpen, ZoomIn, ZoomOut, Type, ArrowLeft, ArrowRight, BookMarked, Layers, Search, Sparkles } from "lucide-react";
import PubKamrupLogo from "./PubKamrupLogo";

interface ELibraryProps {
  books: Book[];
}

export default function ELibrary({ books }: ELibraryProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [textSize, setTextSize] = useState<"xs" | "sm" | "base" | "lg" | "xl">("base");
  const [filterGenre, setFilterGenre] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter out books that have digital reading excerpts populated
  const digitalBooks = books.filter((b) => b.digitalExcerpt && b.digitalExcerpt.length > 0);

  // Derive unique categories/genres
  const genres = ["All", ...Array.from(new Set(digitalBooks.map((b) => b.genre)))];

  const filteredDigitalBooks = digitalBooks.filter((book) => {
    const matchesGenre = filterGenre === "All" || book.genre === filterGenre;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const handleOpenBook = (book: Book) => {
    setSelectedBook(book);
    setActivePageIdx(0);
  };

  const handleCloseBook = () => {
    setSelectedBook(null);
  };

  const nextPage = () => {
    if (selectedBook && activePageIdx < (selectedBook.digitalExcerpt?.length || 1) - 1) {
      setActivePageIdx((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (activePageIdx > 0) {
      setActivePageIdx((prev) => prev - 1);
    }
  };

  // Class mapping for simulated book sizing zoom levels
  const zoomClasses = {
    sm: "max-w-md",
    base: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  };

  // Class mapping for text sizing levels
  const textSizeClasses = {
    xs: "text-xs leading-relaxed",
    sm: "text-sm leading-relaxed",
    base: "text-base leading-relaxed",
    lg: "text-lg md:text-xl leading-relaxed",
    xl: "text-xl md:text-2xl leading-loose",
  };

  return (
    <div id="e-library-portal" className="space-y-6">
      
      {!selectedBook ? (
        <div className="space-y-6">
          {/* Section banner */}
          <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900/40 p-6 border border-emerald-950/40 rounded-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <PubKamrupLogo size="md" />
                Pub Kamrup E-Library Locker
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Demonstrated decentralized reading anytime. Access high-resolution digital copies across Science, Arts, General Knowledge, and local Assamese Literature archives of Pub Kamrup College. Includes interactive pagination & reading bookmarks.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono font-bold tracking-wide">
                {digitalBooks.length} VOLUMES AVAILABLE ONLINE
              </span>
            </div>
          </div>

          {/* Filtering navigation headers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-550" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search online textbook reserves..."
                className="w-full bg-slate-900/40 border border-slate-800 rounded-xl py-2 px-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="bg-slate-900/40 border border-slate-800 text-xs rounded-xl py-2 px-3 text-slate-300 pointer cursor-pointer"
            >
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g === "All" ? "All Online Categories" : g}
                </option>
              ))}
            </select>
          </div>

          {/* Catalog grid */}
          {filteredDigitalBooks.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 bg-slate-900/10 rounded-2xl">
              <p className="text-xs text-slate-500">No online book editions available matching these query conditions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredDigitalBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-slate-900/30 border border-slate-800/80 hover:border-emerald-500/40 rounded-xl p-4 flex flex-col justify-between transition duration-300 hover:shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex gap-2.5">
                      <div className={`w-8 h-12 rounded border shadow-sm ${book.coverColor} flex-shrink-0 flex items-center justify-center font-mono font-bold text-xs`}>
                        {book.title.charAt(0)}
                      </div>
                      <div>
                        <span className="text-[9px] px-1.5 py-0.5 font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 rounded uppercase font-bold">
                          {book.genre}
                        </span>
                        <h4 className="font-sans text-xs sm:text-sm font-bold text-white line-clamp-1 mt-1">
                          {book.title}
                        </h4>
                        <p className="text-xs text-slate-400">{book.author}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 bg-slate-950/20 px-2 py-1.5 rounded-lg border border-slate-900">
                      <span>Pages: {book.pagesCount || 300} pages</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="h-3 w-3 animate-pulse" /> E-Read Enabled
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenBook(book)}
                    className="w-full mt-4 py-2 bg-emerald-650 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="h-3.5 w-3.5" /> Close-up Reader
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Immersive virtual paper page reader workspace */
        <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
          {/* Header Action controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 border border-slate-800 rounded-xl shadow-lg">
            
            <button
              onClick={handleCloseBook}
              className="flex items-center gap-1.5 text-xs text-slate-450 hover:text-white transition bg-slate-950/40 border border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer self-start sm:self-auto font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Library Shelf
            </button>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 border border-slate-800 rounded-lg p-0.5 bg-slate-950/40">
                <button
                  onClick={() => setZoomLevel(zoomLevel === "xl" ? "lg" : zoomLevel === "lg" ? "base" : "sm")}
                  title="Zoom Out Document Width"
                  className="p-1 px-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-mono text-slate-400 capitalize px-1">{zoomLevel} Width</span>
                <button
                  onClick={() => setZoomLevel(zoomLevel === "sm" ? "base" : zoomLevel === "base" ? "lg" : "xl")}
                  title="Zoom In Document Width"
                  className="p-1 px-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Font Sizing */}
              <div className="flex items-center gap-1 border border-slate-800 rounded-lg p-0.5 bg-slate-950/40">
                <button
                  onClick={() => setTextSize(textSize === "xl" ? "lg" : textSize === "lg" ? "base" : textSize === "base" ? "sm" : "xs")}
                  title="Decrease Text Scent Block"
                  className="p-1 px-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono"
                >
                  <Type className="h-3 w-3 inline mr-0.5" />A-
                </button>
                <span className="text-[10px] font-mono text-slate-400 capitalize px-1">{textSize} Font</span>
                <button
                  onClick={() => setTextSize(textSize === "xs" ? "sm" : textSize === "sm" ? "base" : textSize === "base" ? "lg" : "xl")}
                  title="Increase Text Font Scent"
                  className="p-1 px-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono"
                >
                  <Type className="h-3 w-3 inline mr-0.5" />A+
                </button>
              </div>
            </div>

          </div>

          {/* Virtual Simulated physical binding cover pages */}
          <div className="flex flex-col items-center">
            <div className={`w-full ${zoomClasses[zoomLevel]} transition-all duration-300`}>
              
              {/* Virtual Spine Spine paper layer */}
              <div className="relative border border-slate-800/80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 rounded-2xl shadow-2xl p-6 sm:p-10 text-slate-350 select-text">
                
                {/* Paper texture mockup overlay style */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-5 rounded-2xl pointer-events-none" />

                {/* Spine representation line */}
                <div className="absolute top-0 bottom-0 left-4 sm:left-6 w-[2px] bg-gradient-to-r from-slate-800/90 to-transparent pointer-events-none border-l border-slate-950" />

                {/* Watermark of University */}
                <div className="absolute right-8 top-8 opacity-5">
                  <BookOpen className="h-28 w-28 text-slate-100" />
                </div>

                {/* Top header navigation */}
                <div className="flex justify-between items-center text-[10px] font-mono uppercase text-slate-500 tracking-widest border-b border-slate-850 pb-4 mb-6">
                  <span>{selectedBook.title}</span>
                  <span>{selectedBook.genre} Catalog Reference</span>
                </div>

                {/* Excerpt reader viewport */}
                <div className="min-h-[280px] font-serif text-slate-200">
                  <p className={`${textSizeClasses[textSize]} leading-relaxed whitespace-pre-wrap`}>
                    {(selectedBook.digitalExcerpt && selectedBook.digitalExcerpt[activePageIdx]) || "The manuscript is loading..."}
                  </p>
                </div>

                {/* Footer simulation layout */}
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 tracking-wider pt-6 mt-8 border-t border-slate-850">
                  <span className="flex items-center gap-1">
                    <BookMarked className="h-3 w-3 text-emerald-400" /> Progress Saved Automatically
                  </span>
                  <span>
                    Simulated Page {activePageIdx + 1} of {selectedBook.digitalExcerpt?.length || 1}
                  </span>
                </div>

              </div>

              {/* Dynamic Reading progress bar helper */}
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3.5 border border-slate-850">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((activePageIdx + 1) / (selectedBook.digitalExcerpt?.length || 1)) * 100}%` }}
                />
              </div>

            </div>
          </div>

          {/* Reader Pagination Row */}
          <div className="flex items-center justify-between bg-slate-900 p-4 border border-slate-800 rounded-xl max-w-xl mx-auto mt-4">
            <button
              disabled={activePageIdx === 0}
              onClick={prevPage}
              className="px-3.5 py-1.5 flex items-center gap-1 bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-30 rounded-lg text-xs font-semibold cursor-pointer border border-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Previous Page
            </button>
            <span className="text-xs font-mono text-slate-400">
              Page {activePageIdx + 1} / {selectedBook.digitalExcerpt?.length || 1}
            </span>
            <button
              disabled={activePageIdx === (selectedBook.digitalExcerpt?.length || 1) - 1}
              onClick={nextPage}
              className="px-3.5 py-1.5 flex items-center gap-1 bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-30 rounded-lg text-xs font-semibold cursor-pointer border border-slate-800"
            >
              Next Page <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

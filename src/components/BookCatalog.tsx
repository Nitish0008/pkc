/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Book, BookIssue, Member, ALL_DEPARTMENTS } from "../types";
import { Search, Plus, Filter, Edit2, Trash2, MapPin, Hash, Sparkles, BookOpen } from "lucide-react";

interface BookCatalogProps {
  books: Book[];
  activeIssues: BookIssue[];
  currentUser?: Member | null;
  onIssueRequest?: (bookId: string) => void;
  onSaveBooks: (updatedBooks: Book[]) => void;
  onLogActivity: (type: 'add_book' | 'edit_book' | 'delete_book', desc: string) => void;
  selectedGenre?: string;
  setSelectedGenre?: (genre: string) => void;
}

const COVER_STYLES = [
  { name: "Emerald Forest", class: "bg-emerald-950 text-emerald-200 border-emerald-800" },
  { name: "Sage Jade", class: "bg-teal-950 text-teal-200 border-teal-800" },
  { name: "Crimson Scholar", class: "bg-rose-950 text-rose-200 border-rose-800" },
  { name: "Warm Amber", class: "bg-amber-950 text-amber-200 border-amber-800" },
  { name: "Teal Memoir", class: "bg-teal-950 text-teal-200 border-teal-800" },
  { name: "Oceanic Cyan", class: "bg-cyan-950 text-cyan-200 border-cyan-800" },
  { name: "Midnight Violet", class: "bg-violet-950 text-violet-200 border-violet-800" },
  { name: "Charcoal Slate", class: "bg-slate-900 text-slate-200 border-slate-700" }
];

export default function BookCatalog({
  books,
  activeIssues,
  currentUser,
  onIssueRequest,
  onSaveBooks,
  onLogActivity,
  selectedGenre: propsSelectedGenre,
  setSelectedGenre: propsSetSelectedGenre
}: BookCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelectedGenre, setLocalSelectedGenre] = useState("All");

  const selectedGenre = propsSelectedGenre !== undefined ? propsSelectedGenre : localSelectedGenre;
  const setSelectedGenre = propsSetSelectedGenre !== undefined ? propsSetSelectedGenre : setLocalSelectedGenre;
  const isAdmin = currentUser && currentUser.role === "Admin";
  
  // Modal tracking
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formGenre, setFormGenre] = useState("");
  const [formIsbn, setFormIsbn] = useState("");
  const [formTotalCopies, setFormTotalCopies] = useState<number>(3);
  const [formShelfLocation, setFormShelfLocation] = useState("");
  const [formCoverColor, setFormCoverColor] = useState(COVER_STYLES[0].class);
  const [formError, setFormError] = useState("");

  // Extract unique genres for category selector
  const genres = ["All", ...ALL_DEPARTMENTS];


  // Map active copies to ensure we don't allow delete/issues that break physics
  const getBorrowedCount = (bookId: string) => {
    return activeIssues.filter((i) => i.bookId === bookId && i.status !== "Returned").length;
  };

  const handleOpenAddModal = () => {
    setEditingBookId(null);
    setFormTitle("");
    setFormAuthor("");
    setFormGenre("Computer Science");
    setFormIsbn(`978${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setFormTotalCopies(3);
    setFormShelfLocation("Aisle 4, Shelf A");
    setFormCoverColor(COVER_STYLES[Math.floor(Math.random() * COVER_STYLES.length)].class);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBookId(book.id);
    setFormTitle(book.title);
    setFormAuthor(book.author);
    setFormGenre(book.genre);
    setFormIsbn(book.isbn);
    setFormTotalCopies(book.totalCopies);
    setFormShelfLocation(book.shelfLocation);
    setFormCoverColor(book.coverColor);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAuthor.trim() || !formGenre.trim() || !formShelfLocation.trim()) {
      setFormError("Please fill out all required properties.");
      return;
    }

    if (formTotalCopies < 1) {
      setFormError("Library book requires at least 1 total physical copy.");
      return;
    }

    if (editingBookId) {
      // Edit mode
      const alreadyBorrowed = getBorrowedCount(editingBookId);
      if (formTotalCopies < alreadyBorrowed) {
        setFormError(`Cannot decrease total stock count below current borrowed amount of ${alreadyBorrowed} copies.`);
        return;
      }

      const updated = books.map((b) => {
        if (b.id === editingBookId) {
          const availableDiff = formTotalCopies - b.totalCopies;
          return {
            ...b,
            title: formTitle.trim(),
            author: formAuthor.trim(),
            genre: formGenre.trim(),
            isbn: formIsbn.trim(),
            totalCopies: formTotalCopies,
            availableCopies: Math.max(0, b.availableCopies + availableDiff),
            shelfLocation: formShelfLocation.trim(),
            coverColor: formCoverColor
          };
        }
        return b;
      });

      onSaveBooks(updated);
      onLogActivity("edit_book", `Catalog volume revised: "${formTitle.trim()}"`);
    } else {
      // Create mode
      const newBook: Book = {
        id: `b${Date.now()}`,
        title: formTitle.trim(),
        author: formAuthor.trim(),
        genre: formGenre.trim(),
        isbn: formIsbn.trim() || String(Math.floor(Math.random() * 10000000)),
        totalCopies: formTotalCopies,
        availableCopies: formTotalCopies,
        shelfLocation: formShelfLocation.trim(),
        coverColor: formCoverColor
      };

      onSaveBooks([...books, newBook]);
      onLogActivity("add_book", `Catalog expanded: "${newBook.title}" by ${newBook.author}`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteBook = (bookId: string, title: string) => {
    const activeBorrows = getBorrowedCount(bookId);
    if (activeBorrows > 0) {
      alert(`Cannot withdraw "${title}" from the catalog because ${activeBorrows} copies are currently lent out.`);
      return;
    }

    if (confirm(`Are you sure you want to completely withdraw "${title}" from our inventory registers?`)) {
      const remaining = books.filter((b) => b.id !== bookId);
      onSaveBooks(remaining);
      onLogActivity("delete_book", `Withdrew catalog item: "${title}"`);
    }
  };

  // Filter & Search computation
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
    
    return matchesSearch && matchesGenre;
  });

  return (
    <div id="catalog-management-module" className="space-y-6">
      
      {/* Search and control filter panel */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/40 p-4 border border-slate-800 rounded-xl backdrop-blur-md">
        <div className="relative w-full md:w-3/5">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by catalog title, primary author, or universal ISBN sequence..."
            className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex w-full md:w-auto items-center gap-2">
          {/* Genre selector */}
          <div className="relative flex-1 md:flex-none">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <Filter className="h-3.5 w-3.5" />
            </span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs rounded-xl py-2.5 pl-9 pr-8 text-slate-300 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer outline-none w-full appearance-none"
            >
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g === "All" ? "All Genres" : g}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Volume
            </button>
          )}
        </div>
      </div>

      {/* Grid listing books */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 bg-slate-900/10 rounded-2xl">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-sans text-sm font-bold text-slate-300">No Catalog Matches</h3>
          <p className="font-sans text-xs text-slate-500 mt-1 max-w-md mx-auto">
            We couldn't locate any volumes carrying those prompt keywords. Add a new book index above to expand inventory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const borrowedCount = getBorrowedCount(book.id);
            const isOutOfStock = book.availableCopies === 0;

            return (
              <div
                key={book.id}
                className="group relative flex flex-col justify-between bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg backdrop-blur-md"
              >
                <div>
                  {/* Spine Header Style Design */}
                  <div className="flex gap-3 mb-4">
                    {/* Spine Cover Block representation */}
                    <div className={`w-8 h-12 rounded border shadow-sm ${book.coverColor} flex-shrink-0 flex items-center justify-center font-mono font-bold text-xs`}>
                      {book.title.charAt(0)}
                    </div>
                    <div>
                      <span className="inline-block text-[9px] font-mono tracking-wider font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/50 text-emerald-400 mb-1">
                        {book.genre}
                      </span>
                      <h3 className="font-sans text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {book.title}
                      </h3>
                      <p className="font-sans text-xs text-slate-400 mt-0.5">by {book.author}</p>
                    </div>
                  </div>

                  {/* Metadata and shelf specifications */}
                  <div className="space-y-2 my-4 pt-1 border-t border-slate-850">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 inline text-slate-600" />
                      <span>{book.shelfLocation}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Hash className="h-3 w-3 inline text-slate-600" />
                      <span className="font-mono">ISBN: {book.isbn}</span>
                    </div>
                  </div>
                </div>

                {/* Stock levels and Action Buttons wrapper */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${isOutOfStock ? "bg-rose-500" : "bg-emerald-500"}`} />
                      <p className="text-xs text-slate-300 font-sans font-semibold">
                        {book.availableCopies} available <span className="text-slate-500 font-normal">/ {book.totalCopies} total</span>
                      </p>
                    </div>
                    {borrowedCount > 0 && (
                      <span className="text-[10px] bg-slate-800/50 text-slate-400 px-1.5 py-0.5 rounded mt-1 inline-block border border-slate-700/35">
                        {borrowedCount} copies currently out on active issues
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onIssueRequest && currentUser && (
                      <button
                        onClick={() => onIssueRequest(book.id)}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? "Out of physical copies" : "Request this book for counter pickup"}
                        className={`px-2.5 py-1.5 rounded-lg font-sans font-bold text-[10.5px] border cursor-pointer transition flex items-center gap-1 shadow-sm hover:scale-[1.02] ${
                          isOutOfStock 
                            ? "border-slate-850 bg-slate-950/50 text-slate-500 cursor-not-allowed"
                            : "border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-600 hover:text-white"
                        }`}
                      >
                        <Sparkles className="h-3 w-3 text-emerald-400 group-hover:animate-pulse" />
                        Request Pickup
                      </button>
                    )}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(book)}
                          title="Edit Catalog Details"
                          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id, book.title)}
                          title="Withdraw Volume"
                          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-rose-950/40 hover:border-rose-900/50 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Purpose Add / Edit Dialog Floating Overlay Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-lg overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
            
            {/* Modal header accent */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700" />
            
            <div className="p-6">
              <h2 className="font-sans text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-400" />
                {editingBookId ? "Edit Catalog Item Record" : "Add New Volume Record"}
              </h2>
              <p className="font-sans text-xs text-slate-400 mt-1">
                Establish catalog schemas to help student query matching modules.
              </p>

              {formError && (
                <div className="mt-4 p-3 bg-rose-950/50 border border-rose-900/60 rounded-xl text-rose-300 text-xs font-sans">
                  ⚠️ {formError}
                </div>
              )}

              <form onSubmit={handleSaveBook} className="mt-5 space-y-4">
                {/* Book Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Structure and Interpretation of Computer Programs"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                {/* Grid Author & Genre */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">
                      Author Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      placeholder="e.g. Gerald Jay Sussman"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">
                      Category Genre *
                    </label>
                    <select
                      value={formGenre}
                      onChange={(e) => setFormGenre(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-300 focus:border-emerald-500 cursor-pointer outline-none"
                    >
                      {ALL_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Shelf Location and ISBN */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">
                      Universal ISBN *
                    </label>
                    <input
                      type="text"
                      required
                      value={formIsbn}
                      onChange={(e) => setFormIsbn(e.target.value)}
                      placeholder="e.g. 9780262510874"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">
                      Shelf Layout / Rack *
                    </label>
                    <input
                      type="text"
                      required
                      value={formShelfLocation}
                      onChange={(e) => setFormShelfLocation(e.target.value)}
                      placeholder="e.g. Aisle 4, Shelf C"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Copy Count and Cosmetic Spine Layout Color switcher */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">
                      Total Copies *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formTotalCopies}
                      onChange={(e) => setFormTotalCopies(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">
                      Cosmetic Deck Accent
                    </label>
                    <select
                      value={formCoverColor}
                      onChange={(e) => setFormCoverColor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-2.5 text-xs text-slate-300 focus:border-emerald-500 cursor-pointer outline-none"
                    >
                      {COVER_STYLES.map((c, idx) => (
                        <option key={idx} value={c.class}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cancel Save actions block */}
                <div className="flex gap-2.5 justify-end pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

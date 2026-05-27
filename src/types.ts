/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string; // e.g., "Aisle 3, Shelf B"
  coverColor: string;    // CSS Tailwind color class for virtual cover display
  digitalExcerpt?: string[]; // Interactive pages for online e-reading emulation
  pagesCount?: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Faculty' | 'General' | 'Admin';
  joiningDate: string;
  status: 'Active' | 'Suspended';
}

export interface BookIssue {
  id: string;
  bookId: string;
  bookTitle: string;
  memberId: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Issued' | 'Returned' | 'Overdue' | 'Pending Approval' | 'Rejected';
  rejectReason?: string;
}

export interface LibraryLog {
  id: string;
  type: 'issue' | 'return' | 'add_book' | 'edit_book' | 'add_member' | 'delete_book';
  desc: string;
  timestamp: string;
}

export interface LibraryData {
  books: Book[];
  members: Member[];
  issues: BookIssue[];
  logs: LibraryLog[];
}

export const ALL_DEPARTMENTS = [
  "Assamese",
  "Botany",
  "Bio-Physics",
  "BBA",
  "BCA",
  "Chemistry",
  "Computer Science",
  "Economics",
  "Education",
  "Software Developement and System Administration",
  "English",
  "Geography",
  "History",
  "Mathematics",
  "Philosophy",
  "Physics",
  "Political Science",
  "Statistics",
  "Zoology",
  "Food Processing and Quality Management"
];


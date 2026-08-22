import type { CategoryDefinition, CondoDocument } from "../types/document";
export const categories: CategoryDefinition[] = [
  { id: "management", title: "Management Certificate", shortTitle: "Management", description: "Current recorded association and management information." },
  { id: "dedicatory", title: "Dedicatory Instruments", shortTitle: "Dedicatory", description: "Governing documents, declarations, bylaws, and rules." },
  { id: "minutes", title: "Meeting Minutes", shortTitle: "Meeting Minutes", description: "Official records from association board meetings." },
  { id: "financial", title: "Financial Statements", shortTitle: "Financial", description: "Annual financial reports and association statements." },
  { id: "notices", title: "Community Notices", shortTitle: "Notices", description: "Important notices and community guidance." },
];
export const documents: CondoDocument[] = [
  { id: "management-certificate-2026", title: "Management Certificate — Recorded May 2026", category: "management", fileName: "management-certificate-2026.pdf", fileUrl: "#document", year: 2026, updatedAt: "2026-05-18", fileType: "PDF" },
  { id: "declaration", title: "Declaration of Condominium", category: "dedicatory", fileName: "declaration-of-condominium.pdf", fileUrl: "#document", year: 1987, updatedAt: "2026-02-12", fileType: "PDF" },
  { id: "articles", title: "Articles of Incorporation", category: "dedicatory", fileName: "articles-of-incorporation.pdf", fileUrl: "#document", year: 1987, updatedAt: "2026-02-12", fileType: "PDF" },
  { id: "bylaws", title: "Association By-Laws", category: "dedicatory", fileName: "association-bylaws.pdf", fileUrl: "#document", year: 2004, updatedAt: "2026-02-12", fileType: "PDF" },
  { id: "rules", title: "Rules & Regulations", category: "dedicatory", fileName: "rules-and-regulations.pdf", fileUrl: "#document", year: 2025, updatedAt: "2026-03-04", fileType: "PDF" },
  { id: "minutes-july-2026", title: "July 2026 Board Meeting Minutes", category: "minutes", fileName: "board-minutes-july-2026.pdf", fileUrl: "#document", year: 2026, updatedAt: "2026-08-07", fileType: "PDF" },
  { id: "minutes-april-2026", title: "April 2026 Board Meeting Minutes", category: "minutes", fileName: "board-minutes-april-2026.pdf", fileUrl: "#document", year: 2026, updatedAt: "2026-05-09", fileType: "PDF" },
  { id: "minutes-january-2026", title: "January 2026 Board Meeting Minutes", category: "minutes", fileName: "board-minutes-january-2026.pdf", fileUrl: "#document", year: 2026, updatedAt: "2026-02-08", fileType: "PDF" },
  { id: "financial-2025", title: "2025 Annual Financial Statement", category: "financial", fileName: "annual-financial-statement-2025.pdf", fileUrl: "#document", year: 2025, updatedAt: "2026-03-15", fileType: "PDF" },
  { id: "financial-2024", title: "2024 Annual Financial Statement", category: "financial", fileName: "annual-financial-statement-2024.pdf", fileUrl: "#document", year: 2024, updatedAt: "2025-03-18", fileType: "PDF" },
  { id: "financial-2023", title: "2023 Annual Financial Statement", category: "financial", fileName: "annual-financial-statement-2023.pdf", fileUrl: "#document", year: 2023, updatedAt: "2024-03-11", fileType: "PDF" },
  { id: "annual-meeting-2026", title: "2026 Annual Meeting Notice", category: "notices", fileName: "annual-meeting-notice-2026.pdf", fileUrl: "#document", year: 2026, updatedAt: "2026-06-20", fileType: "PDF" },
  { id: "parking-guidelines", title: "Community Parking Guidelines", category: "notices", fileName: "community-parking-guidelines.pdf", fileUrl: "#document", year: 2026, updatedAt: "2026-04-02", fileType: "PDF" },
];

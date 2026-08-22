export type DocumentCategory = "management" | "dedicatory" | "minutes" | "financial" | "notices";
export interface CondoDocument { id: string; title: string; category: DocumentCategory; fileName: string; fileUrl: string; year: number; updatedAt: string; fileType: "PDF"; }
export interface CategoryDefinition { id: DocumentCategory; title: string; shortTitle: string; description: string; }

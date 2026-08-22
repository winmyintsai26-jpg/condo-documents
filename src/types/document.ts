export interface CategoryDefinition { id: string; name: string; slug: string; shortName: string; description: string; position: number; }
export interface CondoDocument { id: string; title: string; categoryId: string; category: CategoryDefinition; fileName: string; fileUrl: string; year: number; updatedAt: string; fileType: "PDF"; fileSize: number; published: boolean; }
export interface LibraryResponse { categories: CategoryDefinition[]; documents: CondoDocument[]; }

export interface Category {
 id: number;
 name: string;
 description?: string;
 slug: string;
 parentId?: number | null;
 level?: number;
 children?: Category[];
 imageUrl?: string;
 isActive: boolean;
}

export interface CategoryHierarchy {
 id: number;
 name: string;
 slug: string;
 subcategories: CategoryHierarchy[];
} 
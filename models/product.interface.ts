
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  image?: string;
  category: string;
  categoryId?: number;
  brand: string;
  stock: number;
  rating: number;
  reviews: number;
  reviewCount: number;
  featured?: boolean;
  isActive?: boolean;
  slug?: string;
  discount?: number;
  discountedPrice?: number;
  specifications?: { [key: string]: string };
  createdAt: Date;
  updatedAt: Date;
}  
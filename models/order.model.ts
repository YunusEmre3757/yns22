export interface Order {
  id: number;
  orderNumber: string;
  date: Date;
  totalPrice: number;
  status: string;
  items: OrderItem[];
  address: string;
  trackingNumber?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  image: string;
} 
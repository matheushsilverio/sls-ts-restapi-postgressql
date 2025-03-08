export interface Order {
  orderId: string;
  userId: string;
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  status:
    | 'RECEIVED'
    | 'IN_PREPARATION'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED';
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

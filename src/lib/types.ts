export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description?: string | null;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  userId: string;
  type: 'add' | 'remove';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  timestamp: Date;
}

export interface InventoryMetrics {
  totalSkus: number;
  totalQuantity: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue?: number;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

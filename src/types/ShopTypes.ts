// 인터페이스 정의
// Spring에선 Sales테이블
export interface ShopOption {
  size: string;
  color: string;
  other: string;
}

export interface ShopBenefit {
  description: string;
  amount: number;
}

export interface ShopShipping {
  type: string;
  freeShipping: boolean;
  courier: string;
  islandAdditionalFee: number;
}

export interface ShopDiscount {
  grade: string;
  discountRate: number;
}

export interface ProductRequest {
  id: number;
  name: string;
  price: number;
  fileURLs: string[];
  shipping: string;
  manufacturer: string;
  brand: string;
  condition: string;
  origin: string;
  createdAt: string;
  options: ShopOption[];
  benefits: ShopBenefit[];
  shippingInfo: ShopShipping[];
  discounts: ShopDiscount[];
}

export interface StoreCart {
  title: string;
  size: string;
  quantity: number;
  price: number;
  username: string;
  totalPrice: number;
  color: string;
  img: string;
}

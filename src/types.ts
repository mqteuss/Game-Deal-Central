export interface GameDeal {
  id: string;
  title: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  store: string;
  platform: string;
  url: string;
  expiresAt?: string;
}


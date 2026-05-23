export interface GameDeal {
  id: string;
  gameID: string;
  title: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  store: string;
  storeIcon: string;
  platform: string;
  url: string;
  expiresAt?: string;
  metacriticScore?: string;
  steamRatingPercent?: string;
  steamRatingText?: string | null;
  steamRatingCount?: string | null;
  releaseDate?: number;
  dealRating?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  deal_id: string;
  game_id: string | null;
  title: string;
  message: string;
  type: 'price_drop';
  old_price: number | null;
  new_price: number | null;
  discount_percentage: number | null;
  store: string | null;
  store_icon: string | null;
  url: string | null;
  is_read: boolean;
  created_at: string;
}

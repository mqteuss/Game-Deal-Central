export interface Store {
  storeID: string;
  storeName: string;
  isActive: number;
  images: {
    banner: string;
    logo: string;
    icon: string;
  };
}

export interface Deal {
  internalName: string;
  title: string;
  metacriticLink: string;
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale: string;
  savings: string;
  metacriticScore: string;
  steamRatingText: string | null;
  steamRatingPercent: string;
  steamRatingCount: string;
  steamAppID: string | null;
  releaseDate: number;
  lastChange: number;
  dealRating: string;
  thumb: string;
}

const BASE_URL = 'https://www.cheapshark.com/api/1.0';

export async function getStores(signal?: AbortSignal): Promise<Store[]> {
  const response = await fetch(`${BASE_URL}/stores`, { signal });
  if (!response.ok) {
    throw new Error('Failed to fetch stores');
  }
  return response.json();
}

export interface GetDealsParams {
  storeID?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'Deal Rating' | 'Title' | 'Savings' | 'Price' | 'Metacritic' | 'Reviews' | 'Release' | 'Store' | 'Recent';
  desc?: boolean;
  lowerPrice?: number;
  upperPrice?: number;
  title?: string;
  onSale?: boolean;
  metacritic?: number;
  steamRating?: number;
}

function serializeParam(value: string | number | boolean): string {
  if (typeof value === 'boolean') return value ? '1' : '0';
  return value.toString();
}

export async function getDeals(params: GetDealsParams = {}, signal?: AbortSignal): Promise<Deal[]> {
  const url = new URL(`${BASE_URL}/deals`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, serializeParam(value));
    }
  });

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error('Failed to fetch deals');
  }
  return response.json();
}

export interface GameDetails {
  info: {
    title: string;
    steamAppID: string | null;
    thumb: string;
  };
  cheapestPriceEver: {
    price: string;
    date: number;
  };
  deals: Array<{
    storeID: string;
    dealID: string;
    price: string;
    retailPrice: string;
    savings: string;
  }>;
}

export async function getGameDetails(gameID: string, signal?: AbortSignal): Promise<GameDetails> {
  const response = await fetch(`${BASE_URL}/games?id=${encodeURIComponent(gameID)}`, { signal });
  if (!response.ok) {
    throw new Error('Failed to fetch game details');
  }
  return response.json();
}

export interface GameSuggestion {
  gameID: string;
  steamAppID: string | null;
  cheapest: string;
  cheapestDealID: string;
  external: string;
  internalName: string;
  thumb: string;
}

export async function getGameSuggestions(title: string, signal?: AbortSignal): Promise<GameSuggestion[]> {
  if (!title || title.trim().length === 0) return [];
  const response = await fetch(`${BASE_URL}/games?title=${encodeURIComponent(title)}&limit=5`, { signal });
  if (!response.ok) {
    throw new Error('Failed to fetch game suggestions');
  }
  return response.json();
}

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 60,
};

type HeaderValue = string | string[] | undefined;

interface ApiRequest {
  method?: string;
  headers: Record<string, HeaderValue>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
}

interface MonitoredGameRow {
  user_id: string;
  deal_id: string;
  game_id: string;
  title: string;
  discounted_price: number | null;
  original_price: number | null;
  store: string | null;
  store_icon: string | null;
  url: string | null;
}

interface CheapSharkStore {
  storeID: string;
  storeName: string;
  images: {
    icon: string;
  };
}

interface CheapSharkDealLookup {
  gameInfo?: {
    storeID: string;
    gameID: string;
    name: string;
    salePrice: string;
    retailPrice: string;
    steamRatingText: string | null;
    steamRatingPercent: string;
    steamRatingCount: string;
    metacriticScore: string;
    releaseDate: number;
    thumb: string;
  };
}

const CHEAPSHARK_BASE_URL = 'https://www.cheapshark.com/api/1.0';
const DEFAULT_SUPABASE_URL = 'https://mlidiusmrrbnmykjgqob.supabase.co';
const BRL_FALLBACK_RATE = 5;

function getHeader(headers: Record<string, HeaderValue>, name: string) {
  const value = headers[name] ?? headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function isAuthorized(req: ApiRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return process.env.VERCEL_ENV !== 'production';
  }

  const auth = getHeader(req.headers, 'authorization');
  const token = getHeader(req.headers, 'x-cron-secret');
  return auth === `Bearer ${secret}` || token === secret;
}

function toNumber(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

async function fetchExchangeRate() {
  try {
    const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
    if (!response.ok) return BRL_FALLBACK_RATE;
    const data = await response.json();
    const rate = toNumber(data?.USDBRL?.ask);
    return rate && rate > 0 ? rate : BRL_FALLBACK_RATE;
  } catch {
    return BRL_FALLBACK_RATE;
  }
}

async function fetchStores() {
  const response = await fetch(`${CHEAPSHARK_BASE_URL}/stores`);
  if (!response.ok) return new Map<string, CheapSharkStore>();

  const stores = (await response.json()) as CheapSharkStore[];
  return new Map(stores.map(store => [store.storeID, store]));
}

async function fetchDeal(dealId: string) {
  const response = await fetch(`${CHEAPSHARK_BASE_URL}/deals?id=${dealId}`);
  if (!response.ok) return null;

  const data = (await response.json()) as CheapSharkDealLookup;
  return data.gameInfo ? data : null;
}

async function fetchAllMonitoredGames(supabase: SupabaseClient) {
  const rows: MonitoredGameRow[] = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('monitored_games')
      .select('user_id, deal_id, game_id, title, discounted_price, original_price, store, store_icon, url')
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    rows.push(...(data as MonitoredGameRow[]));
    if (data.length < pageSize) break;
  }

  return rows;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const [monitoredGames, exchangeRate, stores] = await Promise.all([
      fetchAllMonitoredGames(supabase),
      fetchExchangeRate(),
      fetchStores(),
    ]);

    if (monitoredGames.length === 0) {
      res.status(200).json({
        ok: true,
        monitoredGames: 0,
        checkedDeals: 0,
        notificationsCreated: 0,
      });
      return;
    }

    const maxDeals = Number(process.env.CRON_MAX_DEALS || 80);
    const uniqueDealIds = [...new Set(monitoredGames.map(game => game.deal_id))].slice(0, maxDeals);
    const dealLookups = new Map<string, CheapSharkDealLookup>();

    for (const dealId of uniqueDealIds) {
      const lookup = await fetchDeal(dealId);
      if (lookup) dealLookups.set(dealId, lookup);
    }

    const notifications = [];
    let updatedRows = 0;

    for (const game of monitoredGames) {
      const lookup = dealLookups.get(game.deal_id);
      const gameInfo = lookup?.gameInfo;
      if (!gameInfo) continue;

      const salePriceUsd = toNumber(gameInfo.salePrice);
      const retailPriceUsd = toNumber(gameInfo.retailPrice);
      const oldPrice = toNumber(game.discounted_price);
      if (salePriceUsd === null || retailPriceUsd === null || oldPrice === null) continue;

      const newPrice = Number((salePriceUsd * exchangeRate).toFixed(2));
      const originalPrice = Number((retailPriceUsd * exchangeRate).toFixed(2));
      const discountPercentage = retailPriceUsd > 0
        ? Math.max(0, Math.round(((retailPriceUsd - salePriceUsd) / retailPriceUsd) * 100))
        : 0;
      const store = stores.get(gameInfo.storeID);
      const storeIcon = store ? `https://www.cheapshark.com${store.images.icon}` : game.store_icon;
      const storeName = store?.storeName || game.store;
      const url = `https://www.cheapshark.com/redirect?dealID=${game.deal_id}`;

      if (newPrice + 0.01 < oldPrice) {
        const priceInCents = Math.round(newPrice * 100);
        notifications.push({
          user_id: game.user_id,
          deal_id: game.deal_id,
          game_id: gameInfo.gameID || game.game_id,
          title: gameInfo.name || game.title,
          message: `${gameInfo.name || game.title} caiu de ${formatBRL(oldPrice)} para ${formatBRL(newPrice)}.`,
          type: 'price_drop',
          old_price: oldPrice,
          new_price: newPrice,
          discount_percentage: discountPercentage,
          store: storeName,
          store_icon: storeIcon,
          url,
          dedupe_key: `price_drop:${game.user_id}:${game.deal_id}:${priceInCents}`,
        });
      }

      const { error: updateError } = await supabase
        .from('monitored_games')
        .update({
          game_id: gameInfo.gameID || game.game_id,
          title: gameInfo.name || game.title,
          image_url: gameInfo.thumb || null,
          original_price: originalPrice,
          discounted_price: newPrice,
          discount_percentage: discountPercentage,
          store: storeName,
          store_icon: storeIcon,
          url,
          metacritic_score: gameInfo.metacriticScore,
          steam_rating_percent: gameInfo.steamRatingPercent,
          steam_rating_text: gameInfo.steamRatingText,
          steam_rating_count: gameInfo.steamRatingCount,
          release_date: gameInfo.releaseDate,
        })
        .eq('user_id', game.user_id)
        .eq('deal_id', game.deal_id);

      if (!updateError) updatedRows += 1;
    }

    if (notifications.length > 0) {
      const { error } = await supabase
        .from('notifications')
        .upsert(notifications, { onConflict: 'dedupe_key', ignoreDuplicates: true });

      if (error) throw error;
    }

    res.status(200).json({
      ok: true,
      monitoredGames: monitoredGames.length,
      checkedDeals: uniqueDealIds.length,
      updatedRows,
      notificationsCreated: notifications.length,
      exchangeRate,
    });
  } catch (error) {
    console.error('check-price-alerts failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

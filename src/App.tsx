import { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GameCard } from './components/GameCard';
import { Frown, Loader2 } from 'lucide-react';
import { getDeals, getStores, Deal, Store as ApiStore } from './services/cheapshark';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedMinPrice, setDebouncedMinPrice] = useState('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');

  const [deals, setDeals] = useState<Deal[]>([]);
  const [apiStores, setApiStores] = useState<ApiStore[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch stores and exchange rate on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [fetchedStores, rateRes] = await Promise.all([
          getStores(),
          fetch('https://economia.awesomeapi.com.br/last/USD-BRL').catch(() => null)
        ]);
        
        setApiStores(fetchedStores);

        if (rateRes && rateRes.ok) {
          const rateData = await rateRes.json();
          setExchangeRate(parseFloat(rateData.USDBRL.ask));
        } else {
          setExchangeRate(5.0);
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        setExchangeRate(5.0);
      }
    };

    fetchInitialData();
  }, []);

  // Debounce filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, minPrice, maxPrice]);

  // Reset pagination when filters change
  useEffect(() => {
    setPageNumber(0);
    setDeals([]);
    setHasMore(true);
    setError(null);
  }, [debouncedSearch, selectedStores, debouncedMinPrice, debouncedMaxPrice]);

  // Fetch deals
  useEffect(() => {
    if (exchangeRate === 0) return;

    const fetchDeals = async () => {
      try {
        if (pageNumber === 0) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const params: any = { onSale: true, pageSize: 60, pageNumber };
        
        if (debouncedSearch) params.title = debouncedSearch;
        if (selectedStores.length > 0) params.storeID = selectedStores.join(',');
        
        if (debouncedMinPrice) {
          params.lowerPrice = Math.max(0, parseFloat(debouncedMinPrice) / exchangeRate);
        }
        if (debouncedMaxPrice) {
          params.upperPrice = parseFloat(debouncedMaxPrice) / exchangeRate;
        }

        const nextDeals = await getDeals(params);
        
        setDeals(prev => {
          if (pageNumber === 0) return nextDeals;
          const existingIds = new Set(prev.map(d => d.dealID));
          const newDeals = nextDeals.filter(d => !existingIds.has(d.dealID));
          return [...prev, ...newDeals];
        });
        
        setHasMore(nextDeals.length === 60);
      } catch (err) {
        if (pageNumber === 0) {
          setError('Falha ao carregar as ofertas. Tente novamente mais tarde.');
        }
        console.error('Failed to load deals:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchDeals();
  }, [pageNumber, debouncedSearch, selectedStores, debouncedMinPrice, debouncedMaxPrice, exchangeRate]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          setPageNumber(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore]);

  const availableStores = useMemo(() => {
    return apiStores
      .filter(s => s.isActive === 1)
      .map(s => ({ id: s.storeID, name: s.storeName }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [apiStores]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col font-sans selection:bg-emerald-500/30">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        toggleSidebar={toggleSidebar}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 pt-16 md:pt-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar 
            availableStores={availableStores}
            selectedStores={selectedStores}
            setSelectedStores={setSelectedStores}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                {searchQuery ? `Resultados para "${searchQuery}"` : 'Ofertas em Destaque'}
              </h2>
              <span className="text-zinc-400 text-sm font-medium bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                {deals.length} {deals.length === 1 ? 'jogo carregado' : 'jogos carregados'}
              </span>
            </div>

            {isLoading && pageNumber === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-zinc-400">Buscando as melhores ofertas...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-red-500/10 p-6 rounded-full mb-6 border border-red-500/20">
                  <Frown size={48} className="text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Ops! Algo deu errado</h3>
                <p className="text-zinc-400 max-w-md">{error}</p>
              </div>
            ) : (
              <>
                {deals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {deals.map(deal => {
                      const storeObj = availableStores.find(s => s.id === deal.storeID);
                      return (
                        <GameCard 
                          key={deal.dealID} 
                          deal={{
                            id: deal.dealID,
                            title: deal.title,
                            imageUrl: deal.thumb,
                            originalPrice: parseFloat(deal.normalPrice) * exchangeRate,
                            discountedPrice: parseFloat(deal.salePrice) * exchangeRate,
                            discountPercentage: Math.round(parseFloat(deal.savings)),
                            store: storeObj ? storeObj.name : 'Desconhecida',
                            platform: 'PC',
                            url: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`
                          }} 
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-zinc-900 p-6 rounded-full mb-6 border border-zinc-800">
                      <Frown size={48} className="text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Nenhum jogo encontrado</h3>
                    <p className="text-zinc-400 max-w-md">
                      Não encontramos nenhuma oferta que corresponda aos seus filtros atuais. Tente remover alguns filtros ou buscar por outro termo.
                    </p>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedStores([]);
                        setMinPrice('');
                        setMaxPrice('');
                      }}
                      className="mt-6 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Limpar todos os filtros
                    </button>
                  </div>
                )}

                {/* Infinite Scroll Observer Target */}
                {hasMore && deals.length > 0 && (
                  <div ref={observerTarget} className="w-full py-12 flex justify-center items-center">
                    {isLoadingMore ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        <span className="text-sm text-zinc-500">Carregando mais ofertas...</span>
                      </div>
                    ) : (
                      <div className="h-8 w-full" />
                    )}
                  </div>
                )}
                
                {!hasMore && deals.length > 0 && (
                  <div className="w-full py-12 flex justify-center">
                    <p className="text-zinc-500 font-medium">Você chegou ao fim das ofertas.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

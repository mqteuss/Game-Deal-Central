import React from 'react';

interface SidebarProps {
  availableStores: { id: string, name: string }[];
  selectedStores: string[];
  setSelectedStores: React.Dispatch<React.SetStateAction<string[]>>;
  minPrice: string;
  setMinPrice: React.Dispatch<React.SetStateAction<string>>;
  maxPrice: string;
  setMaxPrice: React.Dispatch<React.SetStateAction<string>>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  availableStores,
  selectedStores,
  setSelectedStores,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}) => {
  
  const toggleStore = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  return (
    <aside className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col gap-8 h-full overflow-y-auto">
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Preço (R$)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            min="0"
          />
          <span className="text-zinc-500">-</span>
          <input
            type="number"
            placeholder="Máx"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            min="0"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Lojas Disponíveis</h3>
        <div className="flex flex-col gap-3">
          {availableStores.map(store => (
            <div 
              key={store.id} 
              onClick={() => toggleStore(store.id)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                selectedStores.includes(store.id) 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : 'border-zinc-600 group-hover:border-zinc-400 bg-zinc-800'
              }`}>
                {selectedStores.includes(store.id) && (
                  <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${selectedStores.includes(store.id) ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                {store.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};


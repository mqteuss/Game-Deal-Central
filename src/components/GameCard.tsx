import React from 'react';
import { GameDeal } from '../types';
import { ExternalLink, Tag, Star, ThumbsUp, Eye, EyeOff } from 'lucide-react';

interface GameCardProps {
  deal: GameDeal;
  isMonitored?: boolean;
  onToggleMonitor?: (deal: GameDeal) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ deal, isMonitored = false, onToggleMonitor }) => {
  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800 transition-transform hover:-translate-y-1 hover:shadow-xl hover:border-zinc-700 flex flex-col h-full relative">
      <div className="relative">
        <img 
          src={deal.imageUrl} 
          alt={deal.title} 
          className="w-full h-40 object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 right-2 bg-emerald-500 text-black font-bold px-2 py-1 rounded-md text-sm">
          -{deal.discountPercentage}%
        </div>
        {onToggleMonitor && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleMonitor(deal);
            }}
            className={`absolute top-2 left-2 p-2 rounded-full transition-colors ${
              isMonitored 
                ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                : 'bg-black/50 text-zinc-300 hover:bg-black/70 hover:text-white'
            }`}
            aria-label={isMonitored ? "Parar de monitorar" : "Monitorar jogo"}
            title={isMonitored ? "Parar de monitorar" : "Monitorar jogo"}
          >
            {isMonitored ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">{deal.title}</h3>
        
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-zinc-400">
          <span className="bg-zinc-800 px-2 py-1 rounded-md">{deal.platform}</span>
          <span className="bg-zinc-800 px-2 py-1 rounded-md flex items-center gap-1">
            <Tag size={12} />
            {deal.store}
          </span>
          {deal.metacriticScore && deal.metacriticScore !== '0' && (
            <span className="bg-zinc-800 px-2 py-1 rounded-md flex items-center gap-1 text-yellow-500" title="Metacritic Score">
              <Star size={12} className="fill-yellow-500" />
              {deal.metacriticScore}
            </span>
          )}
          {deal.steamRatingPercent && deal.steamRatingPercent !== '0' && (
            <span className="bg-zinc-800 px-2 py-1 rounded-md flex items-center gap-1 text-blue-400" title={`Steam Rating: ${deal.steamRatingText}`}>
              <ThumbsUp size={12} />
              {deal.steamRatingPercent}%
            </span>
          )}
        </div>
        
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-zinc-500 line-through text-sm">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.originalPrice)}
            </span>
            <span className="text-2xl font-bold text-emerald-400">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.discountedPrice)}
            </span>
          </div>
          
          <a 
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
            aria-label={`Get deal for ${deal.title}`}
          >
            <ExternalLink size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};

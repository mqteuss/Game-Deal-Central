import React from 'react';
import { GameDeal } from '../types';
import { ExternalLink, Tag } from 'lucide-react';

interface GameCardProps {
  deal: GameDeal;
}

export const GameCard: React.FC<GameCardProps> = ({ deal }) => {
  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800 transition-transform hover:-translate-y-1 hover:shadow-xl hover:border-zinc-700 flex flex-col h-full">
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
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">{deal.title}</h3>
        
        <div className="flex items-center gap-2 mb-4 text-xs text-zinc-400">
          <span className="bg-zinc-800 px-2 py-1 rounded-md">{deal.platform}</span>
          <span className="bg-zinc-800 px-2 py-1 rounded-md flex items-center gap-1">
            <Tag size={12} />
            {deal.store}
          </span>
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
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
            aria-label={`Get deal for ${deal.title}`}
          >
            <ExternalLink size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};

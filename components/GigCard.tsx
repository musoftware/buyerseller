
import React from 'react';
import { Star, Heart } from 'lucide-react';
import { Gig, User } from '../types';
import { MOCK_USERS } from '../constants';
import { Link } from 'react-router-dom';

interface GigCardProps {
  gig: Gig;
}

const GigCard: React.FC<GigCardProps> = ({ gig }) => {
  const seller = MOCK_USERS[gig.sellerId] || MOCK_USERS['u1'];

  return (
    <div className="bg-white border rounded-lg overflow-hidden flex flex-col group hover:shadow-lg transition-shadow duration-200">
      <Link to={`/gig/${gig.id}`}>
        <div className="relative aspect-[1.5/1] overflow-hidden">
          <img 
            src={gig.thumbnail} 
            alt={gig.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart size={16} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <img src={seller.avatar} className="w-6 h-6 rounded-full" />
          <div>
            <span className="text-xs font-semibold block">{seller.name}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Level 2 Seller</span>
          </div>
        </div>

        <Link to={`/gig/${gig.id}`} className="hover:underline text-gray-700 font-medium line-clamp-2 mb-3 h-10 leading-tight">
          {gig.title}
        </Link>

        <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span>{gig.rating}</span>
          <span className="text-gray-400 font-normal">({gig.reviewCount})</span>
        </div>

        <div className="mt-auto pt-3 border-t flex justify-between items-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Starting at</span>
          <span className="text-lg font-bold text-gray-900">EGP {gig.startingPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default GigCard;

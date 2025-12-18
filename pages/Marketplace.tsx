
import React, { useState } from 'react';
import { MOCK_GIGS, CATEGORIES } from '../constants';
import GigCard from '../components/GigCard';
import { SlidersHorizontal, ChevronDown, LayoutGrid, List } from 'lucide-react';

const Marketplace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGigs = MOCK_GIGS.filter(gig => {
    const matchesCategory = activeCategory === 'All' || gig.category === activeCategory;
    const matchesPrice = gig.startingPrice >= priceRange[0] && gig.startingPrice <= priceRange[1];
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Breadcrumbs */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {activeCategory === 'All' ? 'Discover Services' : activeCategory}
        </h1>
        <p className="text-gray-500">Find the best services to grow your business.</p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          <button 
            className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-semibold hover:bg-gray-50"
            onClick={() => setActiveCategory('All')}
          >
            Category <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-semibold hover:bg-gray-50">
            Price Range <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-semibold hover:bg-gray-50">
            Delivery Time <ChevronDown size={14} />
          </button>
          <div className="h-10 w-px bg-gray-200 mx-2 hidden md:block"></div>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-md text-sm font-bold border border-emerald-200">
            <SlidersHorizontal size={14} /> More Filters
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
          <span>{filteredGigs.length} services available</span>
          <div className="flex items-center gap-2 border rounded-md p-1">
            <button className="p-1.5 rounded bg-gray-100 text-gray-900"><LayoutGrid size={16} /></button>
            <button className="p-1.5 rounded hover:bg-gray-100"><List size={16} /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="hidden lg:block space-y-8">
          <div>
            <h4 className="font-bold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li 
                className={`cursor-pointer hover:text-emerald-600 ${activeCategory === 'All' ? 'text-emerald-600 font-bold' : ''}`}
                onClick={() => setActiveCategory('All')}
              >
                All Categories
              </li>
              {CATEGORIES.map(cat => (
                <li 
                  key={cat} 
                  className={`cursor-pointer hover:text-emerald-600 ${activeCategory === cat ? 'text-emerald-600 font-bold' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Service Options</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Subscription Services</span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Pro Services</span>
              </label>
            </div>
          </div>
        </div>

        {/* Gig Grid */}
        <div className="lg:col-span-3">
          {filteredGigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGigs.map(gig => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border rounded-lg">
              <p className="text-gray-500 mb-4">No services found matching your criteria.</p>
              <button 
                onClick={() => { setActiveCategory('All'); setPriceRange([0, 50000]); }}
                className="text-emerald-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;

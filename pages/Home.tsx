
import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { CATEGORIES, MOCK_GIGS } from '../constants';
import GigCard from '../components/GigCard';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="bg-emerald-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Find the perfect <span className="italic font-light">freelance</span> services for your business
            </h1>
            <div className="flex items-center gap-4 bg-white rounded-md p-1 pl-4 mb-8">
              <input 
                type="text" 
                placeholder="Try 'logo design'" 
                className="flex-1 bg-transparent text-gray-900 outline-none"
              />
              <button className="bg-emerald-500 px-6 py-2 rounded font-semibold hover:bg-emerald-600 transition-colors">
                Search
              </button>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-medium">
              <span>Popular:</span>
              <span className="border border-white px-3 py-1 rounded-full hover:bg-white hover:text-emerald-900 cursor-pointer">Website Design</span>
              <span className="border border-white px-3 py-1 rounded-full hover:bg-white hover:text-emerald-900 cursor-pointer">WordPress</span>
              <span className="border border-white px-3 py-1 rounded-full hover:bg-white hover:text-emerald-900 cursor-pointer">Logo Design</span>
              <span className="border border-white px-3 py-1 rounded-full hover:bg-white hover:text-emerald-900 cursor-pointer">AI Services</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map(cat => (
            <div key={cat} className="group cursor-pointer">
              <div className="bg-gray-100 aspect-square rounded-lg mb-2 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                <div className="w-12 h-12 bg-white rounded shadow-sm flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-xl">{cat[0]}</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-center group-hover:text-emerald-600">{cat}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Selling Points */}
      <section className="bg-emerald-50 py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-8">A whole world of freelance talent at your fingertips</h2>
            <div className="space-y-6">
              {[
                { title: 'The best for every budget', desc: 'Find high-quality services at every price point. No hourly rates, just project-based pricing.' },
                { title: 'Quality work done quickly', desc: 'Find the right freelancer to begin working on your project within minutes.' },
                { title: 'Protected payments, every time', desc: 'Always know what you\'ll pay upfront. Your payment isn\'t released until you approve the work.' },
                { title: '24/7 support', desc: 'Questions? Our round-the-clock support team is available to help anytime, anywhere.' },
              ].map(point => (
                <div key={point.title} className="flex gap-4">
                  <CheckCircle className="text-gray-400 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-lg mb-1">{point.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden shadow-2xl">
            <img src="https://picsum.photos/seed/marketplace/800/600" alt="Marketplace" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Gigs you may like</h2>
            <p className="text-gray-500 mt-2">Hand-picked services just for you</p>
          </div>
          <Link to="/marketplace" className="text-emerald-600 font-bold flex items-center gap-1 hover:underline">
            View All <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_GIGS.map(gig => (
            <GigCard key={gig.id} gig={gig} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

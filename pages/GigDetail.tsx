
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_GIGS, MOCK_USERS } from '../constants';
import { Star, Clock, RotateCcw, Check, Heart, Share2, Info } from 'lucide-react';

const GigDetail: React.FC = () => {
  const { id } = useParams();
  const gig = MOCK_GIGS.find(g => g.id === id) || MOCK_GIGS[0];
  const seller = MOCK_USERS[gig.sellerId] || MOCK_USERS['u1'];
  
  const [activeTab, setActiveTab] = useState<'basic' | 'standard' | 'premium'>('basic');
  const packageData = gig.packages[activeTab];

  return (
    <div className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Content */}
        <div className="lg:col-span-2">
          <nav className="text-xs text-gray-500 mb-6 flex gap-2">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link to="/marketplace" className="hover:underline">{gig.category}</Link>
          </nav>

          <h1 className="text-3xl font-bold mb-6 text-gray-800 leading-snug">{gig.title}</h1>

          <div className="flex items-center gap-4 mb-8">
            <img src={seller.avatar} className="w-12 h-12 rounded-full" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold">{seller.name}</span>
                <span className="text-gray-400">|</span>
                <span className="text-emerald-600 font-semibold">Top Rated Seller</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-yellow-500">
                <Star size={16} className="fill-current" />
                <span className="font-bold">{gig.rating}</span>
                <span className="text-gray-400">({gig.reviewCount} reviews)</span>
                <span className="text-gray-400 ml-2">5 Orders in Queue</span>
              </div>
            </div>
          </div>

          {/* Main Gallery */}
          <div className="mb-12 aspect-video rounded-xl overflow-hidden border bg-gray-50">
            <img src={gig.thumbnail} className="w-full h-full object-cover" alt="Gig" />
          </div>

          {/* About This Gig */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">About this gig</h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line space-y-4">
              <p>{gig.description}</p>
              <p>Why choose me?</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Professional and unique designs</li>
                <li>Unlimited revisions for premium packages</li>
                <li>Fast turnaround time</li>
                <li>Excellent communication</li>
              </ul>
            </div>
          </section>

          {/* About Seller */}
          <section className="mb-12 border-t pt-12">
            <h2 className="text-xl font-bold mb-6">About the seller</h2>
            <div className="flex gap-6 mb-6">
              <img src={seller.avatar} className="w-24 h-24 rounded-full" />
              <div>
                <h4 className="font-bold text-lg">{seller.name}</h4>
                <p className="text-gray-500 mb-4">{seller.location}</p>
                <button className="px-6 py-2 border border-gray-800 rounded font-semibold hover:bg-gray-800 hover:text-white transition-colors">
                  Contact Me
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border rounded-lg text-sm mb-6">
              <div><p className="text-gray-400 mb-1">From</p><p className="font-bold">Egypt</p></div>
              <div><p className="text-gray-400 mb-1">Member since</p><p className="font-bold">{seller.joinedDate}</p></div>
              <div><p className="text-gray-400 mb-1">Avg. response time</p><p className="font-bold">1 hour</p></div>
              <div><p className="text-gray-400 mb-1">Last delivery</p><p className="font-bold">2 hours</p></div>
            </div>
            <p className="text-gray-600">Professional creative with over 5 years of experience helping brands stand out in crowded markets.</p>
          </section>
        </div>

        {/* Right Sidebar - Pricing */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border rounded-lg bg-white overflow-hidden">
            {/* Tabs */}
            <div className="flex">
              {(['basic', 'standard', 'premium'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === tab ? 'border-emerald-500 text-emerald-600 bg-white' : 'border-transparent text-gray-500 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{packageData.name}</h3>
                <span className="text-2xl font-bold">EGP {packageData.price}</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">{packageData.description}</p>
              
              <div className="flex flex-col gap-3 mb-6 text-sm font-semibold text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock size={16} /> {packageData.deliveryTime} Days Delivery
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} /> {packageData.revisions === 99 ? 'Unlimited' : packageData.revisions} Revisions
                </div>
              </div>

              <div className="space-y-2 mb-8">
                {packageData.features.map(feat => (
                  <div key={feat} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-emerald-500" /> {feat}
                  </div>
                ))}
              </div>

              <button className="w-full bg-gray-800 text-white py-3 rounded font-bold hover:bg-gray-900 transition-colors mb-4">
                Continue (EGP {packageData.price})
              </button>
              
              <button className="w-full text-emerald-600 py-2 text-sm font-bold hover:underline">
                Contact Seller
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 border-t flex flex-col gap-4">
              <div className="flex justify-center gap-8">
                <button className="flex flex-col items-center gap-1 text-xs text-gray-500 hover:text-emerald-600">
                  <Heart size={18} /> Save
                </button>
                <button className="flex flex-col items-center gap-1 text-xs text-gray-500 hover:text-emerald-600">
                  <Share2 size={18} /> Share
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-white border rounded-lg p-6 flex items-start gap-4">
            <Info className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm font-bold mb-1">Secure payment</p>
              <p className="text-xs text-gray-500">Your payment is held securely in escrow and only released to the seller after you approve the delivery.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GigDetail;


import React from 'react';
import { MOCK_GIGS, MOCK_USERS, MOCK_ORDERS } from '../constants';
import { Shield, Users, ShoppingCart, AlertTriangle, ArrowUpRight, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-emerald-600" /> Admin Console
          </h1>
          <p className="text-sm text-gray-500">Managing GigStream Ecosystem</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 border rounded-md text-sm font-bold hover:bg-gray-50">Platform Settings</button>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-bold shadow-sm">Review New Gigs (12)</button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total GMV', value: 'EGP 1,240,000', change: '+12.5%', icon: ShoppingCart, color: 'blue' },
          { label: 'Active Users', value: '4,520', change: '+4.2%', icon: Users, color: 'emerald' },
          { label: 'Pending Payouts', value: 'EGP 82,400', change: '', icon: AlertTriangle, color: 'orange' },
          { label: 'System Health', value: '99.9%', change: '', icon: CheckCircle, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}>
                <stat.icon size={20} />
              </div>
              {stat.change && (
                <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <ArrowUpRight size={10} /> {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Moderation Queue */}
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold">Gig Moderation Queue</h3>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">8 Pending</span>
          </div>
          <div className="divide-y">
            {MOCK_GIGS.slice(0, 4).map(gig => (
              <div key={gig.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={gig.thumbnail} className="w-12 h-12 rounded object-cover" />
                  <div>
                    <p className="text-sm font-bold truncate max-w-[200px]">{gig.title}</p>
                    <p className="text-xs text-gray-500">by {MOCK_USERS[gig.sellerId].name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"><CheckCircle size={18} /></button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"><XCircle size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispute Resolution */}
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="font-bold text-orange-600 flex items-center gap-2">
              <AlertTriangle size={18} /> Active Disputes
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 border border-orange-100 bg-orange-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-orange-800">Dispute #D1024</span>
                  <span className="text-xs text-orange-700">Started 2h ago</span>
                </div>
                <p className="text-sm font-medium mb-3">Buyer claims delivery does not match requirements. Seller has responded.</p>
                <div className="flex justify-end gap-3">
                  <button className="text-xs font-bold hover:underline">View Evidence</button>
                  <button className="text-xs bg-orange-600 text-white px-3 py-1 rounded font-bold">Investigate</button>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-400 text-center py-4 italic">No other active disputes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

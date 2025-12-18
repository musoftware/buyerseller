
import React from 'react';
import { UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Clock, CheckCircle, AlertCircle, ShoppingBag, Plus } from 'lucide-react';

interface DashboardProps {
  role: UserRole;
}

const data = [
  { name: 'Mon', revenue: 400 },
  { name: 'Tue', revenue: 300 },
  { name: 'Wed', revenue: 200 },
  { name: 'Thu', revenue: 278 },
  { name: 'Fri', revenue: 189 },
  { name: 'Sat', revenue: 239 },
  { name: 'Sun', revenue: 349 },
];

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const isSeller = role === 'SELLER';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            {isSeller ? 'Seller Dashboard' : 'My Activity'}
          </h1>
          {isSeller && (
            <button className="bg-emerald-600 text-white px-6 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-emerald-700">
              <Plus size={18} /> Create New Gig
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">{isSeller ? 'Active Orders' : 'My Orders'}</span>
              <Clock className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-emerald-600 mt-2 font-medium">+2 from last week</p>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">{isSeller ? 'Monthly Earnings' : 'Money Spent'}</span>
              <DollarSign className="text-emerald-500" size={20} />
            </div>
            <p className="text-2xl font-bold">EGP 14,500</p>
            <p className="text-xs text-emerald-600 mt-2 font-medium">+15% from last month</p>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">Completed Projects</span>
              <CheckCircle className="text-emerald-500" size={20} />
            </div>
            <p className="text-2xl font-bold">84</p>
            <p className="text-xs text-gray-400 mt-2">Overall history</p>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium">Pending Feedback</span>
              <AlertCircle className="text-orange-500" size={20} />
            </div>
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-gray-400 mt-2">Needs your attention</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts or Order List */}
          <div className="lg:col-span-2 space-y-8">
            {isSeller && (
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="font-bold mb-6">Revenue Overview</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold">Recent Orders</h3>
                <button className="text-emerald-600 text-sm font-bold hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        <img src={`https://picsum.photos/seed/ord${i}/100`} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Design a minimalist landing page</p>
                        <p className="text-xs text-gray-500">Order #G92348 - {i} days ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">EGP 1,200</p>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity/Messaging Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="font-bold mb-4">Latest Messages</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 pb-4 border-b last:border-0">
                    <img src={`https://picsum.photos/seed/msg${i}/100`} className="w-10 h-10 rounded-full" />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">User {i}</span>
                        <span className="text-[10px] text-gray-400">12:30 PM</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">Hey! Just checking in on the progress of the design...</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm text-emerald-600 font-bold border border-emerald-600 rounded hover:bg-emerald-50">
                Open Inbox
              </button>
            </div>

            <div className="bg-emerald-900 text-white p-6 rounded-lg border shadow-sm">
              <h3 className="font-bold mb-2">Seller Tips</h3>
              <p className="text-xs text-emerald-100 mb-4 leading-relaxed">Responding to buyers in under 1 hour can increase your conversion rate by 25%.</p>
              <button className="text-xs font-bold underline">Learn more</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Bell, Mail, Shield, PlusCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'BUYER' | 'SELLER' | 'ADMIN';
  onSwitchRole: (role: 'BUYER' | 'SELLER' | 'ADMIN') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, onSwitchRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = userRole === 'ADMIN';
  const isSeller = userRole === 'SELLER';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-emerald-600 tracking-tight">GigStream</Link>
            
            <div className="hidden md:flex flex-1 max-w-sm lg:max-w-xl relative">
              <input 
                type="text" 
                placeholder="Search for any service..."
                className="w-full pl-4 pr-10 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
              />
              <button className="absolute right-3 top-2 text-gray-400">
                <Search size={18} />
              </button>
            </div>
          </div>

          <nav className="flex items-center gap-2 md:gap-4 text-sm font-semibold text-gray-600">
            <div className="hidden lg:flex items-center gap-6 mr-4">
              <Link to="/marketplace" className={`hover:text-emerald-600 ${location.pathname === '/marketplace' ? 'text-emerald-600 underline underline-offset-8' : ''}`}>Explore</Link>
              
              {!isAdmin && (
                <button 
                  onClick={() => onSwitchRole(isSeller ? 'BUYER' : 'SELLER')}
                  className="text-emerald-600 hover:text-emerald-700 px-3 py-1.5 border border-emerald-100 rounded-md bg-emerald-50 transition-colors"
                >
                  Switch to {isSeller ? 'Buying' : 'Selling'}
                </button>
              )}

              {isSeller && (
                <Link to="/create-gig" className="flex items-center gap-1.5 hover:text-emerald-600">
                  <PlusCircle size={18} /> Create Gig
                </Link>
              )}
            </div>

            <div className="flex items-center gap-1 md:gap-3 border-l pl-4">
              <button onClick={() => navigate('/messages')} className="relative p-2 hover:bg-gray-100 rounded-full">
                <Mail size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="relative p-2 hover:bg-gray-100 rounded-full">
                <Bell size={20} />
              </button>
              <button onClick={() => onSwitchRole('ADMIN')} className={`p-2 hover:bg-gray-100 rounded-full ${isAdmin ? 'text-emerald-600' : 'text-gray-400'}`}>
                <Shield size={20} title="Admin Access" />
              </button>
              <button className="relative p-2 hover:bg-gray-100 rounded-full border border-transparent hover:border-gray-200" onClick={() => navigate('/dashboard')}>
                <User size={20} />
              </button>
            </div>
          </nav>
        </div>
        
        {/* Secondary Navigation */}
        <div className="bg-gray-50 border-b hidden lg:block">
           <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
             <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                <span className="cursor-pointer hover:text-emerald-600 whitespace-nowrap">Graphics</span>
                <span className="cursor-pointer hover:text-emerald-600 whitespace-nowrap">Marketing</span>
                <span className="cursor-pointer hover:text-emerald-600 whitespace-nowrap">Writing</span>
                <span className="cursor-pointer hover:text-emerald-600 whitespace-nowrap">AI Services</span>
                <span className="cursor-pointer hover:text-emerald-600 whitespace-nowrap">Video</span>
                <span className="cursor-pointer hover:text-emerald-600 whitespace-nowrap">Programming</span>
             </div>
             <div className="flex gap-4">
                <span className="text-emerald-600 cursor-pointer">Post a Request</span>
                <span className="text-gray-400">|</span>
                <span className="cursor-pointer">GigStream Pro</span>
             </div>
           </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-12">
            <div className="col-span-2 lg:col-span-1">
              <h3 className="font-extrabold text-2xl text-emerald-600 mb-6 tracking-tight">GigStream</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Connecting businesses with the top 3% of freelance talent globally. Built for speed, scale, and security.</p>
              <div className="flex gap-4 mt-6">
                 {/* Social Placeholder Icons */}
                 {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-100"></div>)}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-900">Categories</h4>
              <ul className="text-sm text-gray-500 space-y-4">
                <li className="hover:text-emerald-600 cursor-pointer">Graphics & Design</li>
                <li className="hover:text-emerald-600 cursor-pointer">Digital Marketing</li>
                <li className="hover:text-emerald-600 cursor-pointer">Writing & Translation</li>
                <li className="hover:text-emerald-600 cursor-pointer">Video & Animation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-900">About</h4>
              <ul className="text-sm text-gray-500 space-y-4">
                <li className="hover:text-emerald-600 cursor-pointer">Careers</li>
                <li className="hover:text-emerald-600 cursor-pointer">Partnerships</li>
                <li className="hover:text-emerald-600 cursor-pointer">Privacy Policy</li>
                <li className="hover:text-emerald-600 cursor-pointer">Investor Relations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-900">Support</h4>
              <ul className="text-sm text-gray-500 space-y-4">
                <li className="hover:text-emerald-600 cursor-pointer">Help & Support</li>
                <li className="hover:text-emerald-600 cursor-pointer">Trust & Safety</li>
                <li className="hover:text-emerald-600 cursor-pointer">Selling on GigStream</li>
                <li className="hover:text-emerald-600 cursor-pointer">Buying on GigStream</li>
              </ul>
            </div>
            <div>
               <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-900">Community</h4>
               <ul className="text-sm text-gray-500 space-y-4">
                  <li className="hover:text-emerald-600 cursor-pointer">Events</li>
                  <li className="hover:text-emerald-600 cursor-pointer">Blog</li>
                  <li className="hover:text-emerald-600 cursor-pointer">Forum</li>
               </ul>
            </div>
          </div>
          <div className="border-t pt-10 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-gray-400 font-medium">
            <div className="flex items-center gap-6">
              <p>&copy; 2024 GigStream Ltd.</p>
              <div className="flex gap-4">
                 <span className="hover:text-gray-600 cursor-pointer">Terms</span>
                 <span className="hover:text-gray-600 cursor-pointer">Sitemap</span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer hover:text-gray-600">
                <span className="w-5 h-5 rounded-full bg-emerald-500"></span> English
              </div>
              <div className="font-bold text-gray-600">EGP - LE</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

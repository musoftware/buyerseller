
import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { ArrowRight, ArrowLeft, Upload, Check, HelpCircle } from 'lucide-react';

const GigCreation: React.FC = () => {
  const [step, setStep] = useState(1);
  const steps = ['Overview', 'Pricing', 'Description', 'Requirements', 'Gallery', 'Publish'];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
          {steps.map((s, i) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                step > i + 1 ? 'bg-emerald-500 border-emerald-500 text-white' : 
                step === i + 1 ? 'bg-white border-emerald-500 text-emerald-600 shadow-lg' : 
                'bg-white border-gray-200 text-gray-400'
              }`}>
                {step > i + 1 ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${step === i + 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg border shadow-sm p-8">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-2xl font-bold mb-2">Gig Overview</h2>
                <p className="text-sm text-gray-500">Give your gig a title that stands out.</p>
              </div>
              
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-gray-700 block mb-2">Gig Title</span>
                  <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-emerald-500 overflow-hidden">
                    <span className="bg-gray-50 px-4 py-3 text-sm font-bold text-gray-400 border-r">I WILL</span>
                    <input 
                      type="text" 
                      placeholder="design a minimalist logo for your brand"
                      className="flex-1 px-4 py-3 outline-none text-sm font-medium"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">Maximum 80 characters. Be concise.</span>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-bold text-gray-700 block mb-2">Category</span>
                    <select className="w-full px-4 py-3 border rounded-md text-sm outline-none focus:ring-1 focus:ring-emerald-500">
                      <option>Select a category</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-gray-700 block mb-2">Subcategory</span>
                    <select className="w-full px-4 py-3 border rounded-md text-sm outline-none focus:ring-1 focus:ring-emerald-500">
                      <option>Select subcategory</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-bold text-gray-700 block mb-2">Search Tags</span>
                  <input 
                    type="text" 
                    placeholder="e.g. logo, brand, vector (Press Enter to add)"
                    className="w-full px-4 py-3 border rounded-md text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">5 tags maximum. Tags help buyers find your service.</span>
                </label>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-2xl font-bold mb-2">Gig Gallery</h2>
                <p className="text-sm text-gray-500">Showcase your work to attract buyers.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="aspect-[1.5/1] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors border-emerald-200 bg-emerald-50/20">
                  <Upload className="text-emerald-400 mb-2" />
                  <span className="text-xs font-bold text-emerald-600">Main Thumbnail</span>
                </div>
                {[1, 2].map(i => (
                  <div key={i} className="aspect-[1.5/1] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="text-gray-300 mb-2" />
                    <span className="text-[10px] font-bold text-gray-400">Additional Portfolio</span>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                <HelpCircle className="text-blue-500 flex-shrink-0" size={20} />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Gigs with at least one image showing a previous project result are 3x more likely to get orders. 
                  Make sure your images are clear and high-resolution.
                </p>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t">
            <button 
              disabled={step === 1}
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-2 flex items-center gap-2 text-gray-500 font-bold hover:text-gray-800 disabled:opacity-30"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button 
              onClick={() => setStep(s => (s < 6 ? s + 1 : s))}
              className="bg-emerald-600 text-white px-8 py-2 rounded-md font-bold shadow-md hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              {step === 6 ? 'Publish Gig' : 'Save & Continue'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigCreation;

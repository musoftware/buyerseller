
import React, { useState } from 'react';
import { MOCK_USERS } from '../constants';
// Add Mail to the import list to fix the "Cannot find name 'Mail'" error
import { Send, Image, Paperclip, MoreVertical, Search, Phone, Video, Mail } from 'lucide-react';

const Messages: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>('u1');
  const [input, setInput] = useState('');

  const chats = [
    { id: 'u1', name: 'Ahmed Kamal', lastMsg: 'I will start the logo concepts now.', time: '10m', unread: 2 },
    { id: 'u2', name: 'Sara Designer', lastMsg: 'The web app is deployed!', time: '2h', unread: 0 },
    { id: 'u3', name: 'Mark Agency', lastMsg: 'Thanks for the order.', time: 'Yesterday', unread: 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-140px)]">
      <div className="bg-white border rounded-lg shadow-sm h-full flex overflow-hidden">
        
        {/* Contacts Sidebar */}
        <div className="w-full md:w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-4">Inbox</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-md text-sm outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChat(chat.id)}
                className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat === chat.id ? 'bg-emerald-50' : ''}`}
              >
                <div className="relative">
                  <img src={MOCK_USERS[chat.id]?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.id}`} className="w-12 h-12 rounded-full" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm truncate">{chat.name}</span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 truncate">{chat.lastMsg}</p>
                    {chat.unread > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="hidden md:flex flex-1 flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <img src={MOCK_USERS[selectedChat]?.avatar} className="w-10 h-10 rounded-full" />
                  <div>
                    <h3 className="font-bold text-sm">{MOCK_USERS[selectedChat]?.name}</h3>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <button className="hover:text-emerald-600"><Phone size={18} /></button>
                  <button className="hover:text-emerald-600"><Video size={18} /></button>
                  <button className="hover:text-emerald-600"><MoreVertical size={18} /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                <div className="flex flex-col items-center mb-8">
                  <span className="text-[10px] bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Today</span>
                </div>

                <div className="flex gap-3 max-w-[80%]">
                  <img src={MOCK_USERS[selectedChat]?.avatar} className="w-8 h-8 rounded-full self-end" />
                  <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-sm border">
                    <p className="text-sm text-gray-800">Hi! I've reviewed your requirements. Can we jump on a quick call to clarify the color palette?</p>
                    <span className="text-[10px] text-gray-400 mt-2 block">10:45 AM</span>
                  </div>
                </div>

                <div className="flex flex-row-reverse gap-3 max-w-[80%] ml-auto">
                  <div className="bg-emerald-600 p-3 rounded-lg rounded-br-none shadow-sm text-white">
                    <p className="text-sm">Sure! I'm free in 15 minutes. Does that work for you?</p>
                    <span className="text-[10px] text-emerald-200 mt-2 block text-right">10:47 AM</span>
                  </div>
                </div>

                <div className="flex gap-3 max-w-[80%]">
                  <img src={MOCK_USERS[selectedChat]?.avatar} className="w-8 h-8 rounded-full self-end" />
                  <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-sm border">
                    <p className="text-sm text-gray-800">Perfect. I will start the logo concepts now based on our previous discussion. Looking forward to it!</p>
                    <span className="text-[10px] text-gray-400 mt-2 block">10:55 AM</span>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><Image size={20} /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><Paperclip size={20} /></button>
                  </div>
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..." 
                      className="w-full px-4 py-2 bg-gray-50 border rounded-full text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <button className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700">
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <Mail size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

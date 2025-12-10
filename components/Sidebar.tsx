import React from 'react';
import { Icons } from '../constants';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  sessions: ChatSession[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  sessions, 
  currentSessionId, 
  onNewChat, 
  onSelectSession 
}) => {
  return (
    <div 
      className={`
        fixed inset-y-0 left-0 z-40 w-[280px] transform transition-transform duration-[400ms] ease-[cubic-bezier(0.1,0.9,0.2,1)]
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        acrylic-material border-r border-[#e0e0e0]
        flex flex-col h-full
        fluent-shadow-28 md:shadow-none
      `}
    >
      <div className="flex flex-col h-full pt-6 pb-4">
        {/* Header - Title 2 Style */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-3 mb-6 pl-2">
            <div className="w-8 h-8 rounded-lg bg-[#0f6cbd] flex items-center justify-center text-white fluent-shadow-4">
              <Icons.Chat />
            </div>
            <h1 className="text-[20px] font-semibold text-[#242424] leading-6 tracking-tight">
              FluentChat
            </h1>
          </div>

          {/* New Chat - Primary Button Style */}
          <button
            onClick={onNewChat}
            className="
              w-full h-[44px] px-4 rounded-[4px] 
              bg-white hover:bg-[#f5f5f5] active:bg-[#ebebeb]
              text-[#0f6cbd] font-semibold text-[14px]
              fluent-shadow-2 hover:fluent-shadow-4
              border border-[#d1d1d1]
              flex items-center justify-center gap-2
              transition-all duration-200
            "
          >
            <Icons.Add />
            <span>New Chat</span>
          </button>
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
          {/* Caption 1 Strong */}
          <div className="text-[12px] font-semibold text-[#616161] px-4 mb-2 uppercase tracking-wide">
            Recent
          </div>
          
          <div className="flex flex-col gap-[2px]">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`
                  w-full h-[52px] text-left px-3 rounded-[4px] transition-all duration-100
                  flex items-center gap-3 group relative
                  ${currentSessionId === session.id 
                    ? 'bg-white fluent-shadow-2' 
                    : 'hover:bg-[#0000000a] active:bg-[#0000000f]'}
                `}
              >
                {/* Selection Indicator for Active Item */}
                {currentSessionId === session.id && (
                  <div className="absolute left-0 top-[12px] bottom-[12px] w-[3px] bg-[#0f6cbd] rounded-r-full" />
                )}

                <div className={`
                  transition-colors
                  ${currentSessionId === session.id ? 'text-[#0f6cbd]' : 'text-[#616161] group-hover:text-[#424242]'}
                `}>
                  <Icons.Chat />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  {/* Body 1 */}
                  <div className={`text-[14px] font-medium truncate leading-5 ${currentSessionId === session.id ? 'text-[#242424]' : 'text-[#424242]'}`}>
                    {session.title || "New Conversation"}
                  </div>
                  {/* Caption 1 */}
                  <div className="text-[12px] text-[#616161] truncate leading-4 opacity-80">
                    {session.lastMessage || "No messages yet"}
                  </div>
                </div>
              </button>
            ))}
            
            {sessions.length === 0 && (
              <div className="py-12 text-center px-4">
                <p className="text-[#616161] text-[12px]">No recent conversations.</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="mt-auto px-2 pt-2 border-t border-[#e0e0e0]">
          <button className="w-full h-[52px] flex items-center gap-3 px-3 rounded-[4px] hover:bg-[#0000000a] transition-colors">
            {/* Person Avatar - strictly Circle */}
            <div className="w-8 h-8 rounded-full bg-[#f0f0f0] border border-white flex items-center justify-center text-[#616161] font-semibold text-[10px]">
              US
            </div>
            
            <div className="flex-1 text-left min-w-0">
              <div className="text-[14px] font-semibold text-[#242424]">User</div>
              <div className="text-[12px] text-[#616161]">Free Plan</div>
            </div>
            
            <div className="text-[#616161]">
              <Icons.Settings />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
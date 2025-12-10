import React from 'react';
import { Message, Role } from '../types';
import { Icons } from '../constants';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 group ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row items-start'}`}>
        
        {/* Avatar Shapes:
            User = Person = Circle
            Bot = App/Service = Squircle (Rounded Rectangle)
        */}
        <div className={`
          flex-shrink-0 w-8 h-8 flex items-center justify-center overflow-hidden
          ${isUser 
            ? 'rounded-full bg-[#0f6cbd] text-white shadow-sm' 
            : 'rounded-[8px] bg-white text-[#0f6cbd] border border-[#e0e0e0] fluent-shadow-2'}
        `}>
          {isUser ? (
            <span className="text-[10px] font-bold tracking-wide">ME</span>
          ) : (
            <div className="p-1.5">
              <Icons.Bot />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            relative px-4 py-3 text-[14px] leading-[20px] transition-shadow duration-200
            ${isUser 
              ? 'bg-[#0f6cbd] text-white rounded-[12px] rounded-tr-[2px]' 
              : 'bg-white text-[#242424] border border-[#e0e0e0] rounded-[12px] rounded-tl-[2px] fluent-shadow-4'}
          `}>
             <div className="whitespace-pre-wrap break-words font-normal">
               {message.text}
               {message.isStreaming && (
                 <span className="inline-flex gap-1 ml-2 align-baseline">
                    <span className="w-1 h-1 rounded-full bg-current opacity-60 animate-[bounce_1.4s_infinite_0ms]"></span>
                    <span className="w-1 h-1 rounded-full bg-current opacity-60 animate-[bounce_1.4s_infinite_200ms]"></span>
                    <span className="w-1 h-1 rounded-full bg-current opacity-60 animate-[bounce_1.4s_infinite_400ms]"></span>
                 </span>
               )}
             </div>
          </div>
          
          {/* Metadata - Caption 2 */}
          <span className={`
            text-[10px] mt-1 px-1 font-normal text-[#616161] opacity-0 group-hover:opacity-100 transition-opacity duration-300
            ${isUser ? 'text-right' : 'text-left'}
          `}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
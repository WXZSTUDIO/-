import React, { useState, useRef } from 'react';
import { Icons } from '../constants';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!text.trim() || isLoading) return;
    onSendMessage(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="sticky bottom-0 w-full z-20">
      {/* Gradient Mask for content below */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fafafa] via-[#fafafa]/80 to-transparent pointer-events-none" />
      
      <div className="relative px-4 pb-8 pt-2 max-w-3xl mx-auto">
        {/* Pill Form Container */}
        <div className={`
          relative flex items-end gap-2 p-1.5
          acrylic-material
          border border-white/40
          rounded-full
          transition-all duration-300 ease-out
          ${isFocused 
            ? 'fluent-shadow-16 ring-1 ring-[#0f6cbd]/30' 
            : 'fluent-shadow-8'}
        `}>
          
          {/* Leading Icon (Add) */}
          <button className="
            w-[40px] h-[40px] rounded-full 
            flex items-center justify-center flex-shrink-0
            text-[#616161] hover:text-[#0f6cbd] hover:bg-[#0000000a]
            transition-colors duration-200
          ">
            <Icons.Add />
          </button>

          {/* Input Field - Body 1 */}
          <div className="flex-1 py-[10px] min-h-[40px]">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask anything..."
              rows={1}
              disabled={isLoading}
              className="
                w-full max-h-[120px] 
                bg-transparent border-none outline-none resize-none 
                text-[#242424] placeholder:text-[#616161]
                text-[14px] leading-[20px]
                custom-scrollbar
                font-normal
              "
            />
          </div>

          {/* Trailing Action (Send) */}
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            className={`
              w-[40px] h-[40px] rounded-full 
              flex items-center justify-center flex-shrink-0
              transition-all duration-200
              ${text.trim() && !isLoading
                ? 'bg-[#0f6cbd] text-white hover:bg-[#115ea3] fluent-shadow-4' 
                : 'bg-transparent text-[#bdbdbd] cursor-not-allowed'}
            `}
          >
            <Icons.Send />
          </button>
        </div>
        
        {/* Caption 2 */}
        <div className="text-center mt-2">
           <p className="text-[10px] text-[#616161] font-normal tracking-wide">
             AI generated content may be incorrect.
           </p>
        </div>
      </div>
    </div>
  );
};
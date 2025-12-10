import React, { useEffect } from 'react';
import { Icons } from '../constants';

interface VideoModalProps {
  isOpen: boolean;
  videoSrc: string | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, videoSrc, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !videoSrc) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {/* Content */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-end z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
             <button 
              onClick={onClose}
              className="pointer-events-auto w-12 h-12 rounded-full bg-[#181818] hover:bg-[#2a2a2a] flex items-center justify-center text-white transition-colors"
            >
              <Icons.Close />
            </button>
        </div>
        
        <div className="flex-1 relative bg-black flex items-center justify-center">
             <video 
              src={videoSrc} 
              className="w-full h-full object-contain max-h-screen"
              controls 
              autoPlay 
              playsInline
            />
        </div>

        {/* Info Overlay (Static simulation for Netflix HUD) */}
        <div className="absolute bottom-12 left-0 right-0 px-12 pointer-events-none">
            <div className="max-w-3xl">
                {/* This simulates the Netflix player UI overlay */}
            </div>
        </div>
      </div>
    </div>
  );
};
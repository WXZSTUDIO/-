import React, { useState } from 'react';
import { PageType, Language, Theme } from '../types';
import { Icons } from '../constants';

interface MobileHeaderProps {
  currentLang: Language;
  currentTheme: Theme;
  onNavigate: (page: PageType) => void;
  onLanguageChange: (lang: Language) => void;
  onThemeToggle: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  currentLang, 
  currentTheme,
  onNavigate, 
  onLanguageChange,
  onThemeToggle
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages: { id: Language; label: string }[] = [
    { id: 'zh-CN', label: 'CN' },
    { id: 'zh-TW', label: 'TW' },
    { id: 'en', label: 'EN' },
    { id: 'ja', label: 'JP' },
    { id: 'ko', label: 'KR' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 material-mica md:hidden transition-colors duration-300">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <div 
          className="text-lg font-bold bg-clip-text text-transparent bg-fluent-gradient cursor-pointer tracking-tight"
          onClick={() => onNavigate('home')}
        >
          WXZ STUDIO
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button 
            onClick={onThemeToggle}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-layer-2)] transition-all"
          >
            {currentTheme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-layer-2)] transition-all flex items-center gap-1"
            >
              <Icons.Globe />
              <span className="text-[10px] font-bold">{currentLang.split('-')[0].toUpperCase()}</span>
            </button>

            {/* Mobile Dropdown */}
            {isLangOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsLangOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-28 p-1 material-glass rounded-xl shadow-xl z-20">
                  {languages.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        onLanguageChange(lang.id);
                        setIsLangOpen(false);
                      }}
                      className={`
                        w-full text-center px-4 py-2.5 text-[12px] font-medium transition-colors rounded-lg mb-0.5 last:mb-0
                        ${currentLang === lang.id 
                          ? 'text-[var(--brand-primary)] bg-[var(--bg-layer-2)]' 
                          : 'text-[var(--text-primary)] active:bg-[var(--bg-layer-2)]'}
                      `}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
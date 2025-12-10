import React, { useState, useEffect } from 'react';
import { PageType, Language, Theme } from '../types';
import { Icons, TRANSLATIONS } from '../constants';

interface NavbarProps {
  currentPage: PageType;
  currentLang: Language;
  currentTheme: Theme;
  onNavigate: (page: PageType) => void;
  onLanguageChange: (lang: Language) => void;
  onThemeToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPage, 
  currentLang, 
  onNavigate, 
  onLanguageChange,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: t.nav.home },
    { id: 'video', label: t.nav.video },
    { id: 'graphic', label: t.nav.graphic },
    { id: 'contact', label: t.nav.contact },
  ];

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 px-4 md:px-12 h-[68px] flex items-center transition-colors duration-500 ease-in-out
        ${isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'}
      `}
    >
      <div className="flex items-center gap-8 flex-1">
        {/* Logo */}
        <div 
          className="cursor-pointer text-[#E50914] transform hover:scale-105 transition-transform"
          onClick={() => onNavigate('home')}
        >
          <Icons.Logo />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-5">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id as PageType)}
                  className={`
                    text-sm font-medium transition-colors duration-300
                    ${currentPage === item.id 
                      ? 'text-white font-bold' 
                      : 'text-[#e5e5e5] hover:text-[#b3b3b3]'}
                  `}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Secondary Nav (Right) */}
      <div className="flex items-center gap-5 text-white">
        <button className="hover:text-gray-300"><Icons.Search /></button>
        <button className="hover:text-gray-300 hidden sm:block">Kids</button>
        <button className="hover:text-gray-300"><Icons.Bell /></button>
        
        {/* Profile Dropdown Simulation */}
        <div className="flex items-center gap-1 cursor-pointer group relative">
          <div className="w-8 h-8 rounded-md overflow-hidden border border-transparent group-hover:border-white transition-colors">
            <img src="https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <Icons.ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
          
          {/* Simple Dropdown for Language (as part of profile interaction in this simplified demo) */}
           <div className="absolute right-0 top-full mt-2 w-32 bg-black/90 border border-gray-700 p-2 hidden group-hover:block">
               {['en', 'zh-CN', 'ja', 'ko'].map((l) => (
                   <div 
                    key={l} 
                    className="text-xs py-1 px-2 hover:underline text-gray-300 hover:text-white"
                    onClick={() => onLanguageChange(l as Language)}
                   >
                       {l.toUpperCase()}
                   </div>
               ))}
           </div>
        </div>
      </div>
    </header>
  );
};
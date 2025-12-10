import React from 'react';
import { PageType, Language } from '../types';
import { Icons, TRANSLATIONS } from '../constants';

interface MobileNavProps {
  currentPage: PageType;
  currentLang: Language;
  onNavigate: (page: PageType) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, currentLang, onNavigate }) => {
  const t = TRANSLATIONS[currentLang];

  const navItems = [
    { id: 'home' as PageType, label: t.nav.home, icon: Icons.Home },
    { id: 'video' as PageType, label: t.nav.video, icon: Icons.Video },
    { id: 'graphic' as PageType, label: t.nav.graphic, icon: Icons.Graphic },
    { id: 'contact' as PageType, label: t.nav.contact, icon: Icons.Contact },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 acrylic-material border-t border-[var(--color-neutral-stroke-2)] pb-safe transition-colors duration-300">
      <div className="flex items-center justify-around h-[60px]">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform"
            >
              <div className={`
                transition-colors duration-200
                ${isActive ? 'text-[var(--color-brand-background)]' : 'text-[var(--color-text-tertiary)]'}
              `}>
                <Icon active={isActive} />
              </div>
              <span className={`
                text-[10px] font-medium transition-colors duration-200
                ${isActive ? 'text-[var(--color-brand-background)]' : 'text-[var(--color-text-tertiary)]'}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-wedding-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-wedding-800 flex items-center justify-center text-wedding-100 font-serif font-bold italic">
            D
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg text-slate-900 tracking-tight">
              {t('title')} <span className="text-wedding-600">AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-sans">{t('subtitle')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Language Toggle */}
          <div className="flex items-center p-1 bg-wedding-50 border border-wedding-200 rounded-lg">
            <button 
              onClick={() => setLanguage('vi')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'vi' ? 'bg-wedding-600 text-white shadow-sm' : 'text-slate-500 hover:text-wedding-700'}`}
            >
              TIẾNG VIỆT
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'en' ? 'bg-wedding-600 text-white shadow-sm' : 'text-slate-500 hover:text-wedding-700'}`}
            >
              ENGLISH
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 pl-4 border-l border-wedding-200">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs">{t('activeModel')}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
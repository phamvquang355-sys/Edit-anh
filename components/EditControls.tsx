
import React from 'react';
import { EditOptions } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface EditControlsProps {
  options: EditOptions;
  setOptions: React.Dispatch<React.SetStateAction<EditOptions>>;
}

export const EditControls: React.FC<EditControlsProps> = ({ options, setOptions }) => {
  const { t } = useLanguage();
  
  const handleChange = (key: keyof EditOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-wedding-100/50 rounded-lg border border-wedding-200">
        <p className="text-sm text-wedding-800 font-medium">
          {t('editInstructions')}
        </p>
      </div>

      {/* Additional Prompt */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-wedding-900 uppercase tracking-widest">{t('additionalPrompt')}</label>
        <textarea
          value={options.additionalPrompt}
          onChange={(e) => handleChange('additionalPrompt', e.target.value)}
          placeholder={t('additionalPromptPlaceholder')}
          className="w-full p-3 bg-white border border-wedding-200 rounded-md focus:ring-2 focus:ring-wedding-400 outline-none text-slate-700 text-sm h-32 resize-none"
        />
      </div>

       {/* Settings: Count only */}
       <div className="space-y-4 pb-4 border-t border-wedding-200 pt-4">
        <label className="text-xs font-bold text-wedding-900 uppercase tracking-widest">{t('imageSettings')}</label>
        
        {/* Count Selector */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{t('numberOfImages')}</span>
          <div className="flex bg-wedding-100 rounded-lg p-1">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => handleChange('imageCount', num)}
                className={`w-8 h-7 rounded-md text-xs font-bold transition-all ${
                  options.imageCount === num 
                    ? 'bg-wedding-800 text-white shadow-sm' 
                    : 'text-wedding-800 hover:bg-wedding-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

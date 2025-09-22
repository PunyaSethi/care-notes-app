// LanguageToggle.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Simple language toggle. Uses the shared LanguageContext.
 * This avoids depending on a Switch component that might not exist in all projects.
 */

const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-600 font-medium">EN</span>
      <Button onClick={toggleLanguage} aria-label={language === 'en' ? t('Convert to Hindi') : t('Convert to English')}>
        {language === 'en' ? 'हिन्दी' : 'EN'}
      </Button>
      <span className="text-sm text-slate-600 font-medium">हिं</span>
    </div>
  );
};

export default LanguageToggle;

"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { Globe } from 'lucide-react';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="gap-2"
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{language === 'en' ? 'العربية' : 'English'}</span>
    </Button>
  );
};

export default LanguageToggle;
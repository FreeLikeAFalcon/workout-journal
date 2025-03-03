
import React, { useState } from 'react';
import { Check, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Language = 'de' | 'en';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const [language, setLanguage] = useState<Language>('de');
  
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    // In a real application, you would use i18n here
    // For example: i18n.changeLanguage(newLanguage);
    console.log(`Language changed to: ${newLanguage}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <button className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-secondary/50 transition-colors">
          <Globe size={16} />
          <span className="text-sm uppercase">{language}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => handleLanguageChange('de')}
        >
          Deutsch
          {language === 'de' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => handleLanguageChange('en')}
        >
          English
          {language === 'en' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;

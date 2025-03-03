
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define all available languages
export type Language = 'de' | 'en';

// Define translations structure
export type TranslationKey = 
  | 'workouts.total'
  | 'exercises.total'
  | 'sets.total'
  | 'exercise.mostFrequent'
  | 'metrics.currentWeight'
  | 'metrics.weightGoal'
  | 'metrics.bodyFat'
  | 'metrics.muscleMass'
  | 'workoutHistory'
  | 'widgets.customize'
  | 'widgets.none'
  | 'save'
  | 'cancel'
  | 'profile'
  | 'signOut'
  | 'signIn'
  | 'myAccount'
  | 'journey';

// Define translations for each language
const translations: Record<Language, Record<TranslationKey, string>> = {
  de: {
    'workouts.total': 'Workouts Gesamt',
    'exercises.total': 'Übungen Gesamt',
    'sets.total': 'Sätze Gesamt',
    'exercise.mostFrequent': 'Häufigste Übung',
    'metrics.currentWeight': 'Aktuelles Gewicht',
    'metrics.weightGoal': 'Gewichtsziel',
    'metrics.bodyFat': 'Körperfettanteil',
    'metrics.muscleMass': 'Muskelmasse',
    'workoutHistory': 'Workout-Verlauf',
    'widgets.customize': 'Widgets anpassen',
    'widgets.none': 'Keine Widgets ausgewählt. Klicke auf das Zahnrad, um Widgets hinzuzufügen.',
    'save': 'Speichern',
    'cancel': 'Abbrechen',
    'profile': 'Profil',
    'signOut': 'Abmelden',
    'signIn': 'Anmelden',
    'myAccount': 'Mein Account',
    'journey': 'Here begins your journey'
  },
  en: {
    'workouts.total': 'Total Workouts',
    'exercises.total': 'Total Exercises',
    'sets.total': 'Total Sets',
    'exercise.mostFrequent': 'Most Frequent Exercise',
    'metrics.currentWeight': 'Current Weight',
    'metrics.weightGoal': 'Weight Goal',
    'metrics.bodyFat': 'Body Fat',
    'metrics.muscleMass': 'Muscle Mass',
    'workoutHistory': 'Workout History',
    'widgets.customize': 'Customize Widgets',
    'widgets.none': 'No widgets selected. Click the gear icon to add widgets.',
    'save': 'Save',
    'cancel': 'Cancel',
    'profile': 'Profile',
    'signOut': 'Sign Out',
    'signIn': 'Sign In',
    'myAccount': 'My Account',
    'journey': 'Here begins your journey'
  }
};

// Create language context
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('de');

  // Load language from localStorage on initial mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['de', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

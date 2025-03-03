
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
  | 'journey'
  | 'loading'
  | 'welcome.back'
  | 'create.account'
  | 'login.to.continue'
  | 'register.to.start'
  | 'login'
  | 'register'
  | 'email'
  | 'email.placeholder'
  | 'password'
  | 'logging.in'
  | 'username'
  | 'username.placeholder'
  | 'registering'
  | 'welcome.title'
  | 'welcome.subtitle'
  | 'error'
  | 'success'
  | 'please.fill.all.fields'
  | 'password.too.short'
  | 'registration.successful'
  | 'registration.failed';

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
    'journey': 'Deine Fitness-Reise beginnt hier',
    'loading': 'Laden...',
    'welcome.back': 'Willkommen zurück',
    'create.account': 'Konto erstellen',
    'login.to.continue': 'Melde dich an, um fortzufahren',
    'register.to.start': 'Registriere dich, um zu beginnen',
    'login': 'Anmelden',
    'register': 'Registrieren',
    'email': 'E-Mail',
    'email.placeholder': 'deine@email.de',
    'password': 'Passwort',
    'logging.in': 'Wird angemeldet...',
    'username': 'Benutzername',
    'username.placeholder': 'dein_benutzername',
    'registering': 'Wird registriert...',
    'welcome.title': 'Verfolge deinen Fortschritt, erreiche deine Ziele',
    'welcome.subtitle': 'Die einfachste Möglichkeit, deine Workouts zu protokollieren, deine Fortschritte zu verfolgen und deine Fitness zu steigern.',
    'error': 'Fehler',
    'success': 'Erfolg',
    'please.fill.all.fields': 'Bitte fülle alle Felder aus',
    'password.too.short': 'Passwort muss mindestens 6 Zeichen lang sein',
    'registration.successful': 'Registrierung erfolgreich',
    'registration.failed': 'Registrierung fehlgeschlagen'
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
    'journey': 'Your fitness journey starts here',
    'loading': 'Loading...',
    'welcome.back': 'Welcome back',
    'create.account': 'Create an account',
    'login.to.continue': 'Sign in to continue',
    'register.to.start': 'Register to get started',
    'login': 'Login',
    'register': 'Register',
    'email': 'Email',
    'email.placeholder': 'your@email.com',
    'password': 'Password',
    'logging.in': 'Signing in...',
    'username': 'Username',
    'username.placeholder': 'your_username',
    'registering': 'Registering...',
    'welcome.title': 'Track your progress, achieve your goals',
    'welcome.subtitle': 'The easiest way to log your workouts, track your progress, and boost your fitness.',
    'error': 'Error',
    'success': 'Success',
    'please.fill.all.fields': 'Please fill all fields',
    'password.too.short': 'Password must be at least 6 characters',
    'registration.successful': 'Registration successful',
    'registration.failed': 'Registration failed'
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

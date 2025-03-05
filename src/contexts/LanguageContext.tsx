
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'de';

interface Translations {
  [key: string]: {
    en: string;
    de: string;
  };
}

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

// Translations dictionary
const translations: Translations = {
  // Welcome page
  'welcome.title': {
    en: 'Welcome to WOD-Tracker',
    de: 'Willkommen bei WOD-Tracker',
  },
  'welcome.subtitle': {
    en: 'Your personal fitness journey starts here',
    de: 'Deine persönliche Fitnessreise beginnt hier',
  },
  
  // General
  'dashboard': {
    en: 'Dashboard',
    de: 'Dashboard',
  },
  'workouts': {
    en: 'Workouts',
    de: 'Trainings',
  },
  'metrics': {
    en: 'Metrics',
    de: 'Kennzahlen',
  },
  'profile': {
    en: 'Profile',
    de: 'Profil',
  },
  'save': {
    en: 'Save',
    de: 'Speichern',
  },
  'cancel': {
    en: 'Cancel',
    de: 'Abbrechen',
  },
  'delete': {
    en: 'Delete',
    de: 'Löschen',
  },
  'error': {
    en: 'Error',
    de: 'Fehler',
  },
  'success': {
    en: 'Success',
    de: 'Erfolg',
  },
  'notSet': {
    en: 'Not set',
    de: 'Nicht festgelegt',
  },
  'journey': {
    en: 'Track your fitness journey',
    de: 'Verfolge deine Fitnessreise',
  },
  
  // User Menu
  'signIn': {
    en: 'Sign In',
    de: 'Anmelden',
  },
  'signOut': {
    en: 'Sign Out',
    de: 'Abmelden',
  },
  'myAccount': {
    en: 'My Account',
    de: 'Mein Konto',
  },
  
  // Auth
  'login': {
    en: 'Login',
    de: 'Anmelden',
  },
  'register': {
    en: 'Register',
    de: 'Registrieren',
  },
  'signup': {
    en: 'Sign Up',
    de: 'Registrieren',
  },
  'email': {
    en: 'Email',
    de: 'E-Mail',
  },
  'password': {
    en: 'Password',
    de: 'Passwort',
  },
  'confirmPassword': {
    en: 'Confirm Password',
    de: 'Passwort bestätigen',
  },
  'username': {
    en: 'Username',
    de: 'Benutzername',
  },
  'forgotPassword': {
    en: 'Forgot Password?',
    de: 'Passwort vergessen?',
  },
  'resetPassword': {
    en: 'Reset Password',
    de: 'Passwort zurücksetzen',
  },
  'createAccount': {
    en: 'Create Account',
    de: 'Konto erstellen',
  },
  'create.account': {
    en: 'Create Account',
    de: 'Konto erstellen',
  },
  'welcome.back': {
    en: 'Welcome Back',
    de: 'Willkommen zurück',
  },
  'login.to.continue': {
    en: 'Login to continue your fitness journey',
    de: 'Melde dich an, um deine Fitnessreise fortzusetzen',
  },
  'register.to.start': {
    en: 'Register to start your fitness journey',
    de: 'Registriere dich, um deine Fitnessreise zu beginnen',
  },
  'alreadyHaveAccount': {
    en: 'Already have an account?',
    de: 'Bereits ein Konto?',
  },
  'dontHaveAccount': {
    en: 'Don\'t have an account?',
    de: 'Noch kein Konto?',
  },
  'sendResetLink': {
    en: 'Send Reset Link',
    de: 'Zurücksetzen-Link senden',
  },
  'backToLogin': {
    en: 'Back to Login',
    de: 'Zurück zum Login',
  },
  'loading': {
    en: 'Loading...',
    de: 'Wird geladen...',
  },
  'logging.in': {
    en: 'Logging in...',
    de: 'Anmeldung läuft...',
  },
  'registering': {
    en: 'Registering...',
    de: 'Registrierung läuft...',
  },
  'please.fill.all.fields': {
    en: 'Please fill all fields',
    de: 'Bitte fülle alle Felder aus',
  },
  'password.too.short': {
    en: 'Password must be at least 6 characters',
    de: 'Passwort muss mindestens 6 Zeichen lang sein',
  },
  'registration.successful': {
    en: 'Registration successful',
    de: 'Registrierung erfolgreich',
  },
  'registration.failed': {
    en: 'Registration failed',
    de: 'Registrierung fehlgeschlagen',
  },
  'please.enter.email': {
    en: 'Please enter your email',
    de: 'Bitte gib deine E-Mail-Adresse ein',
  },
  'password.reset.email.sent': {
    en: 'Password reset email sent',
    de: 'E-Mail zum Zurücksetzen des Passworts gesendet',
  },
  'password.reset.failed': {
    en: 'Password reset failed',
    de: 'Fehler beim Zurücksetzen des Passworts',
  },
  'email.placeholder': {
    en: 'your@email.com',
    de: 'deine@email.de',
  },
  'username.placeholder': {
    en: 'Your username',
    de: 'Dein Benutzername',
  },
  
  // Profile
  'weight': {
    en: 'Weight',
    de: 'Gewicht',
  },
  'enterWeight': {
    en: 'Enter your weight',
    de: 'Gib dein Gewicht ein',
  },
  'enterUsername': {
    en: 'Enter username',
    de: 'Benutzername eingeben',
  },
  'editProfile': {
    en: 'Edit Profile',
    de: 'Profil bearbeiten',
  },
  'profileInformation': {
    en: 'Profile Information',
    de: 'Profilinformationen',
  },
  'profileUpdated': {
    en: 'Profile Updated',
    de: 'Profil aktualisiert',
  },
  'profileUpdatedDesc': {
    en: 'Your profile has been successfully updated',
    de: 'Dein Profil wurde erfolgreich aktualisiert',
  },
  'errorUpdatingProfile': {
    en: 'Error updating profile',
    de: 'Fehler beim Aktualisieren des Profils',
  },
  'usernameMinLength': {
    en: 'Username must be at least 3 characters',
    de: 'Benutzername muss mindestens 3 Zeichen lang sein',
  },
  
  // New email and account deletion
  'changeEmail': {
    en: 'Change Email',
    de: 'E-Mail ändern',
  },
  'newEmail': {
    en: 'New Email',
    de: 'Neue E-Mail',
  },
  'enterNewEmail': {
    en: 'Enter new email address',
    de: 'Neue E-Mail-Adresse eingeben',
  },
  'currentPassword': {
    en: 'Current Password',
    de: 'Aktuelles Passwort',
  },
  'enterCurrentPassword': {
    en: 'Enter your current password',
    de: 'Gib dein aktuelles Passwort ein',
  },
  'emailUpdateRequested': {
    en: 'Email Update Requested',
    de: 'E-Mail-Änderung angefordert',
  },
  'checkInboxForConfirmation': {
    en: 'Please check your inbox for confirmation',
    de: 'Bitte überprüfe dein Postfach für die Bestätigung',
  },
  'errorUpdatingEmail': {
    en: 'Error updating email',
    de: 'Fehler beim Aktualisieren der E-Mail',
  },
  'invalidEmail': {
    en: 'Invalid email address',
    de: 'Ungültige E-Mail-Adresse',
  },
  'passwordMinLength': {
    en: 'Password must be at least 6 characters',
    de: 'Passwort muss mindestens 6 Zeichen lang sein',
  },
  'dangerZone': {
    en: 'Danger Zone',
    de: 'Gefahrenbereich',
  },
  'deleteAccount': {
    en: 'Delete Account',
    de: 'Konto löschen',
  },
  'deleteAccountDescription': {
    en: 'Permanently delete your account and all of your data',
    de: 'Lösche dein Konto und alle deine Daten dauerhaft',
  },
  'permanentlyDeleteAccount': {
    en: 'Permanently Delete Account',
    de: 'Konto dauerhaft löschen',
  },
  'deleteAccountWarning': {
    en: 'This action cannot be undone. This will permanently delete your account and remove all your data from our servers.',
    de: 'Diese Aktion kann nicht rückgängig gemacht werden. Dein Konto wird dauerhaft gelöscht und alle deine Daten werden von unseren Servern entfernt.',
  },
  'confirmDeletion': {
    en: 'Confirm Deletion',
    de: 'Löschung bestätigen',
  },
  'typeDeleteToConfirm': {
    en: 'Type DELETE to confirm',
    de: 'Tippe DELETE zur Bestätigung',
  },
  'passwordRequired': {
    en: 'Password is required',
    de: 'Passwort ist erforderlich',
  },
  'incorrectPassword': {
    en: 'Incorrect password',
    de: 'Falsches Passwort',
  },
  'accountDeleted': {
    en: 'Account Deleted',
    de: 'Konto gelöscht',
  },
  'accountDeletedDescription': {
    en: 'Your account has been successfully deleted',
    de: 'Dein Konto wurde erfolgreich gelöscht',
  },
  'errorDeletingAccount': {
    en: 'Error deleting account',
    de: 'Fehler beim Löschen des Kontos',
  },
  
  // Metrics
  'addMetric': {
    en: 'Add Metric',
    de: 'Kennzahl hinzufügen',
  },
  'metricType': {
    en: 'Metric Type',
    de: 'Kennzahltyp',
  },
  'metricValue': {
    en: 'Value',
    de: 'Wert',
  },
  'metricDate': {
    en: 'Date',
    de: 'Datum',
  },
  'metricAdded': {
    en: 'Metric Added',
    de: 'Kennzahl hinzugefügt',
  },
  'errorAddingMetric': {
    en: 'Error adding metric',
    de: 'Fehler beim Hinzufügen der Kennzahl',
  },
  
  // Workouts
  'addWorkout': {
    en: 'Add Workout',
    de: 'Training hinzufügen',
  },
  'workoutDate': {
    en: 'Workout Date',
    de: 'Trainingsdatum',
  },
  'workoutName': {
    en: 'Workout Name',
    de: 'Trainingsname',
  },
  'exercises': {
    en: 'Exercises',
    de: 'Übungen',
  },
  'addExercise': {
    en: 'Add Exercise',
    de: 'Übung hinzufügen',
  },
  'exerciseName': {
    en: 'Exercise Name',
    de: 'Übungsname',
  },
  'sets': {
    en: 'Sets',
    de: 'Sätze',
  },
  'reps': {
    en: 'Reps',
    de: 'Wiederholungen',
  },
  'kg': {
    en: 'kg',
    de: 'kg',
  },
  'lb': {
    en: 'lb',
    de: 'lb',
  },
  'addSet': {
    en: 'Add Set',
    de: 'Satz hinzufügen',
  },
  'removeExercise': {
    en: 'Remove Exercise',
    de: 'Übung entfernen',
  },
  'workoutAdded': {
    en: 'Workout Added',
    de: 'Training hinzugefügt',
  },
  'errorAddingWorkout': {
    en: 'Error adding workout',
    de: 'Fehler beim Hinzufügen des Trainings',
  },
  
  // Dashboard and Widget Keys
  'workouts.total': {
    en: 'Total Workouts',
    de: 'Workouts gesamt',
  },
  'exercises.total': {
    en: 'Total Exercises',
    de: 'Übungen gesamt',
  },
  'sets.total': {
    en: 'Total Sets', 
    de: 'Sätze gesamt',
  },
  'exercise.mostFrequent': {
    en: 'Most Frequent Exercise',
    de: 'Häufigste Übung',
  },
  'metrics.currentWeight': {
    en: 'Current Weight',
    de: 'Aktuelles Gewicht',
  },
  'metrics.weightGoal': {
    en: 'Weight Goal',
    de: 'Gewichtsziel',
  },
  'metrics.bodyFat': {
    en: 'Body Fat',
    de: 'Körperfett',
  },
  'metrics.muscleMass': {
    en: 'Muscle Mass',
    de: 'Muskelmasse',
  },
  'widgets.customize': {
    en: 'Customize Widgets',
    de: 'Widgets anpassen',
  },
  'widgets.none': {
    en: 'No widgets to display',
    de: 'Keine Widgets zum Anzeigen',
  },
  'workoutHistory': {
    en: 'Workout History',
    de: 'Trainingshistorie',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize language from localStorage or default to browser language
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'de')) {
      return savedLanguage;
    }
    // Default to browser language if available and supported
    const browserLang = navigator.language.substring(0, 2).toLowerCase();
    return browserLang === 'de' ? 'de' : 'en';
  });

  // Set language and save to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Function to get translation for a key
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

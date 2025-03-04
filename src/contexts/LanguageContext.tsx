import React, { createContext, useContext, useState } from "react";
import i18n from "@/integrations/i18n";

export type Language = 'en' | 'de';

type LanguageContextType = {
  t: (key: string) => string;
  i18n: typeof i18n;
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(i18n.language as Language);

  // Function to change the language
  const changeLanguage = (lng: Language) => {
    i18n.changeLanguage(lng).then(() => {
      setLanguage(lng);
    });
  };
  
  // Simple translation function
  const t = (key: string): string => {
    const currentLanguage = language as keyof typeof translations;
    return translations[currentLanguage]?.[key as keyof (typeof translations)[typeof currentLanguage]] || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      t, 
      i18n, 
      language, 
      setLanguage: changeLanguage 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Define translations
const translations = {
  en: {
    dashboard: "Dashboard",
    workouts: "Workouts",
    exercises: "Exercises",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    pleaseWait: "Please wait...",
    welcome: "Welcome",
    "welcome.title": "Track Your Fitness Journey",
    "welcome.subtitle": "Log your workouts, track your progress, and achieve your fitness goals with our intuitive tracking app.",
    "welcome.back": "Welcome Back!",
    "create.account": "Create Account",
    "login.to.continue": "Login to continue",
    "register.to.start": "Register to start",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    username: "Username",
    "email.placeholder": "youremail@example.com",
    "username.placeholder": "Your Username",
    "please.fill.all.fields": "Please fill in all fields.",
    "password.too.short": "Password must be at least 6 characters.",
    "registration.successful": "Registration successful!",
    "registration.failed": "Registration failed.",
    "logging.in": "Logging in...",
    registering: "Registering...",
    "email.confirmation.required": "Email Confirmation Required",
    "email.confirmation.description":
      "Please check your email for the confirmation link.",
    "forgot.password": "Forgot password?",
    "reset.password": "Reset Password",
    "reset.password.description":
      "Enter your email to receive a password reset link.",
    "reset.password.email.sent":
      "An email has been sent with instructions to reset your password.",
    "reset.password.failed": "Failed to send reset password email.",
    "please.enter.email": "Please enter your email address.",
    profileInformation: "Profile Information",
    weight: "Weight",
    notSet: "Not set",
    editProfile: "Edit Profile",
    enterUsername: "Enter your username",
    enterWeight: "Enter your weight",
    profileUpdated: "Profile Updated",
    profileUpdatedDesc: "Your profile has been successfully updated.",
    errorUpdatingProfile: "There was an error updating your profile.",
    usernameMinLength: "Username must be at least 3 characters",
    save: "Save",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    updatePassword: "Update Password",
    passwordUpdated: "Password Updated",
    passwordUpdatedDesc: "Your password has been successfully updated.",
    errorUpdatingPassword: "There was an error updating your password.",
    passwordMinLength: "Password must be at least 6 characters",
    passwordsDoNotMatch: "Passwords do not match",
    invalidEmail: "Please enter a valid email address",
    enterEmail: "Enter your email",
    emailVerificationNeeded: "Email Verification Required",
    emailVerificationNeededDesc: "Please check your inbox to verify your new email address.",
    deleteAccount: "Delete Account",
    deleteAccountConfirm: "Confirm Account Deletion",
    deleteAccountWarning: "This action cannot be undone. Your account and all associated data will be permanently deleted.",
    enterPasswordToConfirm: "Enter your password to confirm deletion",
    cancel: "Cancel",
    delete: "Delete",
    accountDeleted: "Account Deleted",
    accountDeletedDesc: "Your account has been successfully deleted.",
    errorDeletingAccount: "There was an error deleting your account.",
    journey: "Your Fitness Journey",
    myAccount: "My Account",
    signOut: "Sign Out",
    signIn: "Sign In",
    
    "widgets.customize": "Customize Widgets",
    "workouts.total": "Total Workouts",
    "exercises.total": "Total Exercises",
    "sets.total": "Total Sets",
    "exercise.mostFrequent": "Most Frequent Exercise",
    "metrics.currentWeight": "Current Weight",
    "metrics.weightGoal": "Weight Goal",
    "metrics.bodyFat": "Body Fat",
    "metrics.muscleMass": "Muscle Mass"
  },
  de: {
    dashboard: "Dashboard",
    workouts: "Workouts",
    exercises: "Übungen",
    profile: "Profil",
    settings: "Einstellungen",
    logout: "Abmelden",
    loading: "Laden...",
    error: "Fehler",
    success: "Erfolg",
    pleaseWait: "Bitte warten...",
    welcome: "Willkommen",
    "welcome.title": "Verfolge Deine Fitness-Reise",
    "welcome.subtitle": "Protokolliere Deine Workouts, verfolge Deinen Fortschritt und erreiche Deine Fitnessziele mit unserer intuitiven Tracking-App.",
    "welcome.back": "Willkommen zurück!",
    "create.account": "Konto erstellen",
    "login.to.continue": "Anmelden um fortzufahren",
    "register.to.start": "Registrieren um zu starten",
    login: "Anmelden",
    register: "Registrieren",
    email: "E-Mail",
    password: "Passwort",
    username: "Benutzername",
    "email.placeholder": "deine@email.de",
    "username.placeholder": "Dein Benutzername",
    "please.fill.all.fields": "Bitte fülle alle Felder aus.",
    "password.too.short": "Das Passwort muss mindestens 6 Zeichen lang sein.",
    "registration.successful": "Registrierung erfolgreich!",
    "registration.failed": "Registrierung fehlgeschlagen.",
    "logging.in": "Anmelden...",
    registering: "Registrieren...",
    "email.confirmation.required": "E-Mail-Bestätigung erforderlich",
    "email.confirmation.description":
      "Bitte überprüfe deine E-Mails für den Bestätigungslink.",
    "forgot.password": "Passwort vergessen?",
    "reset.password": "Passwort zurücksetzen",
    "reset.password.description":
      "Gib deine E-Mail ein, um einen Link zum Zurücksetzen deines Passworts zu erhalten.",
    "reset.password.email.sent":
      "Eine E-Mail mit Anweisungen zum Zurücksetzen deines Passworts wurde gesendet.",
    "reset.password.failed":
      "Das Senden der E-Mail zum Zurücksetzen des Passworts ist fehlgeschlagen.",
    "please.enter.email": "Bitte gib deine E-Mail-Adresse ein.",
    profileInformation: "Profilinformationen",
    weight: "Gewicht",
    notSet: "Nicht gesetzt",
    editProfile: "Profil bearbeiten",
    enterUsername: "Gib deinen Benutzernamen ein",
    enterWeight: "Gib dein Gewicht ein",
    profileUpdated: "Profil aktualisiert",
    profileUpdatedDesc: "Dein Profil wurde erfolgreich aktualisiert.",
    errorUpdatingProfile: "Beim Aktualisieren deines Profils ist ein Fehler aufgetreten.",
    usernameMinLength: "Der Benutzername muss mindestens 3 Zeichen lang sein",
    save: "Speichern",
    currentPassword: "Aktuelles Passwort",
    newPassword: "Neues Passwort",
    confirmPassword: "Passwort bestätigen",
    updatePassword: "Passwort aktualisieren",
    passwordUpdated: "Passwort aktualisiert",
    passwordUpdatedDesc: "Dein Passwort wurde erfolgreich aktualisiert.",
    errorUpdatingPassword: "Beim Aktualisieren deines Passworts ist ein Fehler aufgetreten.",
    passwordMinLength: "Das Passwort muss mindestens 6 Zeichen lang sein",
    passwordsDoNotMatch: "Passwörter stimmen nicht überein",
    invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein",
    enterEmail: "E-Mail-Adresse eingeben",
    emailVerificationNeeded: "E-Mail-Bestätigung erforderlich",
    emailVerificationNeededDesc: "Bitte überprüfe deinen Posteingang, um deine neue E-Mail-Adresse zu bestätigen.",
    deleteAccount: "Konto löschen",
    deleteAccountConfirm: "Kontolöschung bestätigen",
    deleteAccountWarning: "Diese Aktion kann nicht rückgängig gemacht werden. Dein Konto und alle zugehörigen Daten werden dauerhaft gelöscht.",
    enterPasswordToConfirm: "Gib dein Passwort ein, um die Löschung zu bestätigen",
    cancel: "Abbrechen",
    delete: "Löschen",
    accountDeleted: "Konto gelöscht",
    accountDeletedDesc: "Dein Konto wurde erfolgreich gelöscht.",
    errorDeletingAccount: "Beim Löschen deines Kontos ist ein Fehler aufgetreten.",
    journey: "Deine Fitness-Reise",
    myAccount: "Mein Konto",
    signOut: "Abmelden",
    signIn: "Anmelden",
    
    "widgets.customize": "Widgets anpassen",
    "workouts.total": "Gesamte Workouts",
    "exercises.total": "Gesamte Übungen",
    "sets.total": "Gesamte Sätze",
    "exercise.mostFrequent": "Häufigste Übung",
    "metrics.currentWeight": "Aktuelles Gewicht",
    "metrics.weightGoal": "Gewichtsziel",
    "metrics.bodyFat": "Körperfett",
    "metrics.muscleMass": "Muskelmasse"
  }
} as const;

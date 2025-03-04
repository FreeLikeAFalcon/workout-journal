import React, { createContext, useContext } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/integrations/i18n";

type LanguageContextType = {
  t: (key: keyof typeof translations.en) => string;
  i18n: typeof i18n;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { t } = useTranslation();

  return (
    <LanguageContext.Provider value={{ t, i18n }}>
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

// Update the 'en' translations
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
    welcome.back: "Welcome Back!",
    create.account: "Create Account",
    login.to.continue: "Login to continue",
    register.to.start: "Register to start",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    username: "Username",
    email.placeholder: "youremail@example.com",
    username.placeholder: "Your Username",
    please.fill.all.fields: "Please fill in all fields.",
    password.too.short: "Password must be at least 6 characters.",
    success: "Success",
    registration.successful: "Registration successful!",
    registration.failed: "Registration failed.",
    logging.in: "Logging in...",
    registering: "Registering...",
    email.confirmation.required: "Email Confirmation Required",
    email.confirmation.description:
      "Please check your email for the confirmation link.",
    forgot.password: "Forgot password?",
    reset.password: "Reset Password",
    reset.password.description:
      "Enter your email to receive a password reset link.",
    reset.password.email.sent:
      "An email has been sent with instructions to reset your password.",
    reset.password.failed: "Failed to send reset password email.",
    please.enter.email: "Please enter your email address.",
    profileInformation: "Profile Information",
    username: "Username",
    email: "Email",
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
    password: "Password",
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
    welcome.back: "Willkommen zurück!",
    create.account: "Konto erstellen",
    login.to.continue: "Anmelden um fortzufahren",
    register.to.start: "Registrieren um zu starten",
    login: "Anmelden",
    register: "Registrieren",
    email: "E-Mail",
    password: "Passwort",
    username: "Benutzername",
    email.placeholder: "deine@email.de",
    username.placeholder: "Dein Benutzername",
    please.fill.all.fields: "Bitte fülle alle Felder aus.",
    password.too.short: "Das Passwort muss mindestens 6 Zeichen lang sein.",
    success: "Erfolg",
    registration.successful: "Registrierung erfolgreich!",
    registration.failed: "Registrierung fehlgeschlagen.",
    logging.in: "Anmelden...",
    registering: "Registrieren...",
    email.confirmation.required: "E-Mail-Bestätigung erforderlich",
    email.confirmation.description:
      "Bitte überprüfe deine E-Mails für den Bestätigungslink.",
    forgot.password: "Passwort vergessen?",
    reset.password: "Passwort zurücksetzen",
    reset.password.description:
      "Gib deine E-Mail ein, um einen Link zum Zurücksetzen deines Passworts zu erhalten.",
    reset.password.email.sent:
      "Eine E-Mail mit Anweisungen zum Zurücksetzen deines Passworts wurde gesendet.",
    reset.password.failed:
      "Das Senden der E-Mail zum Zurücksetzen des Passworts ist fehlgeschlagen.",
    please.enter.email: "Bitte gib deine E-Mail-Adresse ein.",
    profileInformation: "Profilinformationen",
    username: "Benutzername",
    email: "E-Mail",
    weight: "Gewicht",
    notSet: "Nicht gesetzt",
    editProfile: "Profil bearbeiten",
    enterUsername: "Gib deinen Benutzernamen ein",
    enterWeight: "Gib dein Gewicht ein",
    profileUpdated: "Profil aktualisiert",
    profileUpdatedDesc: "Dein Profil wurde erfolgreich aktualisiert.",
    errorUpdatingProfile:
      "Beim Aktualisieren deines Profils ist ein Fehler aufgetreten.",
    usernameMinLength: "Der Benutzername muss mindestens 3 Zeichen lang sein",
    save: "Speichern",
    password: "Passwort",
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
  },
} as const;

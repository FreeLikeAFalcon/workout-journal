import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Dumbbell, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Auth: React.FC = () => {
  const { signIn, signUp, user, loading, isEmailConfirmed, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const query = new URLSearchParams(location.search);
  const defaultTab = query.get("tab") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  useEffect(() => {
    if (user && isEmailConfirmed) {
      navigate("/dashboard");
    }
  }, [user, navigate, isEmailConfirmed]);

  useEffect(() => {
    const tabFromQuery = query.get("tab") === "register" ? "register" : "login";
    setActiveTab(tabFromQuery);
  }, [location.search]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: t('error'),
        description: t('please.fill.all.fields'),
        variant: "destructive",
      });
      return;
    }
    
    try {
      setFormLoading(true);
      await signIn(email, password);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      toast({
        title: t('error'),
        description: t('please.fill.all.fields'),
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: t('error'),
        description: t('password.too.short'),
        variant: "destructive",
      });
      return;
    }
    
    try {
      setFormLoading(true);
      await signUp(email, password, username);
      toast({
        title: t('success'),
        description: t('registration.successful'),
      });
      setEmail("");
      setPassword("");
      setUsername("");
      setShowEmailConfirmation(true);
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: t('error'),
        description: error?.message || t('registration.failed'),
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: t('error'),
        description: t('please.enter.email'),
        variant: "destructive",
      });
      return;
    }
    
    try {
      setFormLoading(true);
      const redirectUrl = window.location.origin + '/auth?tab=login';
      await resetPassword(email, redirectUrl);
      setResetSent(true);
      toast({
        title: t('success'),
        description: t('password.reset.email.sent'),
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: t('error'),
        description: error?.message || t('password.reset.failed'),
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse text-lg">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-8">
        <Dumbbell size={32} className="text-accent" />
        <h1 className="font-display text-3xl font-semibold">Wod-Tracker</h1>
      </div>

      {showEmailConfirmation ? (
        <Card className="w-full max-w-md glass-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              E-Mail-Bestätigung erforderlich
            </CardTitle>
            <CardDescription className="text-center">
              Bitte überprüfe deine E-Mails und klicke auf den Bestätigungslink.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 dark:bg-blue-900/30">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>E-Mail gesendet</AlertTitle>
              <AlertDescription>
                Wir haben eine E-Mail an {email} gesendet. Bitte klicke auf den Link in der E-Mail, um deine Registrierung abzuschließen.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-center text-muted-foreground">
              Nach der Bestätigung kannst du dich mit deinen Zugangsdaten anmelden.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setShowEmailConfirmation(false)} className="w-full">
              Zurück zum Login
            </Button>
          </CardFooter>
        </Card>
      ) : showForgotPassword ? (
        <Card className="w-full max-w-md glass-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {resetSent ? "E-Mail gesendet" : "Passwort zurücksetzen"}
            </CardTitle>
            <CardDescription className="text-center">
              {resetSent 
                ? "Überprüfe deine E-Mails für den Passwort-Reset-Link" 
                : "Gib deine E-Mail-Adresse ein, um einen Link zum Zurücksetzen des Passworts zu erhalten"}
            </CardDescription>
          </CardHeader>
          
          {!resetSent ? (
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">E-Mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="deine@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={formLoading}>
                  {formLoading ? "Wird gesendet..." : "Link zum Zurücksetzen senden"}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center gap-2" 
                  onClick={() => setShowForgotPassword(false)}
                >
                  <ArrowLeft size={16} /> Zurück zum Login
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4">
              <Alert className="bg-green-50 dark:bg-green-900/30">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>E-Mail gesendet</AlertTitle>
                <AlertDescription>
                  Wir haben eine E-Mail an {email} gesendet. Bitte klicke auf den Link in der E-Mail, um dein Passwort zurückzusetzen.
                </AlertDescription>
              </Alert>
              <CardFooter className="flex justify-center p-0">
                <Button 
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                  }} 
                  className="w-full mt-4"
                >
                  Zurück zum Login
                </Button>
              </CardFooter>
            </CardContent>
          )}
        </Card>
      ) : (
        <Card className="w-full max-w-md glass-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {activeTab === "login" ? 
                t('welcome.back') : 
                t('create.account')}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" ? 
                t('login.to.continue') : 
                t('register.to.start')}
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">{t('login')}</TabsTrigger>
              <TabsTrigger value="register">{t('register')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('email.placeholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t('password')}</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="px-0 h-auto text-xs"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Passwort vergessen?
                      </Button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={formLoading}>
                    {formLoading ? (t('logging.in')) : (t('login'))}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t('email.placeholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('username')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder={t('username.placeholder')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                  
                  <Alert className="bg-blue-50 dark:bg-blue-900/30">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Bestätigung erforderlich</AlertTitle>
                    <AlertDescription>
                      Nach der Registrierung erhältst du eine E-Mail mit einem Bestätigungslink. Erst nach Bestätigung kannst du dich anmelden.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={formLoading}>
                    {formLoading ? (t('registering')) : (t('register'))}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};

export default Auth;

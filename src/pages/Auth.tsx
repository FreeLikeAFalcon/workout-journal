
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Dumbbell, Mail, Lock, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

const Auth: React.FC = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  
  const query = new URLSearchParams(location.search);
  const defaultTab = query.get("tab") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    const tabFromQuery = query.get("tab") === "register" ? "register" : "login";
    setActiveTab(tabFromQuery);
  }, [location.search]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: t('error'),
        description: t('please.fill.all.fields') || "Please fill all fields",
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
        description: t('please.fill.all.fields') || "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: t('error'),
        description: t('password.too.short') || "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setFormLoading(true);
      await signUp(email, password, username);
      toast({
        title: t('success'),
        description: t('registration.successful') || "Registration successful",
      });
      setEmail("");
      setPassword("");
      setUsername("");
      // Don't automatically switch to login tab as we might need email verification
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: t('error'),
        description: error?.message || t('registration.failed') || "Registration failed",
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
                  <Label htmlFor="password">{t('password')}</Label>
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
                  {formLoading ? (t('logging.in') || "Wird angemeldet...") : (t('login') || "Anmelden")}
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
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={formLoading}>
                  {formLoading ? (t('registering') || "Wird registriert...") : (t('register') || "Registrieren")}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;

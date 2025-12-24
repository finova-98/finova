import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Handle email change with validation
  const handleEmailChange = (email: string) => {
    setForm({ ...form, email });
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  // Handle password change with validation
  const handlePasswordChange = (password: string) => {
    setForm({ ...form, password });
    if (password && !validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!form.email) {
      setEmailError("Email is required");
      toast({
        title: "Validation Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(form.email)) {
      setEmailError("Please enter a valid email address");
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address (e.g., user@example.com)",
        variant: "destructive",
      });
      return;
    }

    // Validate password
    if (!form.password) {
      setPasswordError("Password is required");
      toast({
        title: "Validation Error",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(form.password)) {
      setPasswordError("Password must be at least 6 characters");
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    // Validate confirm password for signup
    if (!isLogin && form.password !== form.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(form.email, form.password);
        if (!error) {
          navigate('/dashboard');
        } else {
          toast({
            title: "Sign In Failed",
            description: error.message || "Invalid email or password",
            variant: "destructive",
          });
        }
      } else {
        const { error } = await signUp(form.email, form.password);
        if (!error) {
          toast({
            title: "Account Created!",
            description: "Please check your email to verify your account",
          });
        } else {
          toast({
            title: "Sign Up Failed",
            description: error.message || "Failed to create account",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center h-14 px-4">
          <Button
            variant="icon"
            size="icon-sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-soft-lg">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLogin
                ? "Sign in to your account"
                : "Get started with FinanceAI"}
            </p>
          </div>

          {/* Form Card */}
          <Card className="animate-fade-in-up stagger-1">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`pl-11 ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-destructive">{emailError}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className={`pl-11 pr-11 ${passwordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs text-destructive">{passwordError}</p>
                  )}
                </div>

                {/* Confirm Password (Sign Up only) */}
                {!isLogin && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-sm font-medium text-foreground">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className="pl-11"
                        required
                      />
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </div>
                  ) : (
                    isLogin ? "Sign In" : "Create Account"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Switch Auth Mode */}
          <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in-up stagger-2">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

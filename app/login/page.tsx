"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import type { Auth, GoogleAuthProvider } from "firebase/auth";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  if (user) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    if (!auth) {
      setError("Authentication unavailable");
      setIsLoading(false);
      return;
    }
    try {
      const safeAuth = auth as unknown as Auth;
      if (isLogin) {
        await signInWithEmailAndPassword(safeAuth, email, password);
      } else {
        await createUserWithEmailAndPassword(safeAuth, email, password);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    if (!auth || !googleProvider) {
      setError("Google sign-in is unavailable");
      setIsLoading(false);
      return;
    }
    try {
      const safeAuth = auth as unknown as Auth;
      const safeProvider = googleProvider as unknown as GoogleAuthProvider;
      await signInWithPopup(safeAuth, safeProvider);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[oklch(0.97_0.005_264)] dark:bg-background">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 mb-8"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground fill-current" />
        </div>
        <span className="text-xl font-bold text-foreground tracking-tight">QuizAI</span>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-sm"
      >
        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-3xl font-black tracking-tight text-foreground leading-tight mb-2">
            {isLogin ? "Welcome to QuizAI" : "Create your QuizAI account"}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {isLogin
              ? "Enter your credentials to access the monolith"
              : "Join the monolith today"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-5">
          {/* Name (sign-up only) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className={cn(
                  "w-full border-0 border-b-2 border-border bg-transparent pb-2 pt-1 text-sm text-foreground placeholder:text-muted-foreground/50",
                  "focus:outline-none focus:border-primary transition-colors"
                )}
              />
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-foreground">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="name@institution.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={cn(
                "w-full border-0 border-b-2 border-border bg-transparent pb-2 pt-1 text-sm text-foreground placeholder:text-muted-foreground/50",
                "focus:outline-none focus:border-primary transition-colors"
              )}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                Passphrase
              </label>
              {isLogin && (
                <button
                  type="button"
                  className="text-[11px] font-bold uppercase tracking-wider text-primary hover:opacity-70 transition-opacity"
                >
                  Forgot?
                </button>
              )}
            </div>
            <input
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={cn(
                "w-full border-0 border-b-2 border-border bg-transparent pb-2 pt-1 text-sm text-foreground placeholder:text-muted-foreground/50",
                "focus:outline-none focus:border-primary transition-colors tracking-widest"
              )}
            />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 text-destructive text-xs px-3 py-2.5 rounded-lg"
            >
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {/* Submit */}
          <Button
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm cursor-pointer mt-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
          </div>
        </div>

        {/* Google */}
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={handleGoogleLogin}
          className="w-full h-11 rounded-xl border-border font-medium text-sm cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {isLogin ? "Sign in with Google" : "Sign up with Google"}
        </Button>

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground mt-5">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-primary font-semibold hover:opacity-70 transition-opacity"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

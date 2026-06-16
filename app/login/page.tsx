"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import type { Auth, GoogleAuthProvider } from "firebase/auth";
import { 
  Loader2, AlertCircle, Eye, EyeOff, Mail, Lock, User, 
  Trophy, Brain, Rocket, Users, FileText, Star, 
  BrainCircuit, LineChart, Target, Globe,
  CheckCircle2, ClipboardList, Clock, Sparkles
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/* ─────────────────────────────────────────────────────────────────────────────
 * Decorative Components
 * ───────────────────────────────────────────────────────────────────────────── */

function LoginFloatingElements() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, rotate: 0 }}
      animate={{ opacity: 1, x: 0, rotate: -4 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute top-0 right-0 w-[240px] z-20 pointer-events-none"
    >
      {/* Quiz Card */}
      <div className="bg-[#1a1a1a] border border-white/5 shadow-2xl rounded-2xl p-4 shadow-black/50">
        <p className="text-[11px] text-[#ededed] font-medium leading-relaxed mb-3">
          Which planet is<br />known as the Red Planet?
        </p>
        <div className="space-y-1.5">
          {["Earth", "Mars", "Jupiter", "Venus"].map((opt, i) => {
            const labels = ["A", "B", "C", "D"];
            const isMars = opt === "Mars";
            return (
              <div 
                key={opt} 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px]",
                  isMars 
                    ? "border-primary/50 text-primary bg-primary/5" 
                    : "border-white/5 text-[#a0a0a0]"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-4 h-4 rounded-full border text-[8px]",
                  isMars ? "border-primary text-primary" : "border-white/20 text-[#a0a0a0]"
                )}>
                  {labels[i]}
                </div>
                {opt}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Trophy */}
      <motion.div 
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-6 top-[60%] bg-[#141414] border border-primary/20 p-2.5 rounded-xl shadow-xl z-30"
      >
        <Trophy className="w-5 h-5 text-primary" />
      </motion.div>

      {/* Floating Progress Chart */}
      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -right-8 -bottom-6 bg-[#1a1a1a] border border-white/5 p-3 rounded-xl shadow-xl w-32 z-10 rotate-[8deg]"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] text-[#a0a0a0]">Your Progress</span>
          <span className="text-[9px] text-primary font-bold">↑ 78%</span>
        </div>
        <svg viewBox="0 0 100 30" className="w-full h-8 overflow-visible">
          <path 
            d="M 0 25 L 20 20 L 40 22 L 60 12 L 80 15 L 100 5" 
            fill="none" 
            stroke="var(--primary)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <circle cx="100" cy="5" r="2.5" fill="var(--primary)" />
          <circle cx="60" cy="12" r="2" fill="var(--primary)" />
          <circle cx="20" cy="20" r="2" fill="var(--primary)" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

function SignupFloatingElements() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, rotate: 0 }}
      animate={{ opacity: 1, x: 0, rotate: 2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute top-0 right-0 w-[240px] z-20 pointer-events-none"
    >
      {/* Generated Card */}
      <div className="bg-[#1a1a1a] border border-white/5 shadow-2xl rounded-2xl p-4 shadow-black/50">
        <div className="flex items-center gap-1.5 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-[11px] text-emerald-500 font-bold">AI Quiz Generated!</span>
        </div>
        
        <div className="flex gap-1.5 mb-4">
          <span className="px-2 py-1 bg-white/5 text-white text-[9px] rounded-md border border-white/5">General Knowledge</span>
          <span className="px-2 py-1 bg-[#b8742f]/20 text-[#c9823a] text-[9px] rounded-md border border-[#b8742f]/30">Medium</span>
        </div>

        <div className="flex justify-between items-center px-1 mb-4">
          <div className="flex flex-col items-center text-center gap-1">
            <ClipboardList className="w-4 h-4 text-[#4baee1]" />
            <span className="text-[10px] font-bold text-white">10</span>
            <span className="text-[7px] text-[#a0a0a0] uppercase">Questions</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-white">5</span>
            <span className="text-[7px] text-[#a0a0a0] uppercase">Minutes</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold text-white">+25</span>
            <span className="text-[7px] text-[#a0a0a0] uppercase">XP</span>
          </div>
        </div>

        <div className="w-full py-2 bg-primary rounded-lg text-white text-[11px] font-bold text-center">
          Start Quiz
        </div>
      </div>

      {/* Floating Brain */}
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 -top-4 bg-[#141414] border border-primary/20 p-2.5 rounded-2xl shadow-xl z-30"
      >
        <Brain className="w-6 h-6 text-primary" />
      </motion.div>

      {/* Floating Rocket */}
      <motion.div 
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -right-6 bottom-4 text-2xl z-30 drop-shadow-2xl"
      >
        🚀
      </motion.div>
    </motion.div>
  );
}

function LoginFooter() {
  const items = [
    { icon: BrainCircuit, title: "AI-Powered", desc: "Smart quizzes generated instantly" },
    { icon: LineChart, title: "Track Progress", desc: "Detailed analytics and insights" },
    { icon: Target, title: "Improve Daily", desc: "Practice and level up your knowledge" },
    { icon: Globe, title: "Any Topic", desc: "From science to history, we've got it all" },
  ];
  return (
    <div className="grid grid-cols-4 gap-4 pt-6 mt-8 border-t border-white/5 opacity-80">
      {items.map((item) => (
        <div key={item.title} className="flex flex-col items-center text-center gap-2">
          <item.icon className="w-5 h-5 text-primary" />
          <div>
            <p className="text-[10px] font-bold text-[#ededed]">{item.title}</p>
            <p className="text-[8px] text-[#a0a0a0] mt-0.5 leading-tight">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SignupFooter() {
  const items = [
    { icon: Users, value: "100K+", label: "Students learning", color: "text-[#c9823a]" },
    { icon: FileText, value: "10M+", label: "Quizzes generated", color: "text-[#ededed]" },
    { icon: Star, value: "4.8/5", label: "Student rating", color: "text-[#c9823a]" },
  ];
  return (
    <div className="grid grid-cols-3 gap-8 pt-6 mt-8 border-t border-white/5 opacity-90">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center text-center gap-1.5">
          <div className="flex items-center gap-2">
            <item.icon className={cn("w-5 h-5", item.color)} />
            <span className="text-sm font-bold text-white">{item.value}</span>
          </div>
          <span className="text-[11px] text-[#a0a0a0]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Main Page Component
 * ───────────────────────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const safeAuth = auth as unknown as Auth;
      if (isLogin) {
        await signInWithEmailAndPassword(safeAuth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(safeAuth, email, password);
        if (name) {
          await updateProfile(result.user, { displayName: name });
        }
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

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first to reset your password");
      return;
    }
    if (!auth) return;
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth as Auth, email);
      toast.success("Password reset email sent! Please check your inbox.");
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex justify-center px-4 py-8 md:px-8 relative overflow-x-hidden font-sans select-none">
      {/* Background ambient wave/glow */}
      <div 
        className="fixed bottom-0 left-0 w-[120vw] h-[50vh] opacity-30 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at bottom left, var(--primary) 0%, transparent 60%)",
          filter: "blur(120px)"
        }}
      />
      <div 
        className="fixed bottom-0 left-0 w-full h-[200px] pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)",
          backgroundSize: "32px 32px",
          opacity: 0.1,
          maskImage: "linear-gradient(to top, black, transparent)"
        }}
      />

      {/* Main Content */}
      <div className="w-full max-w-[500px] relative z-10 flex flex-col pt-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 md:mb-12">
          <Image src="/logo.png" alt="QuizAI Logo" width={32} height={32} className="object-contain" />
          <span className="text-xl font-bold text-white tracking-tight font-heading">QuizAI</span>
        </Link>

        {/* Header Text + Floating Cards (Desktop only for cards) */}
        <div className="relative mb-8 flex justify-between items-start">
          <motion.div 
            key={`header-${isLogin}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-2"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-heading">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-[#a0a0a0] text-sm md:text-base">
              {isLogin ? "Continue your learning journey" : "Start learning smarter with AI"}
            </p>
          </motion.div>

          <div className="hidden md:block relative w-[240px] h-0 -mt-6 mr-[-80px]">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <LoginFloatingElements key="login-float" />
              ) : (
                <SignupFloatingElements key="signup-float" />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Form Card */}
        <motion.div 
          layout
          className="bg-[#111111] rounded-[24px] p-6 md:p-8 border border-white/5 shadow-2xl relative z-10"
        >
          <form onSubmit={handleEmailAuth} className="space-y-4">
            
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0a0]">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]/60" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="w-full rounded-xl border border-white/10 bg-[#161616] pl-9 pr-3 py-3 text-sm text-[#ededed] placeholder:text-[#a0a0a0]/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0a0]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]/60" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#161616] pl-9 pr-3 py-3 text-sm text-[#ededed] placeholder:text-[#a0a0a0]/50 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0a0]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#161616] pl-9 pr-10 py-3 text-sm text-[#ededed] placeholder:text-[#a0a0a0]/50 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]/60 hover:text-[#ededed] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0a0]">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]/60" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!isLogin}
                      className="w-full rounded-xl border border-white/10 bg-[#161616] pl-9 pr-10 py-3 text-sm text-[#ededed] placeholder:text-[#a0a0a0]/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]/60 hover:text-[#ededed] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isLogin && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-medium text-[#c9823a] hover:text-primary transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-xs px-3 py-2.5 rounded-xl"
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <Button
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[#c9823a] hover:bg-primary text-white font-semibold text-[15px] cursor-pointer mt-4 shadow-[0_0_20px_rgba(201,130,58,0.2)] border-none"
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

          {isLogin && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#111111] px-4 text-[11px] text-[#a0a0a0]">or</span>
                </div>
              </div>

              {/* Google Button */}
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className="w-full h-12 rounded-xl border border-white/10 bg-[#161616] hover:bg-white/5 text-[#ededed] font-medium text-sm cursor-pointer"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </Button>
            </>
          )}

          {/* Toggle Link */}
          <div className="text-center mt-6 text-sm">
            <span className="text-[#a0a0a0]">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-[#c9823a] font-semibold hover:text-primary transition-colors"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </motion.div>

        {/* Footer Features/Stats */}
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoginFooter />
            </motion.div>
          ) : (
            <motion.div
              key="signup-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SignupFooter />
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}

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
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import type { Auth, GoogleAuthProvider } from "firebase/auth";
import {
  Loader2, AlertCircle, Eye, EyeOff, Mail, Lock, User,
  BrainCircuit, LineChart, Target, Globe,
  Users, FileText, Star,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/* ─── Footer Components ──────────────────────────────────────────────────── */

function LoginFooter() {
  const items = [
    { icon: BrainCircuit, title: "AI-Powered", desc: "Smart quizzes instantly" },
    { icon: LineChart, title: "Track Progress", desc: "Detailed analytics" },
    { icon: Target, title: "Improve Daily", desc: "Level up knowledge" },
    { icon: Globe, title: "Any Topic", desc: "Science to history" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 pt-3 mt-3 border-t border-white/5">
      {items.map((item) => (
        <div key={item.title} className="flex flex-col items-center text-center gap-1">
          <item.icon className="w-4 h-4 text-primary" />
          <p className="text-[9px] font-bold text-[#ededed] leading-tight">{item.title}</p>
          <p className="text-[8px] text-[#a0a0a0] leading-tight hidden sm:block">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

function SignupFooter() {
  const items = [
    { icon: Users, value: "100K+", label: "Students", color: "text-primary" },
    { icon: FileText, value: "10M+", label: "Quizzes", color: "text-[#ededed]" },
    { icon: Star, value: "4.8/5", label: "Rating", color: "text-primary" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-white/5">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center text-center gap-0.5">
          <div className="flex items-center gap-1.5">
            <item.icon className={cn("w-3.5 h-3.5", item.color)} />
            <span className="text-xs font-bold text-white">{item.value}</span>
          </div>
          <span className="text-[9px] text-[#a0a0a0]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */

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
    // Only auto-redirect if the user is verified, or if they signed in via Google (which auto-verifies)
    if (user && (user.emailVerified || !user.providerData.some((p: any) => p.providerId === "password"))) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    if (!auth) { setError("Authentication unavailable"); setIsLoading(false); return; }
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match"); setIsLoading(false); return;
    }
    try {
      const safeAuth = auth as unknown as Auth;
      if (isLogin) {
        const result = await signInWithEmailAndPassword(safeAuth, email, password);
        // Block unverified email/password users
        if (!result.user.emailVerified && result.user.providerData.some((p: any) => p.providerId === "password")) {
          await signOut(safeAuth);
          throw new Error("Please verify your email address before signing in. Check your inbox for the verification link.");
        }
        toast.success("Signed in successfully!");
        router.push("/dashboard");
      } else {
        const result = await createUserWithEmailAndPassword(safeAuth, email, password);
        if (name) await updateProfile(result.user, { displayName: name });
        // Send native Firebase verification email
        await sendEmailVerification(result.user);
        // Sign out immediately so they can't bypass the verification
        await signOut(safeAuth);

        toast.success("Account created successfully!", {
          description: (
            <span>
              Please check your inbox and <span className="font-bold text-destructive animate-pulse text-[13px] tracking-wide">SPAM FOLDER</span> for a verification link.
            </span>
          ),
          duration: Number.POSITIVE_INFINITY
        });
        setIsLogin(true); // Switch to sign-in view
        // Do not push to dashboard yet
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      // Firebase throws 'auth/invalid-credential' or similar. We can make the generic error more helpful
      if (msg.includes("verify your email")) {
        setError("Please verify your email address.");
        toast.error("Email not verified", {
          description: (
            <span>
              Please check your inbox and your <span className="font-bold text-destructive animate-pulse text-[13px] tracking-wide">SPAM FOLDER</span> for the verification link.
            </span>
          ),
          duration: Number.POSITIVE_INFINITY
        });
      } else {
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    if (!auth || !googleProvider) { setError("Google sign-in is unavailable"); setIsLoading(false); return; }
    try {
      await signInWithPopup(auth as unknown as Auth, googleProvider as unknown as GoogleAuthProvider);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError("Please enter your email address first"); return; }
    if (!auth) return;
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth as Auth, email);
      toast.success("Password reset email sent!");
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-white/8 bg-[#161616] pl-9 pr-3 py-2 text-sm text-[#ededed] placeholder:text-[#a0a0a0]/40 focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden relative select-none font-sans">
      {/* Ambient glow */}
      <div
        className="absolute bottom-0 left-0 w-[80vw] h-[50vh] pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at bottom left, var(--primary) 0%, transparent 65%)",
          filter: "blur(100px)",
          opacity: 0.18,
        }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(circle at 1.5px 1.5px, rgba(184,116,47,0.12) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center justify-between px-5 py-3 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
            <Image src="/logo.png" alt="QuizAI" width={28} height={28} className="object-contain" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight font-heading">QuizAI</span>
        </Link>
        {/* Mode badge */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-white/8 bg-white/3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-[#a0a0a0] font-medium">
            {isLogin ? "Sign In" : "Sign Up"}
          </span>
        </div>
      </div>

      {/* Scrollable/flex inner — fills remaining height */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 min-h-0 pb-2">
        <motion.div
          layout
          transition={{ layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
          className="w-full max-w-[420px] bg-[#111111]/90 rounded-2xl border border-white/6 shadow-2xl"
          style={{ backdropFilter: "blur(20px)" }}
        >
          {/* Inner padding */}
          <div className="px-4 py-4 sm:px-5 sm:py-5">
            {/* Header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`hdr-${isLogin}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mb-3"
              >
                <h1 className="text-lg font-bold text-white tracking-tight font-heading">
                  {isLogin ? "Welcome back 👋" : "Create account 🚀"}
                </h1>
                <p className="text-[11px] text-[#a0a0a0] mt-0.5">
                  {isLogin ? "Sign in to continue your learning journey" : "Start learning smarter with AI today"}
                </p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleEmailAuth} className="space-y-2">
              {/* Name (signup) */}
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#a0a0a0]">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a0a0a0]/50" />
                      <input type="text" placeholder="Enter your full name" value={name}
                        onChange={(e) => setName(e.target.value)} required={!isLogin} className={inputClass} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#a0a0a0]">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a0a0a0]/50" />
                  <input type="email" autoComplete="email" placeholder="Enter your Email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#a0a0a0]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a0a0a0]/50" />
                  <input type={showPassword ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                    className={cn(inputClass, "pr-10")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]/50 hover:text-[#ededed] transition-colors">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm password (signup) */}
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#a0a0a0]">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a0a0a0]/50" />
                      <input type={showConfirmPassword ? "text" : "password"} autoComplete="new-password"
                        placeholder="Confirm your password" value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)} required={!isLogin}
                        className={cn(inputClass, "pr-10")} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]/50 hover:text-[#ededed] transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot password */}
              {isLogin && (
                <div className="flex justify-end">
                  <button type="button" onClick={handleForgotPassword}
                    className="text-[10px] font-medium text-[#c9823a] hover:text-primary transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-[11px] px-3 py-2 rounded-xl">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <p className="break-all">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-xl bg-[#c9823a] hover:bg-primary text-white font-semibold text-sm shadow-[0_0_18px_rgba(201,130,58,0.25)] border-none mt-1">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>

            {/* Google + divider (login only) */}
            {isLogin && (
              <>
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#111111] px-3 text-[10px] text-[#a0a0a0]">or</span>
                  </div>
                </div>
                <Button type="button" variant="outline" disabled={isLoading} onClick={handleGoogleLogin}
                  className="w-full h-10 rounded-xl border border-white/10 bg-[#161616] hover:bg-white/5 text-[#ededed] font-medium text-sm">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </Button>
              </>
            )}

            {/* Toggle */}
            <p className="text-center mt-2 text-[11px] text-[#a0a0a0]">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-[#c9823a] font-semibold hover:text-primary transition-colors">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>

            {/* Footer stats / features */}
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div key="lf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <LoginFooter />
                </motion.div>
              ) : (
                <motion.div key="sf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <SignupFooter />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

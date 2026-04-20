"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import type { Auth, GoogleAuthProvider } from "firebase/auth";
import { Loader2, Mail, Lock, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect away
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    if (!auth) {
      setError("Authentication terminal offline");
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
      const msg = err instanceof Error ? err.message : "Handshake failure";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    if (!auth || !googleProvider) {
      setError("External authentication protocol failure");
      setIsLoading(false);
      return;
    }
    try {
      const safeAuth = auth as unknown as Auth;
      const safeProvider = googleProvider as unknown as GoogleAuthProvider;
      await signInWithPopup(safeAuth, safeProvider);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "External provider failure";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 sm:p-12 overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-card/30 border border-border/40 p-12 sm:p-16 rounded-[48px] whisper-shadow backdrop-blur-2xl relative overflow-hidden group hover:bg-card/40 transition-all duration-700"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 -rotate-12 group-hover:rotate-0">
          <Zap className="h-64 w-64 text-primary" />
        </div>
        
        <div className="relative z-10 space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">Secure Authentication Portal</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground font-heading">
              {isLogin ? "Welcome back, Scholar." : "Initiate your journey."}
            </h1>
            <p className="text-[15px] font-bold text-muted-foreground/60 tracking-tight max-w-sm mx-auto leading-relaxed">
              {isLogin 
                ? "Synchronizing your conceptual mastery across the technical atelier." 
                : "Establish your adaptive knowledge graph and track telemetry."
              }
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="space-y-3">
              <div className="group/field relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within/field:text-primary transition-colors" />
                <Input 
                  type="email" 
                  autoComplete="email"
                  placeholder="Universal Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-14 h-16 rounded-[22px] bg-muted/40 border-border/20 focus:border-primary/40 focus:bg-muted/60 transition-all font-bold tracking-tight text-[15px] hover:border-border/60"
                  required
                />
              </div>
              <div className="group/field relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within/field:text-primary transition-colors" />
                <Input 
                  type="password" 
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder="Cryptographic Passphrase"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-14 h-16 rounded-[22px] bg-muted/40 border-border/20 focus:border-primary/40 focus:bg-muted/60 transition-all font-bold tracking-tight text-[15px] hover:border-border/60"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-destructive/5 border border-destructive/10 text-destructive text-[12px] font-black px-5 py-4 rounded-[20px] flex items-start gap-3 uppercase tracking-tighter"
              >
                 <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                 <p>{error}</p>
              </motion.div>
            )}

            <Button 
              disabled={isLoading} 
              className="w-full h-16 rounded-full bg-primary hover:bg-primary/90 transition-all shadow-glow-primary border-0 text-primary-foreground font-black tracking-tighter text-lg cursor-pointer group active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : isLogin ? "Initiate Access" : "Create Entity"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card/0 backdrop-blur-xl px-4 text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.25em]">External Authorization</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            disabled={isLoading} 
            onClick={handleGoogleLogin}
            className="w-full h-16 rounded-full border-border/40 border-2 bg-transparent hover:bg-muted/50 transition-all font-black tracking-tighter text-[15px] cursor-pointer group active:scale-[0.98]"
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
            Google Cloud Index
          </Button>

          <p className="text-center text-[13px] font-bold text-muted-foreground/60 tracking-tight">
            {isLogin ? "New to the atelier? " : "Already established? "}
            <button 
               type="button" 
               onClick={() => setIsLogin(!isLogin)} 
               className="text-primary font-black hover:opacity-70 transition-all uppercase tracking-widest text-[11px] ml-2 border-b-2 border-primary/20"
            >
              {isLogin ? "Synchronize" : "Reconnect"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

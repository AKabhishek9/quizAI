"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ArrowRight, Zap, Lightbulb, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Hardcoded suggestions based on stream. In a real app, this could come from the DB.
const SUGGESTIONS: Record<string, string[]> = {
  "Tech & Software": ["React", "Node.js", "Docker", "Algorithms", "System Design", "AWS", "Python", "TypeScript", "Graph Theory", "Kubernetes"],
  "Pure Sciences": ["Quantum Mechanics", "Organic Chemistry", "Genetics", "Thermodynamics", "Cellular Biology"],
  "Commerce & Finance": ["Microeconomics", "Financial Accounting", "Corporate Finance", "Macroeconomics"],
  "Humanities & General": ["World War 2", "Renaissance Art", "Political Philosophy", "Ancient Rome"],
};

function TopicSelectionEngine() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stream = searchParams.get("stream") || "Tech & Software";
  
  const [topics, setTopics] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(SUGGESTIONS[stream] || SUGGESTIONS["Tech & Software"]);

  // Filter out suggestions that are already picked
  const availableSuggestions = suggestions.filter(s => !topics.includes(s));

  const addTopic = (topic: string) => {
    const cleanTopic = topic.trim();
    if (cleanTopic && !topics.includes(cleanTopic) && topics.length < 5) {
      setTopics([...topics, cleanTopic]);
      setInputValue("");
    }
  };

  const removeTopic = (topic: string) => {
    setTopics(topics.filter(t => t !== topic));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTopic(inputValue);
    }
  };

  const generateQuiz = () => {
    if (topics.length === 0) return;
    const topicsParam = encodeURIComponent(topics.join(","));
    router.push(`/quiz/play?stream=${encodeURIComponent(stream)}&topics=${topicsParam}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mb-2 bg-secondary text-secondary-foreground uppercase tracking-wider text-[10px]">
          {stream}
        </Badge>
        <motion.h1 
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-3xl font-semibold tracking-tight"
        >
          Select Your Topics
        </motion.h1>
        <motion.p 
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="text-muted-foreground text-sm max-w-lg mx-auto"
        >
          Choose up to 5 topics. Our engine will blend them together seamlessly. If a topic is not in our database, our AI will generate questions for it on the fly.
        </motion.p>
      </div>

      <motion.div 
         initial={{ opacity: 0, scale: 0.98 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay: 0.2 }}
         className="bg-card border border-border rounded-2xl p-6 sm:p-8 elevated space-y-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 mesh-gradient opacity-[0.03] pointer-events-none" />
        
        {/* Input Area */}
        <div className="relative z-10 space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Search or Type Custom Topic
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input
                placeholder='e.g., "DynamoDB", "Cold War history", "Thermodynamics"'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={topics.length >= 5}
                className="pl-9 h-11 border-border/60 bg-background/50 focus:bg-background"
              />
            </div>
            <Button 
               onClick={() => addTopic(inputValue)}
               disabled={!inputValue.trim() || topics.length >= 5}
               className="h-11 px-6 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3" />
            Press enter to add multiple topics quickly. Max 5 topics.
          </p>
        </div>

        {/* Selected Pool */}
        <div className="relative z-10 bg-background/40 border border-border/40 rounded-xl p-5 min-h-[120px]">
           {topics.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50 pt-3">
                <p className="text-sm">Your mixture is empty.</p>
                <p className="text-xs text-muted-foreground">Select from suggestions below or type your own.</p>
             </div>
           ) : (
             <div className="flex items-center gap-4 flex-wrap">
               <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest shrink-0">
                 Mixture ({topics.length}/5):
               </span>
               <AnimatePresence>
                 {topics.map((t) => (
                   <motion.div
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.8 }}
                     key={t}
                     className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm"
                   >
                     {t}
                     <button
                       onClick={() => removeTopic(t)}
                       className="opacity-70 hover:opacity-100 transition-opacity bg-primary-foreground/10 rounded-full p-0.5"
                     >
                       <X className="w-3.5 h-3.5" />
                     </button>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
           )}
        </div>

        {/* Suggestions */}
        <div className="relative z-10 space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Suggested for {stream}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => addTopic(s)}
                disabled={topics.length >= 5}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="relative z-10 pt-6 border-t border-border/50 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Back to Streams
            </Button>
            <Button
              onClick={generateQuiz}
              disabled={topics.length === 0}
              className="h-10 px-8 font-medium glow shadow-xl shadow-primary/20"
            >
              Generate Protocol
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function TopicSelectionPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[50vh]"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>}>
      <TopicSelectionEngine />
    </Suspense>
  );
}

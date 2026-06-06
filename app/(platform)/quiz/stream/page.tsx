"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  MonitorSmartphone,
  Globe2,
  FlaskConical,
  LineChart,
  Library,
} from "lucide-react";

const STREAMS = [
  {
    id: "general",
    name: "General",
    description: "Aptitude, current affairs, everyday knowledge, and reasoning",
    icon: Globe2,
    chip: "bg-primary/15 text-primary",
  },
  {
    id: "tech",
    name: "Tech & Software",
    description: "Computer Science, Programming, AI, and Architecture",
    icon: MonitorSmartphone,
    chip: "bg-primary/15 text-primary",
  },
  {
    id: "science",
    name: "Pure Sciences",
    description: "Physics, Chemistry, Biology, and Astronomy",
    icon: FlaskConical,
    chip: "bg-success/15 text-success",
  },
  {
    id: "commerce",
    name: "Commerce & Finance",
    description: "Accounts, Economics, Business, and Markets",
    icon: LineChart,
    chip: "bg-warning/15 text-warning",
  },
  {
    id: "humanities",
    name: "Humanities & General",
    description: "History, Geography, Politics, and Arts",
    icon: Library,
    chip: "bg-destructive/15 text-destructive",
  },
];

export default function StreamSelectionPage() {
  const router = useRouter();

  const handleSelect = (streamName: string) => {
    router.push(`/quiz/topic?stream=${encodeURIComponent(streamName)}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-2xl font-bold tracking-tight"
        >
          Select Your Domain
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-sm max-w-lg mx-auto"
        >
          Choose a foundational stream. Our adaptive engine will personalize the generated concepts and difficulties inside.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {STREAMS.map((stream, idx) => {
          const Icon = stream.icon;
          return (
            <motion.button
              key={stream.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              onClick={() => handleSelect(stream.name)}
              className="card-interactive group p-5 text-left cursor-pointer"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${stream.chip}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading text-base font-medium tracking-tight mb-1 truncate">{stream.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{stream.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

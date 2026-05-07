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
    color: "from-primary/10 to-primary/5",
    iconColor: "text-primary",
  },
  {
    id: "tech",
    name: "Tech & Software",
    description: "Computer Science, Programming, AI, and Architecture",
    icon: MonitorSmartphone,
    color: "from-primary/10 to-primary/5",
    iconColor: "text-primary",
  },
  {
    id: "science",
    name: "Pure Sciences",
    description: "Physics, Chemistry, Biology, and Astronomy",
    icon: FlaskConical,
    color: "from-success/10 to-success/5",
    iconColor: "text-success",
  },
  {
    id: "commerce",
    name: "Commerce & Finance",
    description: "Accounts, Economics, Business, and Markets",
    icon: LineChart,
    color: "from-warning/10 to-warning/5",
    iconColor: "text-warning",
  },
  {
    id: "humanities",
    name: "Humanities & General",
    description: "History, Geography, Politics, and Arts",
    icon: Library,
    color: "from-destructive/10 to-destructive/5",
    iconColor: "text-destructive",
  },
];

export default function StreamSelectionPage() {
  const router = useRouter();

  const handleSelect = (streamName: string) => {
    router.push(`/quiz/topic?stream=${encodeURIComponent(streamName)}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <div className="text-center space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold tracking-tight font-heading"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              className="group relative bg-card border border-border rounded-2xl p-6 text-left overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stream.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10 flex items-start gap-5">
                <div className={`p-3 rounded-xl bg-background border border-border shadow-sm ${stream.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-medium tracking-tight mb-1 font-heading">{stream.name}</h3>
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

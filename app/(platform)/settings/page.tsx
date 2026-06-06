"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { updateProfile } from "firebase/auth";
import { toast } from "sonner";
import { Monitor, Moon, Sun, LogOut, ShieldCheck, Sparkles, Check } from "lucide-react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const initialName = user?.displayName || "";
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);

  const displayName = user?.displayName || user?.email || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const dirty = name.trim() !== initialName && name.trim().length > 0;

  const handleSaveName = async () => {
    if (!auth?.currentUser || !dirty) return;
    setIsSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      toast.success("Profile updated successfully");
      window.location.reload();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, appearance, and account.</p>
      </div>

      {/* Profile */}
      <section className="card-base p-6 space-y-5">
        <div>
          <h2 className="font-heading text-sm font-medium text-foreground">Profile</h2>
          <p className="text-xs text-muted-foreground mt-0.5">How your name appears across QuizAI.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          <div className="flex items-center gap-4 shrink-0">
            <Avatar className="h-16 w-16 border-2 border-border">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <Label htmlFor="settings-name">Display name</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="sm:max-w-xs"
              />
              <Button
                onClick={handleSaveName}
                disabled={!dirty || isSaving}
                className="cursor-pointer shrink-0"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="card-base p-6 space-y-5">
        <div>
          <h2 className="font-heading text-sm font-medium text-foreground">Appearance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Choose how QuizAI looks on this device.</p>
        </div>
        <div
          role="radiogroup"
          aria-label="Theme"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer",
                  active
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border hover:border-primary/30 text-muted-foreground"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </span>
                {active && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Account */}
      <section className="card-base p-6 space-y-5">
        <div>
          <h2 className="font-heading text-sm font-medium text-foreground">Account</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Your sign-in details.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-email">Email</Label>
          <Input
            id="settings-email"
            value={user?.email || ""}
            readOnly
            disabled
            className="sm:max-w-sm"
          />
        </div>
        <div className="pt-2 border-t border-border">
          <Button
            variant="destructive"
            onClick={() => logout()}
            className="cursor-pointer gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </section>

      {/* About / Trust */}
      <section className="card-base p-6 space-y-4">
        <div>
          <h2 className="font-heading text-sm font-medium text-foreground">About QuizAI</h2>
        </div>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
            <span className="text-muted-foreground">
              Questions are generated by Google Gemini and reviewed for accuracy.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-success mt-0.5 shrink-0" aria-hidden="true" />
            <span className="text-muted-foreground">
              Your quiz data is used only to personalize your learning experience.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}

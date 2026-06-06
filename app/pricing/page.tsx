import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <>
      <main className="flex-1 pt-32 pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 font-heading">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose the perfect plan to master your subjects. No hidden fees, ever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="card-base p-8 flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Basic</h3>
              <p className="text-muted-foreground mb-6 text-sm">Perfect for casual learners.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "3 AI-generated quizzes daily",
                  "Basic performance tracking",
                  "Standard difficulty levels",
                  "Community leaderboard access"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="mt-auto">
                <Button variant="outline" className="w-full rounded-lg h-11 border-border">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="card-base border-primary bg-primary/5 p-8 relative flex flex-col">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6 text-sm">For serious students and professionals.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Unlimited AI-generated quizzes",
                  "Advanced analytics & insights",
                  "Custom difficulty & topics",
                  "Export results to PDF",
                  "Priority support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="mt-auto">
                <Button className="w-full rounded-lg h-11 bg-primary text-primary-foreground hover:bg-primary-hover">
                  Upgrade to Pro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

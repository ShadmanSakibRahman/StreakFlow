"use client";

import Link from "next/link";
import {
  Flame,
  Calendar,
  BarChart3,
  Moon,
  Smartphone,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

const features = [
  {
    icon: Flame,
    title: "Streak Tracking",
    description: "Never break the chain. Build momentum with visual streaks.",
  },
  {
    icon: Calendar,
    title: "Flexible Schedules",
    description: "Daily, weekly, or pick your own custom days.",
  },
  {
    icon: BarChart3,
    title: "Visual Progress",
    description: "See your growth at a glance with charts and stats.",
  },
  {
    icon: Moon,
    title: "Dark Mode",
    description: "Easy on the eyes, day or night.",
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    description: "Phone, tablet, or desktop. Your data syncs.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data, your Google account. No third parties.",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-32 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
            <Flame className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            StreakFlow
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Build better habits, one day at a time.
        </p>
        <div className="flex items-center justify-center gap-4">
          {user ? (
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/login">Get Started — It&apos;s Free</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border bg-card/50 hover:bg-card transition-colors"
            >
              <CardContent className="p-6">
                <feature.icon className="h-8 w-8 mb-3 text-purple-500" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

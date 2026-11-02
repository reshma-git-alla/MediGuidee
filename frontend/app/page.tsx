import Link from "next/link";
import { ArrowRight, FileHeart, MessageCircleHeart, ShieldCheck, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: MessageCircleHeart, title: "Health conversations", text: "Clear, cautious explanations with practical next steps and warning signs." },
  { icon: FileHeart, title: "Report summaries", text: "Understand key findings, stated abnormal values, and questions to bring to your doctor." },
];

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />Safety-first health education
          </div>
          <h1 className="text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            Understand your health information with <span className="text-primary">more clarity.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Ask health questions and explore medical reports with an AI assistant designed around uncertainty, privacy, and responsible escalation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link href="/chat">Start a conversation<ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/report-analysis">Analyze a report</Link></Button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">Educational use only. MediGuide does not diagnose, prescribe, or replace a healthcare professional.</p>
        </div>
        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl" />
          <Card className="relative overflow-hidden">
            <div className="bg-primary p-6 text-primary-foreground">
              <div className="flex items-center gap-3"><Stethoscope className="h-7 w-7" /><div><p className="font-semibold">MediGuide Assistant</p><p className="text-sm opacity-80">Safety screening active</p></div></div>
            </div>
            <CardContent className="space-y-4 p-6">
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground">Can you explain what a high A1C result generally means?</div>
              <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm leading-6">
                A1C estimates average blood sugar over roughly 2 to 3 months. A result above the report’s reference range can have several explanations and should be interpreted with your history by a healthcare professional...
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                This information is for educational purposes only and is not medical advice.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            {features.map(({ icon: Icon, title, text }) => (
              <Card key={title} className="shadow-none">
                <CardContent className="p-6">
                  <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import { AlertTriangle, BrainCircuit, LockKeyhole, ShieldCheck } from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "About" };

const principles = [
  { icon: ShieldCheck, title: "Clear boundaries", text: "MediGuide does not diagnose, prescribe, provide individualized doses, or claim certainty." },
  { icon: AlertTriangle, title: "Emergency escalation", text: "High-risk phrases trigger a prominent recommendation to seek immediate professional help." },
  { icon: BrainCircuit, title: "Uncertainty by design", text: "AI output is framed as educational context and always encourages qualified clinical interpretation." },
  { icon: LockKeyhole, title: "Privacy awareness", text: "Share the minimum information needed and avoid names, IDs, addresses, or other sensitive identifiers." },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <PageHeading eyebrow="Responsible AI" title="Built to inform, never to replace care" description="MediGuide helps people understand health information and prepare better questions while maintaining strict medical safety boundaries." />
      <div className="grid gap-5 sm:grid-cols-2">
        {principles.map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <CardContent className="p-6">
              <Icon className="h-7 w-7 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">{title}</h2>
              <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-muted/50 p-6">
        <h2 className="font-semibold">Important limitation</h2>
        <p className="mt-2 leading-7 text-muted-foreground">
          AI can misunderstand text and images, miss urgent details, or produce incorrect information. Always verify important decisions with a licensed healthcare professional. In an emergency, contact local emergency services immediately.
        </p>
      </div>
    </main>
  );
}

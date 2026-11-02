import { Siren } from "lucide-react";

export function EmergencyBanner({ reasons }: { reasons?: string[] }) {
  return (
    <div role="alert" className="flex gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-950 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100">
      <Siren className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-semibold">Seek immediate medical attention or contact emergency services.</p>
        {reasons?.length ? <p className="mt-1 text-sm opacity-85">Detected concern: {reasons.join(", ")}.</p> : null}
      </div>
    </div>
  );
}

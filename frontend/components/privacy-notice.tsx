import { LockKeyhole } from "lucide-react";

export function PrivacyNotice() {
  return (
    <div className="flex gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-100">
      <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
      <p>Uploaded data is processed for analysis purposes. Avoid sharing sensitive personal information.</p>
    </div>
  );
}

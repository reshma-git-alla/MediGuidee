import type { Metadata } from "next";

import { FileAnalyzer } from "@/components/file-analyzer";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = { title: "Report Analysis" };

export default function ReportAnalysisPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <PageHeading eyebrow="Report analyzer" title="Make medical reports easier to understand" description="Upload a PDF or report image for a plain-language educational summary, highlighted values, and useful questions for your clinician." />
      <FileAnalyzer kind="report" />
    </main>
  );
}

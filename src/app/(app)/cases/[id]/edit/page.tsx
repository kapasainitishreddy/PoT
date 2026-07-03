"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import CaseForm from "@/components/CaseForm";
import { EmptyState, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function EditCasePage() {
  const params = useParams<{ id: string }>();
  const { cases } = useStore();
  const kase = cases.find((c) => c.id === params.id);

  if (!kase) {
    return (
      <EmptyState
        title="Case not found"
        action={<Link href="/cases" className="btn-primary">Back to cases</Link>}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit case" subtitle={kase.title} />
      <CaseForm existing={kase} />
    </div>
  );
}

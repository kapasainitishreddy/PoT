"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CATEGORIES, STATUSES, URGENCIES } from "@/lib/constants";
import { createCase, updateCase } from "@/lib/store";
import { useAppUser } from "@/lib/auth";
import type { Case } from "@/lib/types";
import { Field } from "@/components/ui";

const schema = z.object({
  title: z.string().min(3, "Give the case a short, clear title."),
  category: z.string().min(1),
  incident_at: z.string().min(1, "When did the incident happen?"),
  location: z.string(),
  people_involved: z.string(),
  organization: z.string(),
  what_happened: z.string().min(10, "Describe what happened in a few sentences."),
  desired_outcome: z.string(),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  status: z.string().min(1),
  private_notes: z.string(),
  follow_up_date: z.string(),
});

type FormValues = z.infer<typeof schema>;

export default function CaseForm({ existing }: { existing?: Case }) {
  const router = useRouter();
  const { user } = useAppUser();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? {
          title: existing.title,
          category: existing.category,
          incident_at: existing.incident_at.slice(0, 16),
          location: existing.location,
          people_involved: existing.people_involved,
          organization: existing.organization,
          what_happened: existing.what_happened,
          desired_outcome: existing.desired_outcome,
          urgency: existing.urgency,
          status: existing.status,
          private_notes: existing.private_notes,
          follow_up_date: existing.follow_up_date,
        }
      : {
          category: "other",
          urgency: "medium",
          status: "draft",
          incident_at: "",
          title: "",
          location: "",
          people_involved: "",
          organization: "",
          what_happened: "",
          desired_outcome: "",
          private_notes: "",
          follow_up_date: "",
        },
  });

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      category: values.category as Case["category"],
      status: values.status as Case["status"],
      incident_at: new Date(values.incident_at).toISOString(),
    };
    if (existing) {
      updateCase(existing.id, payload);
      router.push(`/cases/${existing.id}`);
    } else {
      const created = createCase({
        ...payload,
        clerk_user_id: user?.id ?? "local-user",
        is_archived: false,
        is_demo: false,
      });
      router.push(`/cases/${created.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 p-6">
      <Field label="Case title" error={errors.title?.message}>
        <input className="input" placeholder="e.g. Refund for damaged order #1234" {...register("title")} />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Category">
          <select className="input" {...register("category")}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Incident date & time" error={errors.incident_at?.message}>
          <input type="datetime-local" className="input" {...register("incident_at")} />
        </Field>
        <Field label="Incident location">
          <input className="input" placeholder="Where it happened" {...register("location")} />
        </Field>
        <Field label="Organization / company involved">
          <input className="input" placeholder="Company, landlord, agency…" {...register("organization")} />
        </Field>
      </div>

      <Field label="People involved">
        <input className="input" placeholder="Names or roles of people involved" {...register("people_involved")} />
      </Field>

      <Field label="What happened?" error={errors.what_happened?.message}>
        <textarea
          className="input min-h-32"
          placeholder="Describe the facts in order. Stick to what actually happened."
          {...register("what_happened")}
        />
      </Field>

      <Field label="Desired outcome">
        <textarea className="input min-h-20" placeholder="What resolution are you asking for?" {...register("desired_outcome")} />
      </Field>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Urgency">
          <select className="input" {...register("urgency")}>
            {URGENCIES.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select className="input" {...register("status")}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Follow-up date">
          <input type="date" className="input" {...register("follow_up_date")} />
        </Field>
      </div>

      <Field label="Private notes (never included in exports by default)">
        <textarea className="input min-h-20" placeholder="Notes for yourself only" {...register("private_notes")} />
      </Field>

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {existing ? "Save changes" : "Create case"}
        </button>
      </div>
    </form>
  );
}

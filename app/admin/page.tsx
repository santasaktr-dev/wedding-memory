"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button, Field, PageShell, inputClass } from "@/components/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(formData: FormData) {
    setStatus("submitting");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="Sign In"
      intro="Manage guest wishes and photo submissions after they arrive."
    >
      <form action={handleSubmit} className="grid max-w-md gap-5 rounded-card border border-tweed/20 bg-ivory-warm p-5 shadow-card sm:p-7">
        <Field label="Password">
          <input name="password" type="password" required className={inputClass} />
        </Field>
        <Button disabled={status === "submitting"} className="gap-2">
          <LockKeyhole className="h-4 w-4" /> {status === "submitting" ? "Signing in..." : "Sign In"}
        </Button>
        {status === "error" ? (
          <p className="rounded-card border border-tweed/20 bg-ivory p-4 text-sm text-navy">
            We could not sign you in. Please check the admin password.
          </p>
        ) : null}
      </form>
    </PageShell>
  );
}

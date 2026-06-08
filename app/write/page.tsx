"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button, Field, PageShell, inputClass } from "@/components/ui";
import { wishTypes, type Wish, type WishType } from "@/lib/types";

function rememberWish(wish: Wish) {
  const key = "js-wedding-recent-wishes";
  let current: Wish[] = [];

  try {
    current = JSON.parse(window.sessionStorage.getItem(key) || "[]") as Wish[];
  } catch {
    current = [];
  }

  const next = [wish, ...current].slice(0, 5);
  window.sessionStorage.setItem(key, JSON.stringify(next));
}

export default function WritePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const isSubmittingRef = useRef(false);

  // Live preview states
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [relationship, setRelationship] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [messageType, setMessageType] = useState<WishType>("Wedding Wish");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmittingRef.current || status === "submitting") {
      return;
    }

    isSubmittingRef.current = true;
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const nameVal = String(formData.get("guest_name") || "").trim();
    const msgVal = String(formData.get("message") || "").trim();
    const relVal = String(formData.get("relationship") || "").trim() || null;
    const tableVal = String(formData.get("table_number") || "").trim() || null;
    const typeVal = String(formData.get("message_type") || "Wedding Wish");

    if (!nameVal || msgVal.length < 5 || msgVal.length > 1000 || !consent) {
      isSubmittingRef.current = false;
      setStatus("error");
      setErrorMessage("Please fill out all required fields correctly.");
      return;
    }

    const optimisticWish: Wish = {
      id: `optimistic-${crypto.randomUUID()}`,
      guest_name: nameVal,
      relationship: relVal,
      table_number: tableVal,
      message_type: typeVal as WishType,
      message: msgVal,
      status: "approved",
      likes_count: 0,
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    rememberWish(optimisticWish);

    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const data = (await response.json()) as { wish?: Wish };
        if (data.wish) {
          rememberWish(data.wish);
        }
        setStatus("success");
        setTimeout(() => {
          router.push("/wall");
        }, 1500);
      } else {
        setStatus("error");
        setErrorMessage("Something went wrong on the server. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Failed to connect to the server. Please check your internet connection.");
    } finally {
      isSubmittingRef.current = false;
    }
  }

  return (
    <PageShell
      eyebrow="Guestbook"
      title="Write a Wish"
      intro="Leave a message for Jajah & Smart. Your words will become part of our wedding memories."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Form Pane */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 relative grid gap-5 rounded-card border border-white/50 bg-white/70 backdrop-blur-md p-6 shadow-md sm:p-8">
          <Field label="Your Name">
            <input 
              name="guest_name" 
              required 
              placeholder="Your name" 
              className={inputClass}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Relationship to the Couple">
              <input 
                name="relationship" 
                placeholder="Friend, family, colleague" 
                className={inputClass} 
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              />
            </Field>
            <Field label="Table Number">
              <input 
                name="table_number" 
                placeholder="Optional" 
                inputMode="numeric"
                pattern="[0-9]*"
                className={inputClass} 
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-2 text-sm font-medium text-navy/90">
            <span>Message Type</span>
            <input type="hidden" name="message_type" value={messageType} />
            <div className="flex flex-wrap gap-2 mt-1">
              {wishTypes.map((type) => {
                const isSelected = messageType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMessageType(type)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-300 active:scale-95 ${
                      isSelected
                        ? "bg-navy text-ivory-warm border-navy shadow-sm"
                        : "bg-white/50 text-navy/70 border-ash-pale/60 hover:bg-camel-pale/30"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Your Message" note={`${message.length}/1,000 characters`}>
            <textarea
              name="message"
              required
              minLength={5}
              maxLength={1000}
              rows={6}
              placeholder="Write your message for Jajah & Smart..."
              className={inputClass}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>
          <label className="flex gap-3 text-sm leading-6 text-navy/70 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-ash-pale text-navy accent-navy focus:ring-0"
            />
            <span>
              I agree that my message may be displayed on Jajah &amp; Smart&apos;s wedding memory wall.
            </span>
          </label>
          
          <Button type="submit" disabled={status === "submitting"} className="gap-2 mt-2">
            <Send className="h-4 w-4" /> {status === "submitting" ? "Sending..." : "Send Your Wish"}
          </Button>
        </form>

        {/* Live Preview Pane */}
        <div className="lg:col-span-2 sticky top-24 flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-tweed/80 px-1">
            Live Card Preview
          </p>
          <div className="glass-card rounded-card p-6 shadow-xl bg-white/95 border border-white/60 transition-all duration-300">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="rounded-full bg-tweed/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-tweed">
                {messageType}
              </span>
            </div>
            <p className="font-serif text-2xl leading-relaxed text-navy min-h-[120px] break-words">
              {message ? `“${message}”` : "“Your message will appear here in real-time as you type...”"}
            </p>
            <div className="mt-5 border-t border-ash-pale/50 pt-4 text-sm text-navy/70">
              <p className="font-semibold text-navy">— {guestName || "Guest Name"}</p>
              {(relationship || tableNumber) && (
                <span className="text-[10px] uppercase tracking-wider text-navy/45 mt-0.5 block">
                  {relationship || "Relationship"} {tableNumber ? `· Table ${tableNumber}` : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Overlay */}
      {status !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-md transition-all duration-300 animate-fade-in">
          <div className="w-full max-w-md scale-95 transform rounded-card border border-tweed/20 bg-ivory-warm p-8 text-center shadow-card transition-all duration-300 animate-scale-up">
            {status === "submitting" && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-tweed" />
                <h3 className="text-lg font-semibold text-navy">Saving your wish...</h3>
                <p className="text-sm text-navy/60">Writing to the guestbook and preparing your card.</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 animate-scale-up" />
                <h3 className="text-lg font-semibold text-navy">Sent Successfully!</h3>
                <p className="text-sm text-navy/60">Thank you for sharing your love with us. Redirecting you to the wall...</p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-4">
                <XCircle className="h-12 w-12 text-rose-600" />
                <h3 className="text-lg font-semibold text-navy">Submission Failed</h3>
                <p className="text-sm text-rose-700/80 bg-rose-50 border border-rose-100 rounded-card p-3 w-full">
                  {errorMessage || "Could not send your wish. Please try again."}
                </p>
                <Button onClick={() => setStatus("idle")} className="mt-2 w-full">
                  Go Back & Edit
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}

"use client";

import { useRef, useState } from "react";
import { Send, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button, ButtonLink, Field, PageShell, inputClass } from "@/components/ui";
import { useLanguage } from "@/components/language-provider";
import { getWeddingClientId } from "@/lib/client-id";
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
  const { t, tWishType } = useLanguage();
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

  function resetWishForm() {
    setGuestName("");
    setMessage("");
    setRelationship("");
    setTableNumber("");
    setMessageType("Wedding Wish");
    setConsent(false);
    setStatus("idle");
    setErrorMessage("");
  }

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

    if (!nameVal || msgVal.length < 5 || msgVal.length > 1000 || !consent) {
      isSubmittingRef.current = false;
      setStatus("error");
      setErrorMessage(t("write.validationError"));
      return;
    }

    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: {
          "X-Wedding-Client-Id": getWeddingClientId()
        },
        body: formData
      });

      if (response.ok) {
        const data = (await response.json()) as { wish?: Wish };
        if (data.wish?.status === "approved") {
          rememberWish(data.wish);
        }
        setStatus("success");
      } else {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setStatus("error");
        setErrorMessage(data?.error || t("write.serverError"));
      }
    } catch {
      setStatus("error");
      setErrorMessage(t("write.connectionError"));
    } finally {
      isSubmittingRef.current = false;
    }
  }

  return (
    <PageShell
      eyebrow="Guestbook"
      title="Write a Wish"
      intro="Leave a message for Jajah & Smart. Your words will become part of our wedding memories."
      eyebrowKey="write.eyebrow"
      titleKey="write.title"
      introKey="write.intro"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Form Pane */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 relative grid gap-5 rounded-card border border-white/50 bg-white/70 backdrop-blur-md p-6 shadow-md sm:p-8">
          <Field label={t("write.name")}>
            <input 
              name="guest_name" 
              required 
              placeholder={t("write.namePlaceholder")}
              className={inputClass}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("write.relationship")}>
              <input 
                name="relationship" 
                placeholder={t("write.relationshipPlaceholder")}
                className={inputClass} 
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              />
            </Field>
            <Field label={t("write.table")}>
              <input 
                name="table_number" 
                placeholder={t("write.optional")}
                inputMode="numeric"
                pattern="[0-9]*"
                className={inputClass} 
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-2 text-sm font-medium text-navy/90">
            <span>{t("write.type")}</span>
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
                    {tWishType(type)}
                  </button>
                );
              })}
            </div>
          </div>
          <Field label={t("write.message")} note={`${message.length}/1,000 ${t("common.characters")}`}>
            <textarea
              name="message"
              required
              minLength={5}
              maxLength={1000}
              rows={6}
              placeholder={t("write.messagePlaceholder")}
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
              {t("write.consent")}
            </span>
          </label>
          
          <Button type="submit" disabled={status === "submitting"} className="gap-2 mt-2">
            <Send className="h-4 w-4" /> {status === "submitting" ? t("write.sending") : t("write.submit")}
          </Button>
        </form>

        {/* Live Preview Pane */}
        <div className="lg:col-span-2 sticky top-24 flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-tweed/80 px-1">
            {t("write.preview")}
          </p>
          <div className="glass-card rounded-card p-6 shadow-xl bg-white/95 border border-white/60 transition-all duration-300">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="rounded-full bg-tweed/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-tweed">
                {tWishType(messageType)}
              </span>
            </div>
            <p className="font-serif text-2xl leading-relaxed text-navy min-h-[120px] break-words">
              {message ? `“${message}”` : `“${t("write.previewMessage")}”`}
            </p>
            <div className="mt-5 border-t border-ash-pale/50 pt-4 text-sm text-navy/70">
              <p className="font-semibold text-navy">— {guestName || t("write.previewGuest")}</p>
              {(relationship || tableNumber) && (
                <span className="text-[10px] uppercase tracking-wider text-navy/45 mt-0.5 block">
                  {relationship || t("common.relationship")} {tableNumber ? `· ${t("common.table")} ${tableNumber}` : ""}
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
                <h3 className="text-lg font-semibold text-navy">{t("write.saving")}</h3>
                <p className="text-sm text-navy/60">{t("write.savingText")}</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 animate-scale-up" />
                <h3 className="text-lg font-semibold text-navy">{t("write.success")}</h3>
                <p className="text-sm text-navy/60">{t("write.successText")}</p>
                <div className="grid w-full gap-3 pt-2 sm:grid-cols-2">
                  <ButtonLink href="/wall" className="w-full">
                    {t("write.viewWall")}
                  </ButtonLink>
                  <Button type="button" variant="secondary" onClick={resetWishForm} className="w-full">
                    {t("write.writeAnother")}
                  </Button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-4">
                <XCircle className="h-12 w-12 text-rose-600" />
                <h3 className="text-lg font-semibold text-navy">{t("write.error")}</h3>
                <p className="text-sm text-rose-700/80 bg-rose-50 border border-rose-100 rounded-card p-3 w-full">
                  {errorMessage || t("write.defaultError")}
                </p>
                <Button onClick={() => setStatus("idle")} className="mt-2 w-full">
                  {t("write.back")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}

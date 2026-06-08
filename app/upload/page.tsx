"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button, Field, PageShell, inputClass } from "@/components/ui";
import { photoCategories, type PhotoMoment, type PhotoCategory } from "@/lib/types";

const maxImageSide = 1200;
const compressionQuality = 0.75;

function rememberPhoto(photo: PhotoMoment) {
  if (!photo.image_url) return;

  const key = "js-wedding-recent-photos";
  let current: PhotoMoment[] = [];

  try {
    current = JSON.parse(window.sessionStorage.getItem(key) || "[]") as PhotoMoment[];
  } catch {
    current = [];
  }

  const next = [photo, ...current].slice(0, 5);
  window.sessionStorage.setItem(key, JSON.stringify(next));
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    image.src = url;
  });
}

async function optimizeImage(file: File) {
  if (file.size <= 1.4 * 1024 * 1024) {
    return file;
  }

  const image = await loadImage(file);
  const scale = Math.min(1, maxImageSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return file;

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", compressionQuality);
  });

  // Clean up original image preview object URL if created in loadImage
  if (image.src.startsWith("blob:")) {
    URL.revokeObjectURL(image.src);
  }

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const fileName = file.name.replace(/\.[^.]+$/, "") || "wedding-moment";
  return new File([blob], `${fileName}.jpg`, { type: "image/jpeg" });
}

export default function UploadPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "optimizing" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const isSubmittingRef = useRef(false);

  // File and preview states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>("Couple Moment");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmittingRef.current || status === "submitting" || status === "optimizing") {
      return;
    }

    if (!guestName || !selectedFile || !consent) {
      setStatus("error");
      setErrorMessage("Please fill out all required fields correctly.");
      return;
    }

    isSubmittingRef.current = true;
    setStatus("optimizing");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("guest_name", guestName);
    formData.append("table_number", tableNumber);
    formData.append("caption", caption);
    formData.append("category", selectedCategory);
    formData.append("photo", selectedFile);

    // Generate local preview URL immediately for optimistic rendering in gallery
    const localPreviewUrl = previewUrl || URL.createObjectURL(selectedFile);
    const optimisticPhoto: PhotoMoment = {
      id: `optimistic-${crypto.randomUUID()}`,
      guest_name: guestName,
      table_number: tableNumber || null,
      caption: caption || null,
      category: selectedCategory,
      image_url: localPreviewUrl,
      thumbnail_url: null,
      status: "approved",
      likes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    rememberPhoto(optimisticPhoto);

    try {
      const optimizedFile = await optimizeImage(selectedFile);
      formData.set("photo", optimizedFile);
      setStatus("submitting");

      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const data = (await response.json()) as { photo?: PhotoMoment };
        if (data.photo) {
          rememberPhoto(data.photo);
        }
        setStatus("success");
        setTimeout(() => {
          router.push("/gallery");
        }, 1500);
      } else {
        setStatus("error");
        setErrorMessage("Upload failed on the server. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Failed to connect to the server. Check your connection.");
    } finally {
      isSubmittingRef.current = false;
    }
  }

  return (
    <PageShell
      eyebrow="Wedding Moments"
      title="Upload a Moment"
      intro="Share your favorite photo from our wedding day. New photos will appear in the gallery shortly."
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
            <Field label="Caption">
              <input 
                name="caption" 
                placeholder="A short note about this photo" 
                className={inputClass} 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </Field>
          </div>

          {/* Interactive Category Chips */}
          <div className="grid gap-2 text-sm font-medium text-navy/90">
            <span>Select Category</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {photoCategories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-300 active:scale-95 ${
                      isSelected
                        ? "bg-navy text-ivory-warm border-navy shadow-sm"
                        : "bg-white/50 text-navy/70 border-ash-pale/60 hover:bg-camel-pale/30"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Luxury Upload Dropzone */}
          <div className="grid gap-2 text-sm font-medium text-navy/90">
            <span>Upload Photo</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/jpeg,image/png,image/webp" 
              required 
              className="hidden" 
              onChange={handleFileChange}
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-ash-pale/80 hover:border-tweed/80 bg-white/40 rounded-card p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:bg-white/80"
            >
              <Upload className="h-10 w-10 text-tweed-soft mb-3 transition-transform group-hover:-translate-y-1" />
              <p className="text-sm font-bold text-navy">
                {selectedFile ? selectedFile.name : "Click to select a photo"}
              </p>
              <p className="text-xs text-navy/50 mt-1.5">
                JPG, PNG, or WEBP (Max 10 MB)
              </p>
            </div>
          </div>

          <label className="flex gap-3 text-sm leading-6 text-navy/70 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-ash-pale text-navy accent-navy focus:ring-0"
            />
            <span>I agree that my photo may be displayed in Jajah &amp; Smart&apos;s wedding gallery.</span>
          </label>
          
          <Button type="submit" disabled={status === "optimizing" || status === "submitting"} className="gap-2 mt-2">
            <Upload className="h-4 w-4" />
            Upload Moment
          </Button>
        </form>

        {/* Live Photo Preview Pane */}
        <div className="lg:col-span-2 sticky top-24 flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-tweed/80 px-1">
            Photo Card Preview
          </p>
          <div className="glass-card rounded-card overflow-hidden shadow-xl bg-white/95 border border-white/60 transition-all duration-300">
            <div className="relative overflow-hidden bg-camel-pale/25 min-h-[160px] flex items-center justify-center">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto object-contain block max-h-[300px]"
                />
              ) : (
                <div className="p-12 text-center text-navy/35">
                  <p className="text-sm font-serif italic">Your uploaded moment will appear here...</p>
                </div>
              )}
            </div>
            <div className="p-5">
              <span className="rounded-full bg-tweed/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-tweed">
                {selectedCategory}
              </span>
              <p className="mt-3 font-sans text-sm leading-relaxed text-navy min-h-[40px] break-words">
                {caption || "No caption added yet..."}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-ash-pale/50 pt-4 text-[11px] text-navy/60">
                <p className="font-medium">Shared by <span className="font-semibold text-navy/80">{guestName || "Guest Name"}</span></p>
                {tableNumber && <p className="font-semibold">Table {tableNumber}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Overlay */}
      {status !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-md transition-all duration-300 animate-fade-in">
          <div className="w-full max-w-md scale-95 transform rounded-card border border-tweed/20 bg-ivory-warm p-8 text-center shadow-card transition-all duration-300 animate-scale-up">
            {status === "optimizing" && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-tweed" />
                <h3 className="text-lg font-semibold text-navy">Preparing Photo...</h3>
                <p className="text-sm text-navy/60">Optimizing image size and resolution for fast uploads.</p>
              </div>
            )}

            {status === "submitting" && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-tweed" />
                <h3 className="text-lg font-semibold text-navy">Uploading Photo...</h3>
                <p className="text-sm text-navy/60">Uploading your moment to Google Drive. This may take a few seconds.</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 animate-scale-up" />
                <h3 className="text-lg font-semibold text-navy">Uploaded Successfully!</h3>
                <p className="text-sm text-navy/60">Thank you for sharing this beautiful moment. Redirecting to gallery...</p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-4">
                <XCircle className="h-12 w-12 text-rose-600" />
                <h3 className="text-lg font-semibold text-navy">Upload Failed</h3>
                <p className="text-sm text-rose-700/80 bg-rose-50 border border-rose-100 rounded-card p-3 w-full">
                  {errorMessage || "Could not upload your photo. Please try again."}
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

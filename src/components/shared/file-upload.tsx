"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  url: string;
  name: string;
  type: string;
}

interface FileUploadProps {
  /** "single" for a cover image; "multiple" for attachments. */
  mode?: "single" | "multiple";
  accept?: string;
  label?: string;
  hint?: string;
  onChange?: (urls: string[]) => void;
}

export function FileUpload({
  mode = "single",
  accept = "image/*",
  label = "فایل را اینجا رها کنید یا برای انتخاب کلیک کنید",
  hint,
  onChange,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function uploadOne(file: File): Promise<UploadedFile | null> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error ?? "آپلود با خطا مواجه شد.");
    }
    return { url: data.url as string, name: file.name, type: file.type };
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setUploading(true);

    try {
      const selected = Array.from(fileList);
      const uploaded = await Promise.all(selected.map(uploadOne));
      const clean = uploaded.filter((f): f is UploadedFile => f !== null);

      const next = mode === "single" ? clean.slice(0, 1) : [...files, ...clean];
      setFiles(next);
      onChange?.(next.map((f) => f.url));
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود با خطا مواجه شد.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeFile(url: string) {
    const next = files.filter((f) => f.url !== url);
    setFiles(next);
    onChange?.(next.map((f) => f.url));
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={mode === "multiple"}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {files.length > 0 && (
        <div className={cn("grid gap-2", mode === "single" ? "grid-cols-1" : "grid-cols-3 sm:grid-cols-4")}>
          {files.map((file) => (
            <div key={file.url} className="group relative aspect-square overflow-hidden rounded-md border border-border">
              {file.type.startsWith("image/") ? (
                <Image src={file.url} alt={file.name} fill sizes="120px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-muted p-2 text-center text-[11px] text-muted-foreground">
                  <UploadCloud className="h-5 w-5" />
                  <span className="line-clamp-2">{file.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(file.url)}
                aria-label="حذف فایل"
                className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(mode === "multiple" || files.length === 0) && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input p-6 text-center text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>در حال آپلود…</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span>{label}</span>
              {hint && <span className="text-xs">{hint}</span>}
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

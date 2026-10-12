import React, { useState, useRef, useCallback } from "react";
import { UploadIcon } from "../icons/Icons";

export interface UploadDropzoneProps {
  onFile: (f: File) => void;
  label?: string;
  sub?: string;
  dark?: boolean;
}

export function UploadDropzone({
  onFile,
  label = "Drop your image here",
  sub = "or click to browse files",
  dark = false,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="relative w-full rounded-md border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center py-12 px-6 group"
      style={{
        borderColor: dragging
          ? "#F76C6C"
          : dark
            ? "rgba(168,208,230,0.25)"
            : "rgba(55,71,133,0.35)",
        backgroundColor: dragging
          ? "rgba(247,108,108,0.06)"
          : dark
            ? "rgba(255,255,255,0.03)"
            : "rgba(168,208,230,0.06)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onFile(e.target.files[0]);
        }}
      />
      <div className="mb-4 transition-transform group-hover:scale-110">
        <UploadIcon />
      </div>
      <p
        className="text-base font-bold mb-1 text-center"
        style={{ color: dark ? "rgba(168,208,230,0.9)" : "#24305E" }}
      >
        {dragging ? "Release to upload image" : label}
      </p>
      <p
        className="text-sm mb-4 text-center"
        style={{ color: dark ? "rgba(168,208,230,0.5)" : "rgba(55,71,133,0.6)" }}
      >
        {sub}
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        {["JPG", "PNG", "WEBP", "GIF", "SVG"].map((f) => (
          <span
            key={f}
            className="text-xs font-mono font-bold tracking-wider"
            style={{
              color: dark ? "#A8D0E6" : "#374785",
            }}
          >
            {f}
          </span>
        ))}
      </div>
      <p
        className="text-[11px] mt-3"
        style={{ color: dark ? "rgba(168,208,230,0.4)" : "rgba(55,71,133,0.5)" }}
      >
        Max file size: 10 MB
      </p>
    </div>
  );
}

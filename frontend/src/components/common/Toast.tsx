import React, { useEffect } from "react";
import { CheckCircleIcon } from "../icons/Icons";

export interface ToastProps {
  msg: string;
  onClose: () => void;
}

export function Toast({ msg, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl"
        style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.25)" }}
      >
        <CheckCircleIcon size={20} color="#F8E9A1" />
        <p className="text-sm font-medium text-white">{msg}</p>
        <button
          onClick={onClose}
          className="ml-2 opacity-60 hover:opacity-100 cursor-pointer"
          style={{ color: "#A8D0E6" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

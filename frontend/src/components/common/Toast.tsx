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
        className="flex items-center gap-3 px-5 py-3.5 rounded-md shadow-2xl bg-[#10B981] text-white"
      >
        <CheckCircleIcon size={20} color="#FFFFFF" />
        <p className="text-sm font-semibold text-white">{msg}</p>
        <button
          onClick={onClose}
          className="ml-3 text-white/80 hover:text-white cursor-pointer text-base font-bold transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}

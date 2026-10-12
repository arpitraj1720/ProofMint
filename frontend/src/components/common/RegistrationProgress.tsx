import React from "react";
import { RegisterStep } from "../../types";

export interface RegistrationProgressProps {
  step: RegisterStep;
}

export function RegistrationProgress({ step }: RegistrationProgressProps) {
  const steps = [
    { key: "uploading", label: "Uploading image to cloud storage" },
    { key: "hashing", label: "Generating SHA-256 cryptographic fingerprint" },
    { key: "registering", label: "Registering proof on Ethereum Sepolia" },
    { key: "done", label: "Confirmed on-chain & saved to your account" },
  ];
  const idx = steps.findIndex((s) => s.key === step);

  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const done = i < idx || step === "done";
        const active = i === idx && step !== "done";
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
              style={{
                backgroundColor: done
                  ? "#F76C6C"
                  : active
                    ? "rgba(247,108,108,0.2)"
                    : "rgba(168,208,230,0.1)",
                border: active ? "2px solid #F76C6C" : "none",
              }}
            >
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6L5 8.5L9.5 4"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : active ? (
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: "#F76C6C" }}
                />
              ) : null}
            </div>
            <p
              className="text-sm font-medium transition-colors duration-300"
              style={{
                color: done ? "white" : active ? "#A8D0E6" : "rgba(168,208,230,0.35)",
              }}
            >
              {s.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

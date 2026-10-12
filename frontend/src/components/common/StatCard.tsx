import React from "react";

export interface StatCardProps {
  label: string;
  value: string | number;
  accent?: string;
}

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5"
      style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
    >
      <p className="text-3xl font-extrabold text-white mb-1">{value}</p>
      <p className="text-sm font-medium" style={{ color: accent || "#A8D0E6" }}>
        {label}
      </p>
    </div>
  );
}

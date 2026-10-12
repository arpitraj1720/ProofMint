import React from "react";

export interface StatusBadgeProps {
  status: "registered" | "verified" | "pending";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map = {
    registered: { color: "#F8E9A1", label: "Registered on Sepolia" },
    verified: { color: "#A8D0E6", label: "Verified" },
    pending: { color: "#F76C6C", label: "Pending" },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
      style={{ color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

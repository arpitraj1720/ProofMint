import React, { useState, useEffect } from "react";
import { Page } from "../types";
import { useAuth } from "../context/AuthContext";
import { getImages } from "../services/api";
import { formatDate } from "../utils/formatters";

export interface ProfilePageProps {
  setPage: (p: Page) => void;
}

export function ProfilePage({ setPage }: ProfilePageProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [registeredCount, setRegisteredCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setPage("login");
      return;
    }
    getImages()
      .then((imgs) => setRegisteredCount(imgs.length))
      .catch(() => {});
  }, [isAuthenticated, setPage]);

  const handleLogout = () => {
    logout();
    setPage("home");
  };

  return (
    <div className="min-h-screen py-16 px-6" style={{ backgroundColor: "#24305E" }}>
      <div className="max-w-xl mx-auto animate-fade-in-up">
        {/* Profile Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-5 mb-8 pb-8 border-t-0 border-b"
            style={{ borderColor: "rgba(168,208,230,0.15)" }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-md flex-shrink-0"
              style={{ backgroundColor: "#F76C6C" }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mb-1.5"
                style={{ backgroundColor: "rgba(248,233,161,0.2)", color: "#F8E9A1" }}
              >
                Active Member
              </div>
              <h1 className="text-2xl font-extrabold text-white truncate">{user?.name}</h1>
              <p className="text-xs truncate" style={{ color: "rgba(168,208,230,0.7)" }}>
                {user?.email}
              </p>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4 mb-8">
            <div
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: "rgba(36,48,94,0.6)" }}
            >
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: "rgba(168,208,230,0.5)" }}
                >
                  Username
                </span>
                <span className="text-sm font-semibold text-white">
                  {user?.username || user?.name}
                </span>
              </div>
            </div>

            <div
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: "rgba(36,48,94,0.6)" }}
            >
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: "rgba(168,208,230,0.5)" }}
                >
                  Email Address
                </span>
                <span className="text-sm font-semibold text-white">{user?.email}</span>
              </div>
            </div>

            <div
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: "rgba(36,48,94,0.6)" }}
            >
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: "rgba(168,208,230,0.5)" }}
                >
                  Account Created
                </span>
                <span className="text-sm font-semibold text-white">
                  {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>

            <div
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: "rgba(36,48,94,0.6)" }}
            >
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: "rgba(168,208,230,0.5)" }}
                >
                  Total Registered Proofs
                </span>
                <span className="text-sm font-extrabold text-[#F8E9A1]">
                  {registeredCount !== null ? registeredCount : (user?.registeredCount ?? 0)} proofs
                  on Ethereum Sepolia
                </span>
              </div>
              <button
                onClick={() => setPage("dashboard")}
                className="text-xs font-bold underline cursor-pointer"
                style={{ color: "#A8D0E6" }}
              >
                View Proofs →
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setPage("dashboard")}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 cursor-pointer text-center"
              style={{ backgroundColor: "#A8D0E6", color: "#24305E" }}
            >
              Go to Proofs Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:bg-red-500/20 cursor-pointer text-center border"
              style={{
                color: "#F76C6C",
                backgroundColor: "rgba(247,108,108,0.1)",
                borderColor: "rgba(247,108,108,0.3)",
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

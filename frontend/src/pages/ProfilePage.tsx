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
          className="rounded-md p-8 shadow-2xl"
          style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-5 mb-8 pb-8 border-t-0 border-b"
            style={{ borderColor: "rgba(168,208,230,0.15)" }}
          >
            <div
              className="w-16 h-16 rounded-md flex items-center justify-center text-2xl font-black text-white shadow-md flex-shrink-0"
              style={{ backgroundColor: "#F76C6C" }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <p
                className="text-[10px] font-bold uppercase tracking-wide mb-1"
                style={{ color: "#F8E9A1" }}
              >
                Active Member
              </p>
              <h1 className="text-2xl font-extrabold text-white truncate">{user?.name}</h1>
              <p className="text-xs truncate" style={{ color: "rgba(168,208,230,0.7)" }}>
                {user?.email}
              </p>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4 mb-8">
            <div
              className="flex items-center justify-between p-4 rounded-md"
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
              className="flex items-center justify-between p-4 rounded-md"
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
              className="flex items-center justify-between p-4 rounded-md"
              style={{ backgroundColor: "rgba(36,48,94,0.6)" }}
            >
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: "rgba(168,208,230,0.5)" }}
                >
                  Member Since
                </span>
                <span className="text-sm font-semibold text-white">
                  {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>

            {registeredCount !== null && (
              <div
                className="flex items-center justify-between p-4 rounded-md"
                style={{ backgroundColor: "rgba(36,48,94,0.6)" }}
              >
                <div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider block"
                    style={{ color: "rgba(168,208,230,0.5)" }}
                  >
                    Registered Proofs
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {registeredCount} image{registeredCount !== 1 ? "s" : ""} on Sepolia
                  </span>
                </div>
                <button
                  onClick={() => setPage("dashboard")}
                  className="text-xs font-bold underline"
                  style={{ color: "#F76C6C" }}
                >
                  View Dashboard →
                </button>
              </div>
            )}
          </div>

          {/* Blockchain Credentials */}
          <div
            className="p-4 rounded-md mb-8 border"
            style={{
              backgroundColor: "rgba(36,48,94,0.4)",
              borderColor: "rgba(168,208,230,0.12)",
            }}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-wider block mb-1"
              style={{ color: "#F8E9A1" }}
            >
              Cryptographic Credentials
            </span>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(168,208,230,0.65)" }}>
              Proofs registered from your account are verified with deterministic SHA-256 byte buffers and stored in the ProofMint Sepolia contract.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setPage("dashboard")}
              className="flex-1 py-3.5 rounded-md font-bold text-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-md"
              style={{ backgroundColor: "#F76C6C", color: "white" }}
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-3.5 rounded-md font-bold text-sm transition-all hover:bg-red-600 hover:border-red-600 active:scale-95 cursor-pointer border shadow-md text-white"
              style={{
                backgroundColor: "#24305E",
                borderColor: "rgba(168,208,230,0.3)",
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

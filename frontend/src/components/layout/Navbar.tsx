import React, { useState } from "react";
import { Page } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { ProofMintLogo } from "../ProofMintLogo";

export interface NavbarProps {
  page: Page;
  setPage: (p: Page) => void;
  onStartRegister: () => void;
}

export function Navbar({ page, setPage, onStartRegister }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks: { label: string; id: Page }[] = [
    { label: "Home", id: "home" },
    { label: "Verify Image", id: "verify" },
    ...(isAuthenticated
      ? [
          { label: "Dashboard", id: "dashboard" as Page },
          { label: "Profile", id: "profile" as Page },
        ]
      : []),
    { label: "About", id: "about" },
  ];

  return (
    <nav className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: "#24305E" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            onClick={() => setPage("home")}
            className="flex items-center group cursor-pointer focus:outline-none"
          >
            <ProofMintLogo size={38} showWordmark={true} />
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => setPage(l.id)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer"
                style={{
                  color: page === l.id ? "#A8D0E6" : "rgba(168,208,230,0.7)",
                  backgroundColor: page === l.id ? "rgba(168,208,230,0.12)" : "transparent",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage("register")}
                  className="px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 hover:opacity-90 active:scale-95 shadow cursor-pointer"
                  style={{ backgroundColor: "#F76C6C", color: "white" }}
                >
                  + Register Proof
                </button>
                <button
                  onClick={() => setPage("profile")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer border"
                  style={{
                    backgroundColor:
                      page === "profile" ? "rgba(168,208,230,0.15)" : "rgba(36,48,94,0.6)",
                    borderColor: "rgba(168,208,230,0.2)",
                    color: "#A8D0E6",
                  }}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: "#374785" }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-semibold max-w-[100px] truncate text-white">
                    {user?.name}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                  style={{
                    color: "rgba(247,108,108,0.9)",
                    backgroundColor: "rgba(247,108,108,0.1)",
                  }}
                  title="Log out"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage("login")}
                  className="px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer"
                  style={{ color: "#A8D0E6", backgroundColor: "rgba(168,208,230,0.08)" }}
                >
                  Sign In
                </button>
                <button
                  onClick={onStartRegister}
                  className="px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 hover:opacity-90 active:scale-95 shadow cursor-pointer"
                  style={{ backgroundColor: "#F76C6C", color: "white" }}
                >
                  Register Image
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md cursor-pointer"
            style={{ color: "#A8D0E6" }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {menuOpen ? (
                <path
                  d="M5 5L17 17M17 5L5 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6H19M3 11H19M3 16H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-2"
          style={{ backgroundColor: "#24305E", borderColor: "rgba(55,71,133,0.5)" }}
        >
          {navLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setPage(l.id);
                setMenuOpen(false);
              }}
              className="text-left px-4 py-3 rounded-md text-sm font-medium transition-colors"
              style={{ color: page === l.id ? "#A8D0E6" : "rgba(168,208,230,0.65)" }}
            >
              {l.label}
            </button>
          ))}
          {isAuthenticated ? (
            <div
              className="pt-3 border-t flex flex-col gap-2"
              style={{ borderColor: "rgba(55,71,133,0.5)" }}
            >
              <button
                onClick={() => {
                  setPage("register");
                  setMenuOpen(false);
                }}
                className="px-4 py-3 text-sm font-bold rounded-md text-center"
                style={{ backgroundColor: "#F76C6C", color: "white" }}
              >
                + Register New Proof
              </button>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="px-4 py-3 text-sm font-semibold rounded-md text-center"
                style={{ color: "#F76C6C", backgroundColor: "rgba(247,108,108,0.1)" }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div
              className="pt-3 border-t flex flex-col gap-2"
              style={{ borderColor: "rgba(55,71,133,0.5)" }}
            >
              <button
                onClick={() => {
                  setPage("login");
                  setMenuOpen(false);
                }}
                className="px-4 py-3 text-sm font-semibold rounded-md text-center"
                style={{ color: "#A8D0E6", backgroundColor: "rgba(168,208,230,0.08)" }}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onStartRegister();
                  setMenuOpen(false);
                }}
                className="px-4 py-3 text-sm font-bold rounded-md text-center"
                style={{ backgroundColor: "#F76C6C", color: "white" }}
              >
                Register Image
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

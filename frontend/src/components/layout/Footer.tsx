import React from "react";
import { Page } from "../../types";
import { ProofMintLogo } from "../ProofMintLogo";

export interface FooterProps {
  setPage: (p: Page) => void;
}

export function Footer({ setPage }: FooterProps) {
  return (
    <footer style={{ backgroundColor: "#24305E", borderTop: "1px solid rgba(168,208,230,0.1)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <ProofMintLogo size={32} showWordmark={true} />
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-6 text-sm"
            style={{ color: "rgba(168,208,230,0.6)" }}
          >
            <button
              onClick={() => setPage("home")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => setPage("verify")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Verify Image
            </button>
            <button
              onClick={() => setPage("about")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>
          </div>

          <p className="text-xs" style={{ color: "rgba(168,208,230,0.4)" }}>
            © 2026 ProofMint. Built on Ethereum Sepolia.
          </p>
        </div>
      </div>
    </footer>
  );
}

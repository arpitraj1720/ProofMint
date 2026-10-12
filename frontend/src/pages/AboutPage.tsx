import React from "react";
import { Page } from "../types";
import { ProofMintIcon } from "../components/ProofMintLogo";

export interface AboutPageProps {
  setPage: (p: Page) => void;
}

export function AboutPage({ setPage }: AboutPageProps) {
  return (
    <div className="min-h-screen py-16 px-6" style={{ backgroundColor: "#24305E" }}>
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <div className="text-center mb-16">
          <div className="flex justify-center mx-auto mb-5">
            <ProofMintIcon size={64} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#F76C6C" }}>
            ABOUT PROOFMINT
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Cryptographic Image Proofs
          </h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: "rgba(168,208,230,0.7)" }}>
            ProofMint establishes indisputable provenance and timestamped authenticity for digital images on Ethereum Sepolia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div
            className="rounded-3xl p-8"
            style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
          >
            <h3 className="text-xl font-bold text-white mb-3">Immutable SHA-256 Hashing</h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(168,208,230,0.7)" }}>
              ProofMint never alters or stores insecure credentials on-chain. We calculate deterministic SHA-256 fingerprints directly from image byte buffers, ensuring that even a 1-pixel change produces a completely distinct hash.
            </p>
          </div>
          <div
            className="rounded-3xl p-8"
            style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
          >
            <h3 className="text-xl font-bold text-white mb-3">Decentralized Smart Contracts</h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(168,208,230,0.7)" }}>
              Proofs are written directly into our Ethereum Sepolia smart contract. Once stored, a proof cannot be removed, tampered with, or forged by any third party.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setPage("verify")}
            className="px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 cursor-pointer shadow-lg"
            style={{ backgroundColor: "#F76C6C", color: "white" }}
          >
            Try Public Verification Now
          </button>
        </div>
      </div>
    </div>
  );
}

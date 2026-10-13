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
        {/* Header */}
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
            ProofMint establishes indisputable provenance and timestamped authenticity for digital media
            by combining client-side cryptographic hashing with immutable smart contracts on Ethereum Sepolia.
          </p>
        </div>

        {/* Academic Mentorship Card */}
        <div
          className="rounded-md p-8 mb-12 relative overflow-hidden"
          style={{
            backgroundColor: "#374785",
            border: "1px solid rgba(168,208,230,0.2)",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)"
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-white/10">
            <div>
              <p
                className="text-xs font-bold tracking-wider uppercase mb-1.5"
                style={{ color: "#F76C6C" }}
              >
                Academic Guidance
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                MALATHI G
              </h2>
              <p className="text-sm font-medium mt-1" style={{ color: "rgba(168,208,230,0.9)" }}>
                Professor Higher Academic Grade
              </p>
              <p className="text-xs" style={{ color: "rgba(168,208,230,0.6)" }}>
                Vellore Institute of Technology (VIT), Chennai
              </p>
            </div>
            <div className="sm:text-right">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                style={{ color: "#A8D0E6" }}
              >
                VIT Chennai • Blockchain Project
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "rgba(168,208,230,0.85)" }}>
            ProofMint was conceptualized and developed as an academic Blockchain project by undergraduate engineering
            students at <strong className="text-white">VIT Chennai</strong> under the mentorship and guidance of{" "}
            <strong className="text-white">Prof. Malathi G</strong>. The project demonstrates practical decentralized
            applications for media provenance, tamper-evident digital asset notarization, and trustless public verification.
          </p>
        </div>

        {/* Development Team */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#F8E9A1" }}>
              DEVELOPMENT TEAM
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Engineered by VIT Chennai Students
            </h2>
            <p className="text-xs sm:text-sm mt-1" style={{ color: "rgba(168,208,230,0.7)" }}>
              Equal collaborative design and engineering across backend systems and frontend architecture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Arpit Raj */}
            <div
              className="rounded-md p-7 flex flex-col justify-between"
              style={{
                backgroundColor: "#2c3b72",
                border: "1px solid rgba(168,208,230,0.15)"
              }}
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-base text-white shadow-md"
                    style={{ backgroundColor: "#F76C6C" }}
                  >
                    AR
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Arpit Raj</h3>
                    <p className="text-xs font-medium" style={{ color: "#F8E9A1" }}>
                      Co-Creator • Backend & Blockchain Architecture
                    </p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed mb-4" style={{ color: "rgba(168,208,230,0.75)" }}>
                  Spearheaded the server architecture and cryptographic pipelines that power ProofMint’s verification engine.
                </p>
                <ul className="space-y-2 text-xs" style={{ color: "rgba(168,208,230,0.85)" }}>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F76C6C" }}></span>
                    <span>REST API design & Express backend microservices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F76C6C" }}></span>
                    <span>Server-side SHA-256 byte hashing & verification logic</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F76C6C" }}></span>
                    <span>Ethereum Sepolia contract interaction & event tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F76C6C" }}></span>
                    <span>Authentication security & session management</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Aaron Mathew */}
            <div
              className="rounded-md p-7 flex flex-col justify-between"
              style={{
                backgroundColor: "#2c3b72",
                border: "1px solid rgba(168,208,230,0.15)"
              }}
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-base text-white shadow-md"
                    style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.4)" }}
                  >
                    AM
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Aaron Mathew</h3>
                    <p className="text-xs font-medium" style={{ color: "#F8E9A1" }}>
                      Co-Creator • Frontend & Client Integration
                    </p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed mb-4" style={{ color: "rgba(168,208,230,0.75)" }}>
                  Architected the user experience and client-side web3 integration for seamless cryptographic verification.
                </p>
                <ul className="space-y-2 text-xs" style={{ color: "rgba(168,208,230,0.85)" }}>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#A8D0E6" }}></span>
                    <span>React & Vite modular frontend architecture</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#A8D0E6" }}></span>
                    <span>Full-stack API integration & client state synchronization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#A8D0E6" }}></span>
                    <span>Interactive Provenance Certificates & QR verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#A8D0E6" }}></span>
                    <span>High-contrast Web3 UI design system & responsive layout</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div
            className="rounded-md p-8"
            style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
          >
            <h3 className="text-xl font-bold text-white mb-3">Immutable SHA-256 Hashing</h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(168,208,230,0.7)" }}>
              ProofMint never alters or stores insecure credentials on-chain. We calculate deterministic SHA-256 fingerprints directly from image byte buffers, ensuring that even a 1-pixel change produces a completely distinct hash.
            </p>
          </div>
          <div
            className="rounded-md p-8"
            style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
          >
            <h3 className="text-xl font-bold text-white mb-3">Decentralized Smart Contracts</h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(168,208,230,0.7)" }}>
              Proofs are written directly into our Ethereum Sepolia smart contract. Once stored, a proof cannot be removed, tampered with, or forged by any third party.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => setPage("verify")}
            className="px-8 py-4 rounded-md font-bold text-base transition-all hover:opacity-90 cursor-pointer shadow-lg"
            style={{ backgroundColor: "#F76C6C", color: "white" }}
          >
            Try Public Verification Now
          </button>
        </div>
      </div>
    </div>
  );
}

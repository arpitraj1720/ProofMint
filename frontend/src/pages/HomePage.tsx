import React from "react";
import { Page } from "../types";
import { HeroIllustration } from "../components/illustrations/HeroIllustration";

export interface HomePageProps {
  setPage: (p: Page) => void;
  onStartRegister: () => void;
}

export function HomePage({ setPage, onStartRegister }: HomePageProps) {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-[85vh] flex items-center" style={{ backgroundColor: "#A8D0E6" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
                style={{ backgroundColor: "rgba(36,48,94,0.12)", color: "#24305E" }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#F76C6C" }} />
                Live on Ethereum Sepolia Testnet
              </div>
              <h1
                className="text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-none tracking-tight mb-6"
                style={{ color: "#24305E" }}
              >
                PROVE<br />
                WHAT'S<br />
                <span style={{ color: "#F76C6C" }}>YOURS.</span>
              </h1>
              <p
                className="text-lg lg:text-xl leading-relaxed mb-10 max-w-md"
                style={{ color: "rgba(36,48,94,0.78)" }}
              >
                Register your digital image proofs on-chain and let anyone verify their authenticity in seconds without technical friction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onStartRegister}
                  className="px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95 shadow-xl cursor-pointer"
                  style={{ backgroundColor: "#F76C6C", color: "white" }}
                >
                  Register Image
                </button>
                <button
                  onClick={() => setPage("verify")}
                  className="px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:bg-black/5 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: "rgba(36,48,94,0.1)",
                    color: "#24305E",
                    border: "2px solid rgba(36,48,94,0.2)",
                  }}
                >
                  Verify Image
                </button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-16 px-6" style={{ backgroundColor: "#374785" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-12" style={{ color: "#F8E9A1" }}>
            BUILT FOR DIGITAL TRUST & CRYPTOGRAPHIC CERTAINTY
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Immutable Proof",
                desc: "Your image fingerprint is recorded on Ethereum Sepolia — permanent, tamper-proof, and timestamped.",
              },
              {
                title: "Public Verification",
                desc: "Anyone can verify an image instantly without creating an account or logging in.",
              },
              {
                title: "User Ownership",
                desc: "Each proof is cryptographically linked to your user account, accessible through your private dashboard.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 transition-all"
                style={{ backgroundColor: "rgba(36,48,94,0.5)", border: "1px solid rgba(168,208,230,0.15)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4 text-xs font-bold font-mono" style={{ backgroundColor: "#F76C6C", color: "white" }}>
                  0{i + 1}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(168,208,230,0.7)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6" style={{ backgroundColor: "#24305E" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F76C6C" }}>HOW IT WORKS</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Four steps to<br />
              <span style={{ color: "#A8D0E6" }}>permanent authenticity.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Upload", desc: "Upload your image securely. We support JPEG, PNG, WEBP, GIF, and SVG." },
              { num: "02", title: "Fingerprint", desc: "ProofMint computes a deterministic SHA-256 cryptographic hash of your image." },
              { num: "03", title: "Smart Contract", desc: "The fingerprint is stored on Ethereum Sepolia via smart contract transaction." },
              { num: "04", title: "Public Proof", desc: "Anyone with the image file can verify matching proof on the public blockchain." },
            ].map((s) => (
              <div
                key={s.num}
                className="rounded-2xl p-6 relative group transition-all duration-200"
                style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.12)" }}
              >
                <div className="text-5xl font-extrabold mb-4" style={{ color: "#F8E9A1", opacity: 0.8 }}>
                  {s.num}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(168,208,230,0.65)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

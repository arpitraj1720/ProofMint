import React from "react";

interface ProofMintIconProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export const ProofMintIcon: React.FC<ProofMintIconProps> = ({
  size = 36,
  className = "",
  glow = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src="/proofmint-icon.png"
        alt="ProofMint"
        width={size}
        height={size}
        className="w-full h-full object-contain pointer-events-none select-none transition-all duration-300"
        style={{
          filter: glow
            ? "drop-shadow(0 2px 10px rgba(0, 180, 255, 0.55)) drop-shadow(0 0 22px rgba(0, 210, 255, 0.35))"
            : undefined,
        }}
      />
    </div>
  );
};

interface ProofMintLogoProps {
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
  glow?: boolean;
}

export const ProofMintLogo: React.FC<ProofMintLogoProps> = ({
  size = 36,
  showWordmark = true,
  subtitle,
  className = "",
  glow = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      <div className="relative flex-shrink-0 transition-all duration-300 group-hover:scale-105">
        <ProofMintIcon size={size} glow={glow} />
      </div>
      {showWordmark && (
        <div className="flex flex-col text-left leading-tight">
          <span className="text-white font-black text-xl tracking-tight flex items-center">
            Proof<span className="text-[#00D2FF]">Mint</span>
          </span>
          {subtitle !== undefined ? (
            subtitle ? (
              <span className="text-[9px] font-bold tracking-widest uppercase opacity-75 mt-0.5 text-[#94A3B8]">
                {subtitle}
              </span>
            ) : null
          ) : (
            <span className="text-[9px] font-bold tracking-widest uppercase opacity-70 mt-0.5 text-[#94A3B8]">
              On-Chain Authenticity
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProofMintLogo;


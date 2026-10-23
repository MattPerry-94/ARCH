export default function Logo({ className = "", title = "ARCH" }) {
  return (
    <svg className={className} viewBox="0 0 372 120" role="img" aria-label={title}>
      <path d="M14 112V70a40 40 0 0 1 80 0v42" fill="none" stroke="var(--ice)" strokeWidth="20" />
      <text
        x="110"
        y="112"
        fill="currentColor"
        style={{ fontFamily: "var(--font-archivo), Arial Black, sans-serif", fontWeight: 900, fontVariationSettings: "'wdth' 125" }}
        fontSize="94"
        letterSpacing="-2"
      >
        RCH
      </text>
    </svg>
  );
}

export function ElanMark({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 250 80" role="img" aria-label="ÉLAN">
      <rect x="20" y="4" width="22" height="7" rx="2" transform="rotate(-18 31 7.5)" fill="var(--ice)" />
      <text
        x="8"
        y="72"
        fill="currentColor"
        style={{ fontFamily: "var(--font-archivo), Arial Black, sans-serif", fontWeight: 800, fontVariationSettings: "'wdth' 125" }}
        fontSize="56"
        letterSpacing="3"
      >
        ELAN
      </text>
    </svg>
  );
}

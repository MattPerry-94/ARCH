"use client";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const links = [
  ["Technologie", "#technologie"],
  ["Application", "#app"],
  ["Experts", "#experts"],
  ["Prix", "#prix"],
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="nav__inner">
        <a href="#top" className="nav__logo" aria-label="ARCH, retour en haut">
          <Logo />
        </a>
        <nav className="nav__links" aria-label="Sections">
          {links.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a href="#precommande" className="btn btn--ice btn--sm">
          Précommander
        </a>
      </div>
    </header>
  );
}

import Logo, { ElanMark } from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo className="footer__logo" />
          <p>Pensée pour vos pieds. Réglée par vous.</p>
        </div>
        <nav className="footer__links" aria-label="Pied de page">
          <a href="#technologie">Technologie</a>
          <a href="#app">Application</a>
          <a href="#prix">Prix</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="footer__by">
          <span>Une création</span>
          <ElanMark className="footer__elan" />
        </div>
      </div>
      <div className="container footer__legal">
        <span>© 2026 ARCH. Tous droits réservés.</span>
        <span>Mentions légales · Confidentialité · CGV</span>
      </div>
    </footer>
  );
}

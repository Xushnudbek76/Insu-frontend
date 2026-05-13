import NextLink from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer">
      <div className="footer-inner">
        <div className="main">
          <div className="brand-col">
            <span className="logo">INSU</span>
            <p>
              Smart insurance marketplace powered by AI. Discover tailored insurance,
              compare coverage, and manage your policies effortlessly.
            </p>
          </div>

          <div className="links-col">
            <div className="link-group">
              <strong>Explore</strong>
              <NextLink href="/packages">Insurance</NextLink>
              <NextLink href="/agents">Agents</NextLink>
              <NextLink href="/community">Community</NextLink>
            </div>

            <div className="link-group">
              <strong>Support</strong>
              <NextLink href="/cs">Help Center</NextLink>
              <a href="mailto:support@insu.ai">Contact</a>
              <NextLink href="/about">About</NextLink>
            </div>
          </div>
        </div>

        <div className="second">
          <span>© {currentYear} INSU. All rights reserved.</span>
          <div className="footer-links">
            <NextLink href="/terms">Terms</NextLink>
            <NextLink href="/privacy">Privacy</NextLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

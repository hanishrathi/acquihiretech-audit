/**
 * Footer — matches acquihiretech.com tone (gray, restrained).
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border-light py-8 px-6 bg-bg-near-white">
      <div className="max-w-[980px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-text-secondary">
          AcquiHire Audit — built by{" "}
          <a
            href="https://acquihiretech.com"
            className="text-link hover:text-link-hover"
          >
            AcquihireTech
          </a>
        </p>
        <div className="flex items-center gap-6 text-sm text-text-secondary">
          <a
            href="https://acquihiretech.com/privacy.html"
            className="hover:text-text transition-colors"
          >
            Privacy
          </a>
          <a
            href="https://acquihiretech.com/terms.html"
            className="hover:text-text transition-colors"
          >
            Terms
          </a>
          <a
            href="https://acquihiretech.com/contact.html"
            className="hover:text-text transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

/**
 * Dark translucent global nav — matches acquihiretech.com .site-header / .nav.
 * Background rgba(0,0,0,0.8), Syne type, white links at 0.8 opacity.
 */

interface SiteNavProps {
  /** Right-side action: "audit" (Sign In / Sign Up) or "dashboard" link */
  variant?: "marketing" | "app";
  dashboardHref?: string;
}

export function SiteNav({ variant = "marketing" }: SiteNavProps) {
  return (
    <header className="site-header">
      <nav className="max-w-[1024px] mx-auto px-[22px] h-12 flex items-center gap-0">
        {/* Brand — full main-site logo with connecting lines */}
        <a
          href="https://acquihiretech.com"
          className="flex items-center gap-2 shrink-0 text-[14px] text-text-on-dark/90 hover:text-text-on-dark transition-opacity"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 44 44"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <line x1="22" y1="7" x2="37" y2="22" stroke="#f97316" strokeWidth="1.6" strokeOpacity="0.38" strokeLinecap="round" />
            <line x1="37" y1="22" x2="22" y2="37" stroke="#3b82f6" strokeWidth="1.6" strokeOpacity="0.38" strokeLinecap="round" />
            <line x1="22" y1="37" x2="7" y2="22" stroke="#10b981" strokeWidth="1.6" strokeOpacity="0.38" strokeLinecap="round" />
            <line x1="7" y1="22" x2="22" y2="7" stroke="#a855f7" strokeWidth="1.6" strokeOpacity="0.38" strokeLinecap="round" />
            <circle cx="22" cy="7" r="6.5" fill="#f97316" />
            <circle cx="37" cy="22" r="6.5" fill="#3b82f6" />
            <circle cx="22" cy="37" r="6.5" fill="#10b981" />
            <circle cx="7" cy="22" r="6.5" fill="#a855f7" />
          </svg>
          AcquihireTech
        </a>

        {/* Center links */}
        <ul className="flex flex-1 justify-center items-center gap-0 list-none">
          <li>
            <a
              href="/"
              className="text-[12px] text-text-on-dark/80 hover:text-text-on-dark px-2.5 h-12 flex items-center transition-opacity"
            >
              Audit
            </a>
          </li>
          <li>
            <a
              href="/pricing"
              className="text-[12px] text-text-on-dark/80 hover:text-text-on-dark px-2.5 h-12 flex items-center transition-opacity"
            >
              Pricing
            </a>
          </li>
          <li>
            <a
              href="https://acquihiretech.com/services.html"
              className="text-[12px] text-text-on-dark/80 hover:text-text-on-dark px-2.5 h-12 flex items-center transition-opacity"
            >
              Engines
            </a>
          </li>
        </ul>

        {/* Right action */}
        <div className="flex items-center gap-3 shrink-0">
          {variant === "marketing" ? (
            <>
              <a
                href="/sign-in"
                className="text-[12px] text-text-on-dark/80 hover:text-text-on-dark transition-opacity"
              >
                Sign In
              </a>
              <a
                href="/sign-up"
                className="text-[12px] font-medium text-text-on-dark bg-white/12 hover:bg-white/22 rounded-[980px] px-4 py-[5px] transition-colors"
              >
                Sign Up
              </a>
            </>
          ) : (
            <a
              href="/dashboard"
              className="text-[12px] font-medium text-text-on-dark bg-white/12 hover:bg-white/22 rounded-[980px] px-4 py-[5px] transition-colors"
            >
              Dashboard
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}

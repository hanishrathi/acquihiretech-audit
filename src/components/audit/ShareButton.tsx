"use client";

import { useState } from "react";

interface ShareButtonProps {
  domain: string;
  score: number;
}

export function ShareButton({ domain, score }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${domain} scored ${score}/100 in the AcquiHire Website Audit. Get yours free 👉`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const tmp = document.createElement("input");
      tmp.value = url;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`Website audit for ${domain}`)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs px-3 py-1 bg-bg-tint hover:bg-border-light text-text rounded-full font-medium transition-colors flex items-center gap-1.5"
        aria-label="Share report"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 z-50 rounded-[14px] bg-white border border-border-light shadow-xl overflow-hidden">
            <div className="p-3 border-b border-border-light">
              <p className="text-xs text-text-secondary mb-2">Share this report</p>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-bg-tint text-xs font-mono text-text-dim truncate">
                {url}
              </div>
            </div>
            <button
              onClick={copyLink}
              className="w-full text-left px-4 py-2.5 hover:bg-bg-tint flex items-center gap-3 text-sm text-text transition-colors"
            >
              <span className="w-5 text-center">{copied ? "✅" : "📋"}</span>
              {copied ? "Copied!" : "Copy link"}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left px-4 py-2.5 hover:bg-bg-tint flex items-center gap-3 text-sm text-text transition-colors"
            >
              <span className="w-5 text-center">💬</span>
              WhatsApp
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left px-4 py-2.5 hover:bg-bg-tint flex items-center gap-3 text-sm text-text transition-colors"
            >
              <span className="w-5 text-center">💼</span>
              LinkedIn
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left px-4 py-2.5 hover:bg-bg-tint flex items-center gap-3 text-sm text-text transition-colors"
            >
              <span className="w-5 text-center">𝕏</span>
              Twitter / X
            </a>
            <a
              href={emailUrl}
              className="w-full text-left px-4 py-2.5 hover:bg-bg-tint flex items-center gap-3 text-sm text-text transition-colors border-t border-border-light"
            >
              <span className="w-5 text-center">✉️</span>
              Email
            </a>
          </div>
        </>
      )}
    </div>
  );
}

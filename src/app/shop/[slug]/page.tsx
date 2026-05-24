import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { safeAuth } from "@/lib/auth";
import {
  PRODUCTS,
  getProductBySlug,
  formatProductPrice,
} from "@/lib/products";
import { ProductBuyButton } from "./ProductBuyButton";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.title} — AcquihireTech Shop`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.title} — ${formatProductPrice(product.priceINR)}`,
      description: product.shortDescription,
      url: `https://audit.acquihiretech.com/shop/${slug}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const { userId } = await safeAuth();
  const isSignedIn = Boolean(userId);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav variant={isSignedIn ? "app" : "marketing"} />

      {/* Dark hero with product title */}
      <section className="hero-3d">
        <div className="container">
          <span className="eyebrow">
            <a
              href="/shop"
              style={{
                color: "rgba(255,255,255,0.52)",
                textDecoration: "none",
              }}
            >
              ← Shop
            </a>
            {" / "}
            {product.category}
            {product.badge && (
              <>
                {"  ·  "}
                <span style={{ color: "var(--engine-growth)" }}>
                  {product.badge}
                </span>
              </>
            )}
          </span>
          <h1 className="display" style={{ maxWidth: "22ch" }}>
            {product.title}
          </h1>
          {product.subtitle && (
            <p
              className="lead"
              style={{
                fontSize: 19,
                color: "rgba(245,245,247,0.7)",
                margin: "12px auto 0",
              }}
            >
              {product.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Bridge */}
      <div
        style={{
          height: 48,
          background: "linear-gradient(to bottom, #0f0e10, var(--bg))",
        }}
      />

      {/* Main content: left = details, right = sticky buy box */}
      <section style={{ padding: "20px 0 80px" }}>
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 360px",
            gap: 48,
          }}
        >
          {/* Left column */}
          <div>
            <p
              className="lead"
              style={{ marginBottom: 32, maxWidth: "60ch" }}
            >
              {product.longDescription}
            </p>

            <h2
              style={{
                fontSize: 24,
                fontWeight: 600,
                marginTop: 32,
                marginBottom: 16,
              }}
            >
              What you get
            </h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {product.features.map((f) => (
                <li
                  key={f}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border-light)",
                    fontSize: 16,
                  }}
                >
                  <span
                    style={{
                      color: "var(--score-excellent)",
                      flexShrink: 0,
                      fontWeight: 600,
                    }}
                  >
                    ✓
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {product.whatsIncluded && product.whatsIncluded.length > 0 && (
              <>
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    marginTop: 40,
                    marginBottom: 16,
                  }}
                >
                  Full deliverables
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 8,
                  }}
                >
                  {product.whatsIncluded.map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: "12px 14px",
                        background: "var(--bg-tint)",
                        borderRadius: 12,
                        fontSize: 14,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right column — sticky buy box */}
          <aside
            style={{
              position: "sticky",
              top: 70,
              alignSelf: "start",
              padding: 28,
              background: "var(--bg-near-white)",
              border: "1px solid var(--border-light)",
              borderRadius: 18,
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 600,
                letterSpacing: "-0.015em",
                marginBottom: 4,
              }}
            >
              {formatProductPrice(product.priceINR)}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginBottom: 20,
              }}
            >
              One-time payment · Instant download
            </div>

            <ProductBuyButton
              slug={product.slug}
              title={product.title}
              isSignedIn={isSignedIn}
            />

            <div
              style={{
                marginTop: 22,
                padding: "16px 0 0",
                borderTop: "1px solid var(--border-light)",
                fontSize: 13,
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span>Format</span>
                <span style={{ color: "var(--text)" }}>{product.fileFormat}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span>File size</span>
                <span style={{ color: "var(--text)" }}>{product.fileSize}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span>License</span>
                <span style={{ color: "var(--text)" }}>Commercial</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Delivery</span>
                <span style={{ color: "var(--text)" }}>Email link</span>
              </div>
            </div>

            <p
              style={{
                marginTop: 18,
                fontSize: 12,
                color: "var(--text-dim)",
                lineHeight: 1.5,
              }}
            >
              Pay via UPI or crypto. After we verify your payment (usually
              within a few hours), you&apos;ll get a download link emailed
              to you.
            </p>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

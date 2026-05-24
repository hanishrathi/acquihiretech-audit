import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PRODUCTS, formatProductPrice } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop — AcquihireTech",
  description:
    "Digital products for creators, marketers, and SMB founders. AI prompt libraries, templates, and growth tools — instant download, commercial license.",
  openGraph: {
    title: "Shop — AcquihireTech",
    description:
      "Digital products for creators, marketers, and SMB founders. Instant download.",
    url: "https://audit.acquihiretech.com/shop",
  },
};

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav variant="marketing" />

      {/* Dark hero — main-site pattern */}
      <section className="hero-3d">
        <div className="container">
          <span className="eyebrow">Shop · Digital products</span>
          <h1 className="display">Tools we use,<br />now yours.</h1>
          <p className="lead">
            Curated digital products for creators and operators —
            prompt libraries, templates, growth systems. Instant download.
            Commercial license. Built from real practice.
          </p>
        </div>
      </section>

      {/* Bridge */}
      <div
        style={{
          height: 48,
          background: "linear-gradient(to bottom, #0f0e10, var(--bg))",
        }}
      />

      {/* Product grid */}
      <section style={{ padding: "20px 0 80px" }}>
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-3">
            {PRODUCTS.map((product) => (
              <a
                key={product.slug}
                href={`/shop/${product.slug}`}
                className="tile tile-light text-left no-underline transition-all hover:shadow-lg"
                style={{
                  minHeight: 340,
                  padding: "28px 28px 28px",
                  textAlign: "left",
                  alignItems: "stretch",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {product.badge && (
                    <span
                      className="inline-block mb-3 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: "var(--engine-growth)",
                        color: "#fff",
                        letterSpacing: 0.4,
                      }}
                    >
                      {product.badge}
                    </span>
                  )}
                  <div
                    style={{
                      fontSize: 13,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                      color: "var(--text-secondary)",
                      marginBottom: 8,
                    }}
                  >
                    {product.category}
                  </div>
                  <h3
                    style={{
                      fontSize: 22,
                      lineHeight: 1.2,
                      fontWeight: 600,
                      marginBottom: 10,
                      color: "var(--text)",
                    }}
                  >
                    {product.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.5,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {product.shortDescription}
                  </p>
                </div>
                <div
                  className="mt-6 flex items-center justify-between"
                  style={{ paddingTop: 16, borderTop: "1px solid var(--border-light)" }}
                >
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    {formatProductPrice(product.priceINR)}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--link)",
                      fontWeight: 500,
                    }}
                  >
                    View details →
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* If empty */}
          {PRODUCTS.length === 0 && (
            <div
              className="text-center py-16"
              style={{ color: "var(--text-secondary)" }}
            >
              No products yet — check back soon.
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

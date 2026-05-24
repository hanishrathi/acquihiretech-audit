import QRCode from "qrcode";

/**
 * Direct-wallet crypto payment helpers.
 *
 * Customer chooses a chain, we show our wallet address + QR + the
 * exact native-currency amount (converted from INR via CoinGecko at
 * checkout time). After paying they submit the tx hash; admin verifies
 * on-chain and approves.
 */

export type CryptoChain = "btc" | "eth" | "usdc-eth" | "usdc-polygon";

export interface CryptoChainConfig {
  id: CryptoChain;
  label: string;
  coingeckoId: string;       // CoinGecko's id for price lookup
  symbol: string;            // "BTC" / "ETH" / "USDC"
  decimals: number;
  envVar: string;            // env var holding the wallet address
  explorerTx: (hash: string) => string;
  stable: boolean;           // is this a stablecoin (price = $1)?
}

export const CRYPTO_CHAINS: Record<CryptoChain, CryptoChainConfig> = {
  btc: {
    id: "btc",
    label: "Bitcoin (BTC)",
    coingeckoId: "bitcoin",
    symbol: "BTC",
    decimals: 8,
    envVar: "CRYPTO_BTC_ADDRESS",
    explorerTx: (h) => `https://mempool.space/tx/${h}`,
    stable: false,
  },
  eth: {
    id: "eth",
    label: "Ethereum (ETH)",
    coingeckoId: "ethereum",
    symbol: "ETH",
    decimals: 6,
    envVar: "CRYPTO_ETH_ADDRESS",
    explorerTx: (h) => `https://etherscan.io/tx/${h}`,
    stable: false,
  },
  "usdc-eth": {
    id: "usdc-eth",
    label: "USDC on Ethereum",
    coingeckoId: "usd-coin",
    symbol: "USDC",
    decimals: 2,
    envVar: "CRYPTO_ETH_ADDRESS", // same wallet as ETH (USDC is ERC-20)
    explorerTx: (h) => `https://etherscan.io/tx/${h}`,
    stable: true,
  },
  "usdc-polygon": {
    id: "usdc-polygon",
    label: "USDC on Polygon",
    coingeckoId: "usd-coin",
    symbol: "USDC",
    decimals: 2,
    envVar: "CRYPTO_POLYGON_ADDRESS",
    explorerTx: (h) => `https://polygonscan.com/tx/${h}`,
    stable: true,
  },
};

export function chainAddress(chain: CryptoChain): string | null {
  const cfg = CRYPTO_CHAINS[chain];
  return process.env[cfg.envVar] || null;
}

export function listConfiguredChains(): CryptoChain[] {
  return (Object.keys(CRYPTO_CHAINS) as CryptoChain[]).filter((c) =>
    Boolean(chainAddress(c))
  );
}

export function isCryptoConfigured(): boolean {
  return listConfiguredChains().length > 0;
}

// ─── Price conversion (CoinGecko free API, no key needed) ────────────────────

interface CryptoPriceCache {
  expiresAt: number;
  prices: Record<string, number>; // coingecko_id -> USD price
}
let priceCache: CryptoPriceCache | null = null;

/** USD price for a CoinGecko id, cached for 5 minutes. */
export async function getUsdPrice(coingeckoId: string): Promise<number> {
  const now = Date.now();
  if (priceCache && priceCache.expiresAt > now && priceCache.prices[coingeckoId]) {
    return priceCache.prices[coingeckoId];
  }

  // Fetch all needed ids at once
  const ids = Array.from(
    new Set(Object.values(CRYPTO_CHAINS).map((c) => c.coingeckoId).concat("usd"))
  ).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,inr`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = (await res.json()) as Record<string, { usd: number }>;
    const prices: Record<string, number> = {};
    for (const [id, val] of Object.entries(data)) {
      prices[id] = val.usd;
    }
    priceCache = { prices, expiresAt: now + 5 * 60 * 1000 };
    return prices[coingeckoId];
  } catch (err) {
    console.error("[crypto] getUsdPrice error:", err);
    throw new Error("Failed to fetch crypto price");
  }
}

/**
 * INR -> native crypto amount. Uses CoinGecko USD price + a fixed
 * USD/INR rate (also from CoinGecko). Returns string with appropriate
 * decimals.
 */
export async function convertInrToCrypto(
  amountInrPaise: number,
  chain: CryptoChain
): Promise<string> {
  const cfg = CRYPTO_CHAINS[chain];
  const amountInr = amountInrPaise / 100;

  // Use CoinGecko's USD/INR (free, no key)
  const ratesUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cfg.coingeckoId}&vs_currencies=inr`;
  const res = await fetch(ratesUrl, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data = (await res.json()) as Record<string, { inr: number }>;
  const inrPerUnit = data[cfg.coingeckoId]?.inr;
  if (!inrPerUnit) throw new Error("No INR price for " + cfg.coingeckoId);

  const native = amountInr / inrPerUnit;
  return native.toFixed(cfg.decimals);
}

/** Render any string (address) as a Data URL PNG QR. */
export async function addressQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 320,
    color: { dark: "#1d1d1f", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}

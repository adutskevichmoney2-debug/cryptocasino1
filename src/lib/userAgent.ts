export interface ParsedUserAgent {
  deviceType: "desktop" | "mobile" | "tablet" | "bot" | "unknown";
  browser: string;
  os: string;
}

/**
 * Minimal User-Agent parser — enough to label a session in the operator panel
 * without pulling in a dependency that ships a megabyte of regexes.
 */
export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  if (!ua) return { deviceType: "unknown", browser: "Unknown", os: "Unknown" };

  const s = ua.toLowerCase();

  const deviceType: ParsedUserAgent["deviceType"] = /bot|crawler|spider|crawling/.test(s)
    ? "bot"
    : /ipad|tablet|playbook|silk/.test(s) || (/android/.test(s) && !/mobile/.test(s))
      ? "tablet"
      : /mobi|iphone|ipod|android|blackberry|iemobile|opera mini/.test(s)
        ? "mobile"
        : "desktop";

  // Order matters: Edge and Opera both claim to be Chrome, Chrome claims Safari.
  const browser = /edg\//.test(s)
    ? "Edge"
    : /opr\/|opera/.test(s)
      ? "Opera"
      : /firefox\//.test(s)
        ? "Firefox"
        : /chrome\/|crios\//.test(s)
          ? "Chrome"
          : /safari\//.test(s)
            ? "Safari"
            : "Unknown";

  const os = /windows nt 10|windows nt 11/.test(s)
    ? "Windows"
    : /windows/.test(s)
      ? "Windows"
      : /iphone|ipad|ipod/.test(s)
        ? "iOS"
        : /mac os x/.test(s)
          ? "macOS"
          : /android/.test(s)
            ? "Android"
            : /linux/.test(s)
              ? "Linux"
              : "Unknown";

  return { deviceType, browser, os };
}

/** First public address from the proxy chain Vercel sets. */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "";
}

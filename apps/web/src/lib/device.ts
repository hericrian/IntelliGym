export type MobilePlatform = "ios" | "android" | "other" | "desktop";

export function detectMobilePlatform(userAgent?: string): MobilePlatform {
  if (!userAgent) {
    return "desktop";
  }

  const normalizedAgent = userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(normalizedAgent)) {
    return "ios";
  }

  if (/android/.test(normalizedAgent)) {
    return "android";
  }

  if (/mobile/.test(normalizedAgent)) {
    return "other";
  }

  return "desktop";
}

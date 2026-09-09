export function supportsWebGL({
  disableAnimations = false
}: {
  disableAnimations?: boolean;
} = {}): boolean {
  if (
    disableAnimations ||
    typeof window === "undefined" ||
    window.innerWidth < 820 ||
    new URLSearchParams(window.location.search).get("webgl") === "0"
  ) {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

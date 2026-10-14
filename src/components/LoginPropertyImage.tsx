export function LoginPropertyImage() {
  return <img
    className="login-accent-photo"
    src="/images/hamilton-court-illustration-1024.webp"
    srcSet="/images/hamilton-court-illustration-640.webp 640w, /images/hamilton-court-illustration-1024.webp 1024w, /images/hamilton-court-illustration-2048.webp 2048w"
    sizes="(max-width: 800px) calc(100vw - 16px), (max-width: 1040px) 60vw, calc(100vw - 652px)"
    width={2048}
    height={1184}
    fetchPriority="high"
    decoding="async"
    alt="Illustration of Hamilton Court Condominiums"
  />;
}

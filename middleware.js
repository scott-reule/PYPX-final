export const config = { matcher: "/cleanup/:path*" };

// Block direct access to /cleanup/* photos unless the PIN cookie is set.
// The PIN screen sets wwwUnlocked=1 via document.cookie on successful unlock.
export default function middleware(request) {
  const cookie = request.headers.get("cookie") || "";
  const unlocked = cookie.split(";").some(c => c.trim() === "wwwUnlocked=1");
  if (!unlocked) {
    return Response.redirect(new URL("/", request.url), 302);
  }
}

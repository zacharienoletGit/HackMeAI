export const COOKIE_API_KEY = "hmai_api_key";
export const COOKIE_ADMIN_KEY = "hmai_admin_key";

export const OPTIONS_COOKIE = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 8,
};

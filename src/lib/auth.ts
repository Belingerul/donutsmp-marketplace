import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "pm_session";

function secretKey() {
  const s = process.env.AUTH_SECRET || "";
  if (!s) throw new Error("AUTH_SECRET missing");
  return new TextEncoder().encode(s);
}

export type Session = {
  uid: string;
  role: "seller" | "admin";
  handle: string;
};

export async function setSession(sess: Session) {
  const token = await new SignJWT(sess)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());

  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const c = await cookies();
  c.set(COOKIE, "", { httpOnly: true, sameSite: "lax", secure: false, path: "/", maxAge: 0 });
}

export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const uid = String(payload.uid || "");
    const role = payload.role === "admin" ? "admin" : "seller";
    const handle = String(payload.handle || "");
    if (!uid || !handle) return null;
    return { uid, role, handle };
  } catch {
    return null;
  }
}

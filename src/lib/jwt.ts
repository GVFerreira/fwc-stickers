import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? "change-me-in-production"
  );
}

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.sub as string;
  } catch {
    return null;
  }
}

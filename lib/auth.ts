import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";

const SECRET = process.env.JWT_SECRET!;

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export function createToken(payload: object) {
  return jwt.sign(payload, SECRET, {
    algorithm: "HS256",
    expiresIn: "1h",
    jwtid: crypto.randomUUID(),
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET, { algorithms: ["HS256"] });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) return null;
    return null;
  }
}

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        let token = cookieStore.get("token")?.value;

        if (!token) {
            const headersList = await headers();
            const authHeader = headersList.get("authorization");
            token = authHeader?.replace("Bearer ", "");
        }

        if (!token) {
            return null;
        }

        const user = verifyToken(token);
        return user;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}


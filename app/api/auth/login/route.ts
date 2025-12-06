import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, createToken } from "@/lib/auth";



export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Az email és a jelszó egy kötelező mező" },
        { status: 400 },
      );
    }

    const result = await db.select().from(users).where(eq(users.email, email));
    const user = result[0];

    if (!user) {
      return NextResponse.json(
        { error: "Érvénytelen email cím vagy jelszó" },
        { status: 401 },
      );
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Érvénytelen email cím vagy jelszó" },
        { status: 401 },
      );
    }

    const token = createToken({
      id: user.id,
      email: user.email,
    });

    const response = NextResponse.json({
      message: "Sikeres bejelentkezés",
      user: {
        id: user.id,
        email: user.email,
      },
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 6 * 60 * 60, // 6 óra
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json({ error: "Sikertelen bejelentkezés" }, { status: 500 });
  }
}

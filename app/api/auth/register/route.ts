import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { username, email, password } = await req.json();

        if (!email || !password || !username) {
            return NextResponse.json(
                { error: "Érvénytelen mezők" },
                { status: 400 },
            );
        }

        const hashed = await hashPassword(password);

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        if (existingUser.length > 0) {
            return NextResponse.json(
                { error: "A felhasználónév már használatban van" },
                { status: 400 }
            );
        }

        const existingEmail = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingEmail.length > 0) {
            return NextResponse.json(
                { error: "Az email cím már használatban van" },
                { status: 400 }
            );
        }

        await db.insert(users).values({
            username,
            email,
            password: hashed,
        });

        return NextResponse.json({ message: "Sikeres regisztrálás" });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json(
            { error: "Sikertelen regisztráció" },
            { status: 500 },
        );
    }
}

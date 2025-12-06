import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json({
            message: "Sikeres kijelentkezés",
        });

        response.cookies.set({
            name: "token",
            value: "",
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 0,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Sikertelen kijelentkezés" }, { status: 500 });
    }
}

export async function GET() {
    return POST();
}

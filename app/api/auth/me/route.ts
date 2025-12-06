import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        let token = authHeader?.split(" ")[1];

        if (!token) {
            const cookieHeader = req.headers.get("cookie");
            if (cookieHeader) {
                const cookies = Object.fromEntries(
                    cookieHeader.split("; ").map((c) => c.split("=")),
                );
                token = cookies.token;
            }
        }

        if (!token) {
            return NextResponse.json({ error: "Nincs token" }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: "Érvénytelen token" },
                { status: 403 },
            );
        }

        return NextResponse.json({ user: decoded });
    } catch (error) {
        console.error("Auth check error:", error);
        return NextResponse.json({ error: "Szerver hiba" }, { status: 500 });
    }
}

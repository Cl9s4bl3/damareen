"use client";

import { toast } from "sonner";
import React from "react";
import { z } from "zod";
import AutoForm from "@/components/AutoForm";
import Link from "next/link";
import { useRouter } from "next/navigation";

const signInSchema = z.object({
    email: z.string().email("Kérünk, hogy egy valós email címet adj meg"),
    jelszó: z.string().min(8, "A jelszónak minimum 8 karakter hosszúnak kell lennie"),
});

const formStyles = {
    buttonClassName: "w-full bg-green-600/40 hover:bg-green-700/40 text-white",
};

const Page = () => {
    const router = useRouter();

    async function handleSignIn(data: any) {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: data.email,
                    password: data.jelszó,
                }),
            });

            console.log("Response status:", res.status);

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                console.error("Non-JSON response:", text.substring(0, 200));
                throw new Error(
                    `Szerver hiba: ${res.status}. Kérjük, próbáld újra.`,
                );
            }

            const result = await res.json();
            console.log("Response data:", result);

            if (!res.ok) {
                throw new Error(result.error || "Sikertelen bejelentkezés");
            }

            toast.success("Sikeres bejelentkezés");
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Bejelentkezési hiba: ", err);
            toast.error(err.message);
        }
    }

    return (
        <div className="flex justify-center items-center w-full min-h-screen">
            <div className={"md:w-1/2"}>
                <h1 className={"font-semibold text-4xl mb-6"}>Bejelentkezés</h1>
                <AutoForm
                    schema={signInSchema}
                    defaultValues={{
                        email: "",
                        jelszó: "",
                    }}
                    submitLabel={"Bejelentkezés"}
                    styles={formStyles}
                    onSubmit={handleSignIn}
                    toLink="/"
                />
                <p className="mt-5">
                    Nincs még fiókod? {" "}
                    <Link href={"/sign-up"} className={"font-semibold"}>
                        Regisztrálj
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Page;

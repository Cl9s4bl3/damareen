"use client";

import React from "react";
import { z } from "zod";
import AutoForm from "@/components/AutoForm";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const signInSchema = z.object({
    email: z.email("Kérünk, hogy egy valódi email címet adj meg"),
    felhasználónév: z.string("Kérünk, hogy egy valós nevet adj meg").min(6, "A névnek legalább 6 karakter hosszúnak kell lennie"),
    jelszó: z.string().min(8, "A jelszónak minimum 8 karakter hosszúnak kell lennie"),
});

const formStyles = {
    buttonClassName: "w-full bg-green-600/40 hover:bg-green-700/40 text-white",
};

const Page = () => {
    const router = useRouter();
    async function handleSignup(data: any) {

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: data.felhasználónév,
                    email: data.email,
                    password: data.jelszó,
                }),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || "Sikertelen regisztráció");

            router.push("/sign-in");

            toast.success("Sikeres regisztráció!");
        } catch (err: any) {
            toast.error(err.message || "Valami félre ment :c");
        }
    }
    return (
        <div className="flex justify-center items-center w-full min-h-screen">
            <div className={"md:w-1/2"}>
                <h1 className={"font-semibold text-4xl mb-6"}>Regisztráció</h1>
                <AutoForm
                    schema={signInSchema}
                    defaultValues={{
                        email: "",
                        felhasználónév: "",
                        jelszó: "",
                    }}
                    submitLabel={"Regisztráció"}
                    styles={formStyles}
                    onSubmit={handleSignup}
                    toLink={""}
                />
                <p className="mt-5">
                    Már van fiókod? {" "}
                    <Link href={"/sign-in"} className={"font-semibold"}>
                        Bejelentkezés
                    </Link>
                </p>
            </div>
        </div>
    );
};
export default Page;

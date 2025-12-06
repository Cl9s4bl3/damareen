export const dynamic = "force-dynamic";


import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AsciiBg from "@/components/backgrounds/AsciiBg";

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (user) {
        redirect("/");
    }

    return (
        <div>
            <AsciiBg type="desert" />
            {children}
        </div>
    );
}

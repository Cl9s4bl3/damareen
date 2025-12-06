import NavbarUser from "@/components/NavbarUser";
import AsciiBg from "@/components/backgrounds/AsciiBg";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            <NavbarUser />
            <AsciiBg type="forest"/>
            <div className="">{children}</div>
        </div>
    );
}

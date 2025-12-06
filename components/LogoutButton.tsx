"use client";

export default function LogoutButton() {

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (res.ok) {
                window.location.href = "/";
            } else {
                console.error("Logout failed");
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 text-red-400 hover:text-red-300 cursor-pointer"
        >
            Kijelentkezés
        </button>
    );
}

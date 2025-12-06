"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import LogoutButton from "@/components/LogoutButton";

export default function NavbarUser() {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    const { scrollY } = useScroll();

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setUser(data?.user))
            .catch(() => setUser(null));
    }, []);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const currentScrollY = latest;
        if (currentScrollY < lastScrollY) setIsVisible(true);
        else if (currentScrollY > lastScrollY && currentScrollY > 100)
            setIsVisible(false);
        setLastScrollY(currentScrollY);
    });


    const navLinks = [
        { href: "/", label: "Kezdőlap" }
    ].filter(Boolean);

    if (user) {
        navLinks.push({ href: "/dashboard", label: "Dashboard" });
        navLinks.push({ component: LogoutButton, label: "Kijelentkezés" });
    } else {
        navLinks.push({ href: "/sign-in", label: "Bejelentkezés" });
    }

    const navVariants = {
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 },
    };

    return (
        <motion.nav
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
            variants={navVariants}
            animate={isVisible ? "visible" : "hidden"}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            <div className="bg-gray-900/50 backdrop-blur-md border border-gray-900 rounded-full px-6 py-3 shadow-lg">
                <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
                    {/* PC Nav */}
                    <div className="hidden md:flex items-center space-x-1">

                        {navLinks.map((item, i) => {
                            if (item.component) {
                                const Component = item.component;
                                return <Component key={i} />;
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                                        "hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500",
                                        item.href === "/dashboard" || item.href === "/sign-in"
                                            ? "text-green-400 hover:text-green-300"
                                            : "text-gray-100 hover:text-white",
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}

                    </div>

                    {/* Telefon Nav */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-100 hover:bg-gray-800 hover:text-white rounded-full"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="bg-gray-900 border-gray-700 text-white">
                                <SheetTitle className="sr-only">
                                    Navigation Menu
                                </SheetTitle>
                                <div className="flex flex-col space-y-3 mt-8">
                                    {navLinks.map((item, i) => {
                                        if (item.component) {
                                            const Component = item.component;
                                            return <Component key={i} />;
                                        }

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                                                    "hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 text-center",
                                                    item.href === "/dashboard" || item.href === "/sign-in"
                                                        ? "text-green-400 hover:text-green-300"
                                                        : "text-gray-100 hover:text-white",
                                                )}
                                            >
                                                {item.label}
                                            </Link>
                                        );
                                    })}

                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}

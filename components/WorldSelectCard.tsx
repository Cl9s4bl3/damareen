"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import ResizableAsciiBg from "@/components/backgrounds/ResizableAsciiBg";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {React } from "react";
import {toast} from "sonner"

export function WorldSelectCard({ world, index, currentUserId }: { world: any; index: number; currentUserId: string }) {
    const getWorldTheme = (bgStyle: string) => {
        const themes = {
            forest: {
                gradient: "from-gray-800/90 to-gray-900/90",
                border: "border-gray-600/40",
                accent: "text-emerald-400",
                bgAccent: "bg-emerald-500/20"
            },
            mountains: {
                gradient: "from-gray-800/90 to-gray-900/90",
                border: "border-gray-600/40",
                accent: "text-blue-400",
                bgAccent: "bg-blue-500/20"
            },
            desert: {
                gradient: "from-gray-800/90 to-gray-900/90",
                border: "border-gray-600/40",
                accent: "text-amber-400",
                bgAccent: "bg-amber-500/20"
            },
            palm_desert: {
                gradient: "from-gray-800/90 to-gray-900/90",
                border: "border-gray-600/40",
                accent: "text-yellow-400",
                bgAccent: "bg-yellow-500/20"
            },
        };
        return themes[bgStyle as keyof typeof themes] || themes.forest;
    };

    const theme = getWorldTheme(world.bgStyle);

    const isCreator = currentUserId === world.createdBy;

    const handleDelete = async () => {
        if (!confirm("Biztos, hogy törölni szeretnéd ezt a világot?")) return;
        try {
            const res = await fetch("/api/worlds/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ worldId: world.id }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error("Hiba történt a törlés során.");
                return;
            }

            toast.success("Világ sikeresen törölve!");
            window.location.reload();
        } catch (err) {
            console.error(err);
            toast.error("Hiba történt a törlés során.");
        }
    };

    return (
        <>
            <Card className={`
            relative group h-full min-h-[420px] rounded-3xl
            bg-gradient-to-br ${theme.gradient}
            border ${theme.border}
            backdrop-blur-xl
            transition-all duration-500 ease-out
            hover:-translate-y-2 hover:scale-[1.02]
            hover:shadow-2xl hover:shadow-gray-900/50
            overflow-hidden
            animate-fade-in-up
        `} style={{ animationDelay: `${index * 100}ms` }}>

                {/* ASCII háttér */}
                <ResizableAsciiBg
                    type={world.bgStyle}
                    rows={40}
                    cols={60}
                    opacity={0.08}
                    className="rounded-3xl"
                />

                {/* Animált overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 z-0" />

                {/* Header a világ nevével */}
                <CardHeader className="relative z-10 text-center p-8 pb-4">
                    <div className="mb-4">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full ${theme.bgAccent} mb-4`}>
                        <span className={`text-sm font-semibold ${theme.accent}`}>
                            {world.bgStyle === 'forest' && 'Erdő'}
                            {world.bgStyle === 'mountains' && 'Hegység'}
                            {world.bgStyle === 'desert' && 'Sivatag'}
                            {world.bgStyle === 'palm_desert' && 'Pálma Sivatag'}
                        </span>
                        </div>
                        <CardTitle className="text-3xl font-bold text-white tracking-wide drop-shadow-2xl mb-2">
                            {world.name}
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-lg leading-relaxed max-w-sm mx-auto line-clamp-2" title={world.description}>
                            {world.description || "A készítő nem adott meg leírást ehhez a világhoz."}
                        </CardDescription>
                    </div>
                </CardHeader>

                {/* Kontent */}
                <CardContent className="relative z-10 px-8 pb-8 space-y-6">
                    {/* Statok */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <StatItem
                            label="Készítő"
                            value={world.creatorName}
                            icon={`♛`}
                            accent="text-gray-200"
                            title={world.creatorName}
                        />
                        <StatItem
                            label="Kártyák"
                            value={world.normalCardsCount}
                            icon={`🂡`}
                            accent="text-blue-300"
                        />
                        <StatItem
                            label="Kazamaták"
                            value={world.dungeonsCount}
                            icon="♖"
                            accent="text-purple-300"
                        />
                        <StatItem
                            label="Aktív"
                            value="Igen"
                            icon="✓"
                            accent="text-emerald-300"
                        />
                    </div>

                    {/* Világ mérete indikátor */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm text-gray-300">
                            <span>Világ mérete</span>
                            <span className="font-semibold">
                            {world.normalCardsCount + world.dungeonsCount > 19 ? 'Nagy' :
                                world.normalCardsCount + world.dungeonsCount > 10 ? 'Közepes' : 'Kicsi'}
                        </span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-gray-500 to-gray-400 h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${Math.min(100, (world.normalCardsCount + world.dungeonsCount) * 5)}%`
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Készült mikor */}
                    <div className="text-center text-gray-400 text-sm border-t border-gray-700/50 pt-4">
                        Létrehozva: {new Date(world.createdAt).toLocaleDateString('hu-HU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                    </div>

                    {/* Akció gombok */}
                    <Button
                        asChild
                        size="lg"
                        className={`w-full mt-4 text-white font-bold text-lg py-6 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 border border-gray-500/30 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg active:scale-95`}

                    >
                        <Link href={`/world/${world.id}`}>
                            <span className="drop-shadow-md">Világ Megnyitása</span>
                            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </Button>
                    {isCreator && (
                        <div className="flex gap-4 mt-4 justify-center">
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete()}
                                className="w-full mt-0 text-white font-bold text-lg py-6 rounded-2xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 border border-red-500/30 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg active:scale-95 cursor-pointer"

                            >
                                Törlés
                            </Button>
                        </div>
                    )}
                </CardContent>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-gray-500/5 to-gray-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
            </Card>
        </>
    );
}

function StatItem({ label, value, icon, accent = "text-gray-100", title }: {
    label: string;
    value: string | number;
    icon: string;
    accent?: string;
    title?: string;
}) {
    return (
        <div className="text-center p-3 bg-black/30 rounded-xl backdrop-blur-sm border border-gray-600/30" title={title}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className={`font-bold text-lg ${accent}`}>{value}</div>
        </div>
    );
}
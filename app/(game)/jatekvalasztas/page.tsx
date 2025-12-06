import { db } from "@/db";
import { worlds, users, normalCards, dungeons } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AsciiBg from "@/components/backgrounds/AsciiBg";
import React from "react";
import {WorldSelectCard} from "@/components/WorldSelectCard";

export default async function AvailableWorldsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const availableWorlds = await db
        .select({
            id: worlds.id,
            name: worlds.name,
            description: worlds.description,
            bgStyle: worlds.bgStyle,
            createdAt: worlds.createdAt,
            createdBy: worlds.createdBy,
            creatorName: users.username,
            normalCardsCount: sql<number>`COUNT(DISTINCT ${normalCards.id})`,
            dungeonsCount: sql<number>`COUNT(DISTINCT ${dungeons.id})`,
        })
        .from(worlds)
        .leftJoin(users, eq(worlds.createdBy, users.id))
        .leftJoin(normalCards, eq(worlds.id, normalCards.worldId))
        .leftJoin(dungeons, eq(worlds.id, dungeons.worldId))
        .where(eq(worlds.isActive, true))
        .groupBy(worlds.id, users.username)
        .orderBy(sql`${worlds.createdAt} DESC`);


    return (
        <div className="min-h-screen">
            <div className="container mx-auto p-6 relative z-10">
                <AsciiBg type="mountains" opacity={0.03} />

                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-block">
                        <h1 className="text-5xl font-bold mb-4 tracking-tight text-white">
                            Világok Felfedezése
                        </h1>
                    </div>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Válassz egy világot, ahol elkezded a kalandodat! Mindegyik világ egyedi történetekkel,
                        kihívásokkal és rejtélyekkel vár.
                    </p>

                </div>

                <div className="space-y-10">
                    {availableWorlds.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-8xl mb-6">🌍</div>
                            <h2 className="text-3xl font-bold text-white mb-4">
                                Még nincsenek elérhető világok
                            </h2>
                            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                                A játékmesterek még nem hoztak létre világokat, vagy egyelőre nincs aktív világ.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {availableWorlds.map((world, index) => (
                                <WorldSelectCard key={world.id} world={world} index={index} currentUserId={user.id} />
                            ))}
                        </div>
                    )}

                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            className="
  px-4 py-2 md:px-6 md:py-2
  rounded-md font-semibold
  transition-all transform
  text-sm md:text-base
  bg-gray-700 text-gray-100
  hover:bg-white hover:text-black
  hover:scale-105 active:scale-95
  cursor-pointer
"
                        >
                            <Link href="/dashboard">Vissza a dashboard-ra</Link>
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}


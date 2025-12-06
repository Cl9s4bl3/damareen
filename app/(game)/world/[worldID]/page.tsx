import { db } from "@/db";
import { worlds, users, normalCards, dungeons, worldAvailableCards, dungeonTypes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import AsciiBg from "@/components/backgrounds/AsciiBg";
import WorldCard from "@/components/game/WorldCard";
import Link from "next/link"

const Page = async ({ params }: { params: Promise<{ worldID: string }> }) => {
    const { worldID } = await params;

    const world = await db
        .select({
            id: worlds.id,
            name: worlds.name,
            description: worlds.description,
            bgStyle: worlds.bgStyle,
            createdAt: worlds.createdAt,
            creatorName: users.username,
        })
        .from(worlds)
        .leftJoin(users, eq(worlds.createdBy, users.id))
        .where(eq(worlds.id, worldID))
        .then(res => res[0]);

    if (!world) {
        notFound();
    }

    const availableNormalCards = await db
        .select({
            id: normalCards.id,
            name: normalCards.name,
            description: normalCards.description,
            asciiArt: normalCards.asciiArt,
            health: normalCards.health,
            damage: normalCards.damage,
            type: normalCards.type,
        })
        .from(worldAvailableCards)
        .innerJoin(normalCards, eq(worldAvailableCards.normalCardId, normalCards.id))
        .where(
            and(
                eq(worldAvailableCards.worldId, worldID),
                eq(worldAvailableCards.isAvailable, true)
            )
        );

    const worldDungeons = await db
        .select({
            id: dungeons.id,
            name: dungeons.name,
            description: dungeons.description,
            typeName: dungeonTypes.name,
            rewardDescription: dungeonTypes.rewardDescription,
            normalCardsCount: dungeonTypes.normalCardsCount,
            vezerCardsCount: dungeonTypes.vezerCardsCount,
        })
        .from(dungeons)
        .innerJoin(dungeonTypes, eq(dungeons.typeId, dungeonTypes.id))
        .where(eq(dungeons.worldId, worldID));

    return (
        <div className="min-h-screen relative">
            <AsciiBg type={world.bgStyle} opacity={0.1} />

            <div className="relative z-10 container mx-auto p-6">
                <div className="text-center mb-12 py-16 px-4 rounded-xl">
                    <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-2">Világ áttekintése</h2>

                    <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 drop-shadow-2xl">
                        {world.name}
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
                        {world.description || "Fedezd fel ezt a rejtélyes világot!"}
                    </p>

                    <div className="text-gray-400 text-sm sm:text-base">
                        Készítette: <span className="text-white font-semibold">{world.creatorName}</span>
                    </div>
                </div>


                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-white">
                            Használható kártyák ({availableNormalCards.length})
                        </h2>
                    </div>

                    {availableNormalCards.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-6">
                            {availableNormalCards.map((card, index) => (
                                <WorldCard
                                    key={card.id}
                                    card={card}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-black/30 rounded-2xl backdrop-blur-sm border border-gray-700/50">
                            <div className="text-6xl mb-4">🃏</div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Még nincsenek elérhető kártyák
                            </h3>
                            <p className="text-gray-400 max-w-md mx-auto">
                                A játékmester még nem tett elérhetővé kártyákat ehhez a világhoz.
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h3 className="text-3xl font-bold text-white">
                            Kazamaták
                        </h3>
                        <span className="px-3 py-1 rounded-full text-sm bg-gray-800/50 text-white">
                            {worldDungeons.length} db
                        </span>
                    </div>

                    {worldDungeons.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {worldDungeons.map((dungeon) => (
                                <div
                                    key={dungeon.id}
                                    className="p-6 rounded-lg bg-black/40 backdrop-blur-md border border-gray-700/50"
                                    style={{
                                        borderLeftColor: "hsl(45, 100%, 50%)",
                                    }}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-2xl text-yellow-400">
                                                    {dungeon.name}
                                                </h4>
                                                <span className="px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-300">
                                                    {dungeon.typeName}
                                                </span>
                                            </div>

                                            {dungeon.description && (
                                                <p className="text-gray-300 leading-relaxed">
                                                    {dungeon.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400">Nyeremény:</span>
                                                    <span className="font-bold text-green-400">
                                                        {dungeon.rewardDescription}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400">Ellenségek:</span>
                                                    <span className="font-bold">
                                                        {dungeon.normalCardsCount + dungeon.vezerCardsCount} db
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kazamata kártyaszám */}
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <div className="flex gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-400">Normál:</span>
                                                <span className="text-white">{dungeon.normalCardsCount} db</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-purple-400">Vezér:</span>
                                                <span className="text-white">{dungeon.vezerCardsCount} db</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-black/30 rounded-2xl backdrop-blur-sm border border-gray-700/50">
                            <div className="text-6xl mb-4">🏰</div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Nincsenek kazamaták
                            </h3>
                            <p className="text-gray-400 max-w-md mx-auto">
                                A játékmester még nem hozott létre kazamatákat ehhez a világhoz.
                            </p>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row justify-center items-center px-4 gap-5">
                        <Link
                            href={`/jatek/${world.id}`}
                            className="bg-gradient-to-r from-blue-900 to-transparent text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 active:scale-95 text-center w-full max-w-xs"

                        >
                            Kezdj bele a kihívásba
                        </Link>

                        <Link
                            href={`/jatekvalasztas`}
                            className="bg-gradient-to-l from-gray-700 to-transparent text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 active:scale-95 text-center w-full max-w-xs"

                        >
                            Megfutamodás (vissza)
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AsciiBg from "@/components/backgrounds/AsciiBg";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { DungeonSelection } from "@/components/game/DungeonSelection";
import { BattleView } from "@/components/game/BattleView";
import { LevelUpSelection } from "@/components/game/LevelUpComponent";
type ViewState = "dungeonSelection" | "battle" | "levelUp";

export default function WorldPage() {
    const params = useParams();
    const router = useRouter();
    const worldId = params.worldId || params.worldID;
    const [worldData, setWorldData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState<ViewState>("dungeonSelection");
    const [selectedDungeon, setSelectedDungeon] = useState<any>(null);
    const [selectedCards, setSelectedCards] = useState<any[]>([]);
    const [battleResult, setBattleResult] = useState<{ playerWon: boolean; playerWins: number; enemyWins: number } | null>(null);

    const [battleKey, setBattleKey] = useState<number>(0);

    useEffect(() => {
        if (!worldId) {
            console.warn("No worldId found in URL params:", params);
            toast.error("Hiányzó világ azonosító");
            setLoading(false);
            return;
        }

        const fetchWorldData = async () => {
            try {
                setLoading(true);
                console.log("Fetching world data for worldId:", worldId);

                const apiUrl = `/api/worlds/getFull?worldId=${worldId}`;
                const response = await fetch(apiUrl);
                const data = await response.json();

                console.log("World data loaded:", data);

                if (response.ok) {
                    console.log("World data loaded successfully with dungeons:", data.dungeons);
                    setWorldData(data);
                } else {
                    console.error("API error:", data.error);
                    setWorldData(null);

                    if (response.status === 400) {
                        toast.error("Érvénytelen világ azonosító");
                    } else if (response.status === 404) {
                        toast.error("Világ nem található");
                    } else {
                        toast.error("Hiba történt a világ betöltése során");
                    }
                }
            } catch (error) {
                console.error("Network or unexpected error:", error);
                setWorldData(null);
                toast.error("Hálózati hiba a világ betöltésekor");
            } finally {
                setLoading(false);
            }
        };

        fetchWorldData();
    }, [worldId]);

    const handleDungeonSelect = (dungeon: any, selectedCardsArray: any[]) => {
        console.log("Dungeon selected:", dungeon);
        console.log("Selected cards for battle:", selectedCardsArray);
        setSelectedDungeon(dungeon);
        setSelectedCards(selectedCardsArray);
        setCurrentView("battle");
        setBattleKey((k) => k + 1);
        setBattleResult(null);
        toast.info("Csata elindítva!");
    };

    const handleBackToDungeonSelection = () => {
        setCurrentView("dungeonSelection");
        setSelectedDungeon(null);
        setSelectedCards([]);
        setBattleResult(null);
    };

    const handleBattleFinished = (result: { playerWon: boolean; playerWins: number; enemyWins: number }) => {
        setBattleResult(result);

        if (result.playerWon) {
            setCurrentView("levelUp");
            toast.success("Győzelem! Válassz egy kártyát a fejlesztéshez.");
        } else {
            setTimeout(() => {
                setCurrentView("dungeonSelection");
                setSelectedDungeon(null);
                setSelectedCards([]);
                setBattleResult(null);
            }, 800);
        }
    };

    const handleCardUpgrade = async (cardId: string) => {
        try {
            toast.info("Kártya fejlesztése...");

            const response = await fetch("/api/cards/upgrade", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cardId: cardId,
                    dungeonId: selectedDungeon.id,
                    worldId: worldId,
                    rewardType: selectedDungeon.dungeonType.rewardType,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Upgrade successful:", result);

                const { damageIncrease, healthIncrease } = result.card;
                let successMessage = "Kártya sikeresen fejlesztve!";

                if (damageIncrease > 0 && healthIncrease > 0) {
                    successMessage += ` +${damageIncrease} támadás, +${healthIncrease} életerő`;
                } else if (damageIncrease > 0) {
                    successMessage += ` +${damageIncrease} támadás`;
                } else if (healthIncrease > 0) {
                    successMessage += ` +${healthIncrease} életerő`;
                }

                toast.success(successMessage);

                const refreshResponse = await fetch(`/api/worlds/getFull?worldId=${worldId}`);
                if (refreshResponse.ok) {
                    const refreshedData = await refreshResponse.json();
                    setWorldData(refreshedData);
                }

                setCurrentView("dungeonSelection");
                setSelectedDungeon(null);
                setSelectedCards([]);
                setBattleResult(null);
            } else {
                const error = await response.json();
                throw new Error(error.message || "Upgrade failed");
            }
        } catch (error) {
            console.error("Error upgrading card:", error);
            toast.error("Hiba történt a fejlesztés során");
        }
    };

    const handleSkipLevelUp = () => {
        toast.info("Szintlépés kihagyva");
        setCurrentView("dungeonSelection");
        setSelectedDungeon(null);
        setSelectedCards([]);
        setBattleResult(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg">Világ betöltése...</div>
                    <div className="text-sm text-gray-400 mt-2">Adatok inicializálása</div>
                </div>
                <AsciiBg type="forest" />
            </div>
        );
    }

    if (!worldData?.world) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-red-400">Világ nem található</div>
                    <button onClick={() => router.push("/")} className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                        Vissza a Főoldalra
                    </button>
                </div>
                <AsciiBg type="forest" />
            </div>
        );
    }

    const { world, playerCards, dungeons } = worldData;

    return (
        <div className="min-h-screen p-4 text-gray-100 relative">
            <div className="max-w-6xl mx-auto">
                {/* Világ header - mindig látszódik */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{world.name}</h1>
                    <p className="text-gray-300 text-lg">{world.description}</p>
                    <div className="text-gray-400 mt-2">{playerCards.length} elérhető kártya • {dungeons?.length || 0} kazamata</div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Kazamata választó */}
                    {currentView === "dungeonSelection" && (
                        <DungeonSelection dungeons={dungeons || []} playerCards={playerCards} onDungeonSelect={handleDungeonSelect} onBack={() => router.push(`/world/${worldId}`)} />
                    )}


                    {currentView === "battle" && selectedDungeon && (
                        // Kulcs a remount miatt restartnál
                        <div className="relative">
                            <BattleView
                                key={battleKey}
                                selectedDungeon={selectedDungeon}
                                selectedCards={selectedCards}
                                playerCards={playerCards}
                                onBack={handleBackToDungeonSelection}
                                onBattleFinished={handleBattleFinished}
                            />
                        </div>
                    )}

                    {/* Level up kép */}
                    {currentView === "levelUp" && battleResult?.playerWon && (
                        <LevelUpSelection
                            playerCards={playerCards?.filter((c) => c && c.id) || []}
                            dungeonName={selectedDungeon?.name || ""}
                            dungeonReward={selectedDungeon?.dungeonType?.rewardDescription || "Alap szintlépés"}
                            dungeonRewardType={selectedDungeon?.dungeonType?.rewardType || ""}
                            onUpgradeSelect={handleCardUpgrade}
                            onSkip={handleSkipLevelUp}
                        />
                    )}
                </AnimatePresence>
            </div>

            <AsciiBg type={worldData.world.bgStyle} />
        </div>
    );
}

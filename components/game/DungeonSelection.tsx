"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import WorldCard from "@/components/game/WorldCard";

interface DungeonSelectionProps {
    dungeons: any[];
    playerCards: any[];
    onDungeonSelect: (dungeon: any, selectedCards: any[]) => void;
    onBack: () => void;
}

export function DungeonSelection({ dungeons, playerCards, onDungeonSelect, onBack }: DungeonSelectionProps) {
    const [selectedDungeon, setSelectedDungeon] = useState<any>(null);
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [showDeckBuilder, setShowDeckBuilder] = useState(false);

    const handleDungeonSelect = (dungeon: any) => {
        setSelectedDungeon(dungeon);
        setShowDeckBuilder(true);
    };

    const handleCardSelect = (cardId: string) => {
        setSelectedCards(prev => {
            if (prev.includes(cardId)) {
                return prev.filter(id => id !== cardId);
            } else {
                const dungeonCardCount = getDungeonEnemies(selectedDungeon).length;
                if (prev.length < dungeonCardCount) {
                    return [...prev, cardId];
                }
                return prev;
            }
        });
    };

    const handleStartBattle = () => {
        const dungeonCardCount = getDungeonEnemies(selectedDungeon).length;
        if (selectedCards.length !== dungeonCardCount) {
            alert(`Válassz pontosan ${dungeonCardCount} kártyát a csatához!`);
            return;
        }

        const selectedCardObjects = selectedCards.map(id =>
            availableCards.find(card => card.id === id)
        ).filter(card => card !== undefined);


        onDungeonSelect(selectedDungeon, selectedCardObjects);
    };

    const handleBackToSelection = () => {
        setSelectedDungeon(null);
        setShowDeckBuilder(false);
        setSelectedCards([]);
    };

    const availableCards = playerCards.map(playerCard => ({
        id: playerCard.id,
        name: playerCard.normalCard.name,
        description: playerCard.normalCard.description,
        asciiArt: playerCard.normalCard.asciiArt,
        health: playerCard.currentHealth,
        damage: playerCard.currentDamage,
        type: playerCard.normalCard.type
    }));

    const getDungeonEnemies = (dungeon: any) => {
        if (dungeon.cards && dungeon.cards.length > 0) {
            return dungeon.cards.map((card: any, index: number) => ({
                ...card,
                order: card.order || index,
                isVezer: card.cardType === 'vezer'
            }));
        }

        const enemies = [];
        let order = 1;

        if (dungeon.dungeonType?.normalCards) {
            dungeon.dungeonType.normalCards.forEach((card: any) => {
                enemies.push({
                    ...card,
                    order: order++,
                    isVezer: false,
                    cardType: 'normal'
                });
            });
        }

        if (dungeon.dungeonType?.vezerCards) {
            dungeon.dungeonType.vezerCards.forEach((card: any) => {
                enemies.push({
                    ...card,
                    order: order++,
                    isVezer: true,
                    cardType: 'vezer'
                });
            });
        }

        return enemies;
    };

    const getElementColor = (type: string) => {
        switch (type) {
            case 'fire': return 'hsl(0, 70%, 50%)';
            case 'water': return 'hsl(210, 80%, 60%)';
            case 'earth': return 'hsl(35, 50%, 40%)';
            case 'air': return 'hsl(160, 60%, 55%)';
            default: return 'hsl(0, 0%, 50%)';
        }
    };

    const getDungeonTypeName = (dungeonType: any) => {
        return dungeonType?.name || "Ismeretlen";
    };

    const getDungeonReward = (dungeonType: any) => {
        return dungeonType?.rewardDescription || "Nincs megadva";
    };

    if (showDeckBuilder && selectedDungeon) {
        const dungeonEnemies = getDungeonEnemies(selectedDungeon);
        const requiredCardCount = dungeonEnemies.length;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-7xl mx-auto"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-yellow-400">PAKLI ÖSSZEÁLLÍTÁSA</h2>
                    <p className="text-gray-300 text-lg">
                        Válassz kártyákat a <span className="text-yellow-300">{selectedDungeon.name}</span> kazamatahoz
                    </p>
                    <div className={`text-lg font-semibold mt-2 ${
                        selectedCards.length === requiredCardCount ? "text-green-400" : "text-yellow-400"
                    }`}>
                        {selectedCards.length}/{requiredCardCount} kártya kiválasztva
                    </div>
                </div>

                {/* Ellenfél kártyák */}
                <div className="mb-8 p-6 rounded-lg" style={{ background: "hsl(0, 0%, 15%)" }}>
                    <h3 className="text-xl font-bold mb-4 text-center text-red-400">
                        Ellenséges Kártyák ({dungeonEnemies.length} db)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dungeonEnemies.map((enemy: any, index: number) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 p-4 rounded-lg group"
                                style={{
                                    background: "hsl(0, 0%, 18%)",
                                    borderLeft: `4px solid ${
                                        enemy.cardType === "vezer"
                                            ? "hsl(260, 60%, 60%)"
                                            : getElementColor(enemy.type)
                                    }`,
                                }}
                            >
                                {/* Sorrend szám */}
                                <div
                                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm"
                                    style={{
                                        background:
                                            enemy.cardType === "vezer"
                                                ? "hsl(260, 60%, 30%)"
                                                : "hsl(0, 0%, 25%)",
                                        color: "hsl(0, 0%, 95%)",
                                    }}
                                >
                                    {enemy.order + 1}
                                </div>

                                {/* Kártya info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className={
                                                enemy.cardType === "vezer"
                                                    ? "text-purple-300 font-bold text-lg"
                                                    : "font-bold text-lg text-white"
                                            }
                                        >
                                            {enemy.cardType === "vezer" ? "⚡ " : ""}
                                            {enemy.name}
                                        </span>
                                        <span className="text-sm text-gray-400 capitalize">
                                            {enemy.type === "fire" ? (
                                                <span>🔥 Tűz</span>
                                            ) : enemy.type === "water" ? (
                                                <span>💧 Víz</span>
                                            ) : enemy.type === "earth" ? (
                                                <span>🪨 Föld</span>
                                            ) : enemy.type === "air" ? (
                                                <span>💨 Levegő</span>
                                            ) : (
                                                <span>???</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span>Seb: {enemy.damage}</span>
                                        <span>HP: {enemy.health}</span>
                                        <span
                                            className={
                                                enemy.cardType === "vezer"
                                                    ? "text-purple-400 font-semibold"
                                                    : "text-blue-400"
                                            }
                                        >
                                            {enemy.cardType === "vezer"
                                                ? "Vezér"
                                                : "Normál"}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Kiválasztott kártyák */}
                <div className="mb-8 p-6 rounded-lg" style={{ background: "hsl(0, 0%, 15%)" }}>
                    <h3 className="text-xl font-bold mb-4 text-center text-green-400">
                        Kiválasztott Kártyáid ({selectedCards.length}/{requiredCardCount})
                    </h3>
                    {selectedCards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedCards.map((cardId, index) => {
                                const card = availableCards.find(c => c.id === cardId);
                                return card ? (
                                    <motion.div
                                        key={card.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                                        style={{
                                            background: "hsl(0, 0%, 18%)",
                                            borderLeft: `4px solid ${getElementColor(card.type)}`,
                                        }}
                                        onClick={() => handleCardSelect(card.id)}
                                    >
                                        {/* Sorrend szám */}
                                        <div
                                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm"
                                            style={{
                                                background: "hsl(120, 60%, 30%)",
                                                color: "hsl(0, 0%, 95%)",
                                            }}
                                        >
                                            {index + 1}
                                        </div>

                                        {/* Kártya info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-lg text-white">
                                                    {card.name}
                                                </span>
                                                <span className="text-sm text-gray-400 capitalize">
                                                    {card.type === "fire" ? (
                                                        <span>🔥 Tűz</span>
                                                    ) : card.type === "water" ? (
                                                        <span>💧 Víz</span>
                                                    ) : card.type === "earth" ? (
                                                        <span>🪨 Föld</span>
                                                    ) : card.type === "air" ? (
                                                        <span>💨 Levegő</span>
                                                    ) : (
                                                        <span>???</span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span>Seb: {card.damage}</span>
                                                <span>HP: {card.health}</span>

                                            </div>
                                        </div>
                                    </motion.div>
                                ) : null;
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-lg">Még nincsenek kiválasztott kártyák</div>
                            <div className="text-sm mt-2">Kattints az alábbi kártyákra a kiválasztáshoz</div>
                        </div>
                    )}
                </div>

                {/* Elérhető kártyák */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 text-center text-gray-300">
                        Elérhető kártyáid ({availableCards.length} db)
                    </h3>
                    <div className="grid grid-300 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-10 justify-center">
                        {availableCards.map((card, index) => (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className={`cursor-pointer transform transition-all duration-200 ${
                                    selectedCards.includes(card.id) ? "scale-105" : "hover:scale-105"
                                }`}
                                onClick={() => handleCardSelect(card.id)}
                            >
                                <WorldCard card={card} index={index} vezer={false} />
                                {selectedCards.includes(card.id) && (
                                    <div className="text-center mt-2 text-green-400 font-semibold">
                                        ✓ Kiválasztva
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>


                {/* Akciógombok */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={handleBackToSelection}
                        className="px-4 py-2 md:px-6 md:py-2 rounded-md font-semibold transition-all transform text-sm md:text-base bg-gray-700 text-gray-100 hover:bg-white hover:text-black hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        Vissza a Kazamatákhoz
                    </button>
                    <button
                        onClick={handleStartBattle}
                        disabled={selectedCards.length !== requiredCardCount}
                        className={`px-4 py-2 md:px-6 md:py-2 rounded-md font-semibold transition-all transform text-sm md:text-base hover:scale-105 active:scale-95 ${
                            selectedCards.length !== requiredCardCount
                                ? "bg-gray-600 cursor-not-allowed text-gray-400"
                                : "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                        }`}
                    >
                        Csata Megkezdése ({selectedCards.length}/{requiredCardCount})
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-6xl mx-auto"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 text-yellow-400">Válassz Kazamatát</h2>
                <p className="text-gray-300 text-lg">Válassz egy kazamatát a kihíváshoz</p>
                <div className="text-gray-400 mt-2">
                    {playerCards.length} kártya elérhető a paklihoz
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {dungeons && dungeons.length > 0 ? (
                    dungeons.map((dungeon: any, index: number) => {
                        const sortedCards = getDungeonEnemies(dungeon);

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-lg border-l-4 cursor-pointer hover:border-yellow-300 transition-colors"
                                style={{
                                    background: "hsl(0, 0%, 15%)",
                                    borderLeftColor: "hsl(45, 100%, 50%)",
                                }}
                                onClick={() => handleDungeonSelect(dungeon)}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-2xl text-yellow-400">
                                                {dungeon.name}
                                            </h4>
                                            <span
                                                className="px-3 py-1 rounded-full text-sm font-semibold"
                                                style={{ background: "hsl(45, 100%, 20%)" }}
                                            >
                                                {getDungeonTypeName(dungeon.dungeonType)}
                                            </span>
                                        </div>

                                        {dungeon.description && (
                                            <p className="text-gray-300 leading-relaxed text-lg">
                                                {dungeon.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-4 text-base">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">Nyeremény:</span>
                                                <span className="font-bold text-green-400">
                                                    {getDungeonReward(dungeon.dungeonType)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">Kártyák:</span>
                                                <span className="font-bold">
                                                    {sortedCards.length} db
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dungeon Cards with Order */}
                                {sortedCards.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-700">
                                        <h5 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-300">
                                            <span>Kazamata Kártyái</span>
                                            <span className="text-sm text-gray-400">
                                                (sorrend szerint)
                                            </span>
                                        </h5>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {sortedCards.map((card: any, cardIndex: number) => (
                                                <motion.div
                                                    key={cardIndex}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: cardIndex * 0.05 }}
                                                    className="flex items-center gap-3 p-3 rounded-lg group hover:bg-gray-700 transition-colors"
                                                    style={{
                                                        background: "hsl(0, 0%, 18%)",
                                                        borderLeft: `3px solid ${
                                                            card.cardType === "vezer"
                                                                ? "hsl(260, 60%, 60%)"
                                                                : getElementColor(card.type)
                                                        }`,
                                                    }}
                                                >
                                                    {/* Order Number */}
                                                    <div
                                                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm"
                                                        style={{
                                                            background:
                                                                card.cardType === "vezer"
                                                                    ? "hsl(260, 60%, 30%)"
                                                                    : "hsl(0, 0%, 25%)",
                                                            color: "hsl(0, 0%, 95%)",
                                                        }}
                                                    >
                                                        {card.order + 1}
                                                    </div>

                                                    {/* Card Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span
                                                                className={
                                                                    card.cardType === "vezer"
                                                                        ? "text-purple-300 font-bold text-lg"
                                                                        : "font-bold text-lg text-white"
                                                                }
                                                            >
                                                                {card.cardType === "vezer" ? "⚡ " : ""}
                                                                {card.name}
                                                            </span>
                                                            <span className="text-sm text-gray-400 capitalize">
                                                                {card.type === "fire" ? (
                                                                    <span>🔥 Tűz</span>
                                                                ) : card.type === "water" ? (
                                                                    <span>💧 Víz</span>
                                                                ) : card.type === "earth" ? (
                                                                    <span>🪨 Föld</span>
                                                                ) : card.type === "air" ? (
                                                                    <span>💨 Levegő</span>
                                                                ) : (
                                                                    <span>???</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                                            <span>Seb: {card.damage}</span>
                                                            <span>HP: {card.health}</span>
                                                            <span
                                                                className={
                                                                    card.cardType === "vezer"
                                                                        ? "text-purple-400 font-semibold"
                                                                        : "text-blue-400"
                                                                }
                                                            >
                                                                {card.cardType === "vezer"
                                                                    ? "Vezér"
                                                                    : "Normál"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Click Hint */}
                                <div className="mt-4 text-center">
                                    <div className="text-green-400 font-semibold text-lg">
                                        Kattints a kazamata kiválasztásához és a pakli összeállításához
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div
                        className="text-center py-12 text-gray-400 rounded-lg"
                        style={{ background: "hsl(0, 0%, 15%)" }}
                    >
                        <div className="text-4xl mb-2">🏰</div>
                        <div className="text-xl">Nincsenek kazamaták</div>
                        <div className="text-lg mt-1">
                            A játékosok nem fognak kihívással találkozni
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center mt-8">
                <button
                    onClick={onBack}
                    className="px-4 py-2 md:px-6 md:py-2 rounded-md font-semibold transition-all transform text-sm md:text-base bg-gray-700 text-gray-100 hover:bg-white hover:text-black hover:scale-105 active:scale-95 cursor-pointer"

                >
                    Vissza a Világhoz
                </button>
            </div>
        </motion.div>
    );
}
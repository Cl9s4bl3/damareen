"use client";

import { motion } from "framer-motion";
import WorldCard from "./WorldCard";

interface LevelUpSelectionProps {
    playerCards: any[];
    dungeonName: string;
    dungeonReward: string;
    dungeonRewardType: string;
    onUpgradeSelect: (cardId: string) => void;
    onSkip: () => void;
}

export function LevelUpSelection({
                                     playerCards,
                                     dungeonName,
                                     dungeonReward,
                                     dungeonRewardType,
                                     onUpgradeSelect,
                                     onSkip
                                 }: LevelUpSelectionProps) {

    const getElementEmoji = (type: string): string => {
        switch (type) {
            case 'fire': return '🔥';
            case 'water': return '💧';
            case 'earth': return '🪨';
            case 'air': return '💨';
            default: return '❓';
        }
    };

    const calculateNewStats = (card: any) => {
        const cardData = card.normalCard || card;
        const currentHealth = Number(card.currentHealth || cardData.health) || 0;
        const currentDamage = Number(card.currentDamage || cardData.damage) || 0;

        let newHealth = currentHealth;
        let newDamage = currentDamage;

        switch (dungeonRewardType) {
            case 'damage_plus_1':
                newDamage += 1;
                break;
            case 'health_plus_2':
                newHealth += 2;
                break;
            case 'damage_plus_3':
                newDamage += 3;
                break;
            default:
                console.warn('Unknown reward type:', dungeonRewardType);
                break;
        }

        return {
            health: newHealth,
            damage: newDamage,
            healthIncrease: newHealth - currentHealth,
            damageIncrease: newDamage - currentDamage
        };
    };


    const getRewardDescription = () => {
        switch (dungeonRewardType) {
            case 'damage_plus_1':
                return '+1 Támadás';
            case 'health_plus_2':
                return '+2 Életerő';
            case 'damage_plus_3':
                return '+3 Támadás';
            default:
                return dungeonReward;
        }
    };

    const transformCardForDisplay = (card: any) => {
        const cardData = card.normalCard || card;
        return {
            id: card.id || cardData.id,
            name: cardData.name || 'Ismeretlen kártya',
            description: cardData.description || '',
            asciiArt: cardData.asciiArt || '',
            health: card.currentHealth || cardData.health || 0,
            damage: card.currentDamage || cardData.damage || 0,
            type: cardData.type || 'fire'
        };
    };

    const getIncreasingStat = () => {
        switch (dungeonRewardType) {
            case 'damage_plus_1':
                return 'damage';
            case 'damage_plus_3':
                return 'damage';
            case 'health_plus_2':
                return 'health';
            default:
                return null;
        }
    };

    const increasingStat = getIncreasingStat();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-6xl mx-auto"
        >
            <div className="p-8 mb-6 rounded-lg ">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold mb-2 text-gray-200">Kártyafejlesztés</h2>
                    <p className="text-gray-300 mb-1">
                        Mivel győztél a(z) <span className="text-yellow-400">{dungeonName}</span> kazamatán, ezért fejlesztheted az egyik kártyád.
                    </p>

                </div>

                <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                        Válassz egy kártyát a fejlesztéshez
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {playerCards.map((card, index) => {
                        if (!card) return null;

                        const flatCard = transformCardForDisplay(card);
                        const newStats = calculateNewStats(card);

                        return (
                            <motion.div
                                key={flatCard.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-lg bg-black/30 border border-gray-600/50  transition-colors group"
                            >
                                <div className="mb-4">
                                    <WorldCard
                                        card={flatCard}
                                        index={index}
                                        vezer={false}
                                    />
                                </div>
                                {/* Reward highlight */}
                                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded p-2 mb-3">
                                    <div className="text-yellow-300 text-sm text-center font-semibold">
                                        {getRewardDescription()}
                                    </div>
                                </div>

                                <button onClick={() => onUpgradeSelect(card.id)} className="w-full mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors text-gray-900 hover:scale-105 active:scale-95 cursor-pointer">
                                    Kártya Fejlesztése
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="text-center">
                    <button
                        onClick={onSkip}
                        className="px-6 py-3 bg-black/40 hover:bg-black/60 rounded-lg font-semibold transition-colors text-gray-200 border border-gray-600/50 cursor-pointer active:scale-95 hover:scale-105"
                    >
                        Kihagyás
                    </button>
                    <p className="text-sm text-gray-400 mt-5">
                        Ha most kihagyod, később nem tudod elhaszálni ezt a fejlesztési pontot!
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

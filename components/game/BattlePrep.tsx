import { motion } from "framer-motion";

interface BattlePreparationProps {
    selectedDungeon: any;
    onStartBattle: () => void;
    onBack: () => void;
}

export function BattlePrep({ selectedDungeon, onStartBattle, onBack }: BattlePreparationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl mx-auto"
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Csata Előkészítés</h2>
                <p className="text-gray-300">Készülj fel a csatára!</p>
            </div>

            {/* Kiválaszott kazamata info */}
            <div className="bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Kiválasztott Kazamata: {selectedDungeon.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-3 text-lg">Kazamata információk:</h4>
                        <ul className="text-gray-300 space-y-2">
                            <li className="flex justify-between">
                                <span>Típus:</span>
                                <span className="text-white">{selectedDungeon.dungeonType?.name}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Normál kártyák:</span>
                                <span className="text-white">{selectedDungeon.dungeonType?.normalCardsCount}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Vezér kártyák:</span>
                                <span className="text-white">{selectedDungeon.dungeonType?.vezerCardsCount}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Összes kártya:</span>
                                <span className="text-white font-semibold">
                  {selectedDungeon.dungeonType?.normalCardsCount + selectedDungeon.dungeonType?.vezerCardsCount}
                </span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-lg">Jutalom:</h4>
                        <p className="text-yellow-300 text-lg font-semibold">
                            {selectedDungeon.dungeonType?.rewardDescription}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                            A győzelem után ezt a jutalmat kapod meg!
                        </p>
                    </div>
                </div>
            </div>

            {/* Harc */}
            <div className="text-center space-y-4">
                <button
                    onClick={onStartBattle}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-lg transition-colors"
                >
                    Csata Megkezdése!
                </button>
                <div>
                    <button
                        onClick={onBack}
                        className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Vissza a Kazamatákhoz
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
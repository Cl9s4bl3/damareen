"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BattleVisuals } from "@/components/game/BattleVisuals";

interface BattleViewProps {
    selectedDungeon: any;
    selectedCards: any[];
    playerCards: any[];
    onBack: () => void;
    onBattleFinished: (result: { playerWon: boolean; playerWins: number; enemyWins: number }) => void;
}

export function BattleView({
                               selectedDungeon,
                               selectedCards,
                               playerCards,
                               onBack,
                               onBattleFinished,
                           }: BattleViewProps) {
    const [currentEncounter, setCurrentEncounter] = useState(0);
    const [battleFinished, setBattleFinished] = useState(false);
    const [playerWins, setPlayerWins] = useState(0);
    const [enemyWins, setEnemyWins] = useState(0);
    const [currentResult, setCurrentResult] = useState<{ winner: "player" | "enemy"; message: string[]; turns: number } | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [battleInProgress, setBattleInProgress] = useState(false);
    const [battleTimer, setBattleTimer] = useState(0);
    const [totalTurns, setTotalTurns] = useState(0);

    const [resultAppliedForThisEncounter, setResultAppliedForThisEncounter] = useState(false);

    const getAllEnemies = () => {
        const enemies = [...(selectedDungeon.cards || [])];
        if (selectedDungeon.boss) {
            enemies.push({ ...selectedDungeon.boss, isBoss: true });
        }
        return enemies;
    };

    const enemies = getAllEnemies();
    const totalEncounters = enemies.length;

    const getCurrentPairing = () => {
        const playerCard = selectedCards[currentEncounter];
        const enemy = enemies[currentEncounter];
        return { playerCard, enemy };
    };

    const { playerCard: currentPlayerCard, enemy: currentEnemy } = getCurrentPairing();

    const getTypeAdvantage = (playerType: string, enemyType: string): number => {
        const advantages: { [key: string]: string[] } = {
            fire: ["earth"],
            earth: ["water"],
            water: ["air"],
            air: ["fire"],
        };
        if (playerType === enemyType) return 0;
        if (advantages[playerType]?.includes(enemyType)) return 1;
        if (advantages[enemyType]?.includes(playerType)) return -1;
        return 0;
    };

    const getRandomMessage = (messages: string[]): string => messages[Math.floor(Math.random() * messages.length)];

    const simulateBattle = (playerCard: any, enemyCard: any): { winner: "player" | "enemy"; message: string[]; turns: number } => {
        let playerHealth = Number(playerCard.health);
        let enemyHealth = Number(enemyCard.health);
        let turn = 0;
        const battleLog: string[] = [];

        while (turn < 50) {
            turn++;

            enemyHealth -= playerCard.damage;
            playerHealth -= enemyCard.damage;

            battleLog.push(`${playerCard.name} deals ${playerCard.damage} to ${enemyCard.name}`);
            battleLog.push(`${enemyCard.name} deals ${enemyCard.damage} to ${playerCard.name}`);

            if (playerHealth <= 0 || enemyHealth <= 0) {
                if (enemyHealth <= 0) battleLog.push(`${enemyCard.name} is defeated (<=0)`);
                if (playerHealth <= 0) battleLog.push(`${playerCard.name} is defeated (<=0)`);
                break;
            }
        }

        let winner: "player" | "enemy";
        let message: string[];

        if (playerHealth <= 0 && enemyHealth <= 0) {
            if (playerHealth > enemyHealth) {
                winner = "player";
                const messages = [
                    `${playerCard.name} győzött! Mindketten elestek, de ő kevesebb sérülést szenvedett.`,
                    `${playerCard.name} diadalmaskodott! A véres küzdelemben mindketten elestek, de ő jobban bírta.`,
                    `${playerCard.name} nyert! Kölcsönös pusztulás, de ő maradt erősebb.`,
                ];
                message = [getRandomMessage(messages)];
            } else if (playerHealth < enemyHealth) {
                winner = "enemy";
                const messages = [
                    `${enemyCard.name} győzött! Mindketten elestek, de ő kevesebb sérülést szenvedett.`,
                    `${enemyCard.name} diadalmaskodott! A véres küzdelemben mindketten elestek, de ő jobban bírta.`,
                    `${enemyCard.name} nyert! Kölcsönös pusztulás, de ő maradt erősebb.`,
                ];
                message = [getRandomMessage(messages)];
            } else {
                const typeAdvantage = getTypeAdvantage(playerCard.type, enemyCard.type);
                if (typeAdvantage === 1) {
                    winner = "player";
                    const messages = [
                        `${playerCard.name} diadalmaskodott! Típuselőnye döntött a kiegyenlített küzdelemben.`,
                        `${playerCard.name} győzött! Az elemek sorsot hoztak a döntetlenben.`,
                        `${playerCard.name} nyert! Az elemek ereje fordított a mérlegen.`,
                    ];
                    message = [getRandomMessage(messages)];
                } else if (typeAdvantage === -1) {
                    winner = "enemy";
                    const messages = [
                        `${enemyCard.name} diadalmaskodott! Típuselőnye döntött a kiegyenlített küzdelemben.`,
                        `${enemyCard.name} győzött! Az elemek sorsot hoztak a döntetlenben.`,
                        `${enemyCard.name} nyert! Az elemek ereje fordított a mérlegen.`,
                    ];
                    message = [getRandomMessage(messages)];
                } else {
                    winner = "enemy";
                    const messages = [
                        `${enemyCard.name} győzött! A kazamata hatalma billentette meg a mérleget.`,
                        `${enemyCard.name} diadalmaskodott! A kazamata ereje döntött a teljes egyenlőségben.`,
                        `${enemyCard.name} nyert! Amikor minden azonos, a kazamata mindig felülkerekedik.`,
                    ];
                    message = [getRandomMessage(messages)];
                }
            }
        } else if (playerHealth <= 0) {
            winner = "enemy";
            const messages = [
                `${enemyCard.name} győzött! ${playerCard.name} elesett a küzdelemben.`,
                `${enemyCard.name} aratott győzelmet! ${playerCard.name} pajzsa összetört.`,
                `${enemyCard.name} diadalmaskodott! ${playerCard.name} ereje kimerült.`,
            ];
            message = [getRandomMessage(messages)];
        } else {
            winner = "player";
            const messages = [
                `${playerCard.name} győzött! ${enemyCard.name} elesett a küzdelemben.`,
                `${playerCard.name} aratott győzelmet! ${enemyCard.name} pajzsa összetört.`,
                `${playerCard.name} diadalmaskodott! ${enemyCard.name} ereje kimerült.`,
            ];
            message = [getRandomMessage(messages)];
        }

        return { winner, message, turns: turn };
    };

    const startBattle = () => {
        const { playerCard, enemy } = getCurrentPairing();

        if (!playerCard || !enemy) {
            console.error("Missing card data for encounter", currentEncounter, { playerCard, enemy });
            return;
        }

        setResultAppliedForThisEncounter(false);
        setBattleInProgress(true);
        setShowResult(false);
        setCurrentResult(null);

        const result = simulateBattle(playerCard, enemy);
        setCurrentResult(result);
        setTotalTurns(result.turns);

        const battleDuration = result.turns * 5;
        setBattleTimer(battleDuration);

        const timer = setInterval(() => {
            setBattleTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowResult(true);
                    setBattleInProgress(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    };

    const skipBattle = () => {
        setShowResult(true);
        setBattleInProgress(false);
        setBattleTimer(0);
    };

    const proceedToNextEncounter = () => {
        if (!currentResult) {
            return;
        }

        if (!resultAppliedForThisEncounter) {
            if (currentResult.winner === "player") {
                setPlayerWins((prev) => prev + 1);
            } else {
                setEnemyWins((prev) => prev + 1);
            }
            setResultAppliedForThisEncounter(true);
        }

        if (currentEncounter < totalEncounters - 1) {
            setCurrentEncounter((prev) => prev + 1);
            setShowResult(false);
            setCurrentResult(null);
            setBattleInProgress(false);
            setTotalTurns(0);
            setResultAppliedForThisEncounter(false);
            setBattleTimer(0);
            return;
        }

        setBattleFinished(true);
        setShowResult(false);
    };

    const finishBattleAndNotifyParent = () => {
        onBattleFinished({
            playerWon: playerWins >= enemyWins,
            playerWins,
            enemyWins,
        });
    };

    useEffect(() => {
        if (!battleFinished && !battleInProgress && !showResult) {
            const cleanup = startBattle();
            return cleanup;
        }
    }, [currentEncounter, battleFinished]);


    if (battleFinished) {
        const playerWonBattle = playerWins >= enemyWins;
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl mx-auto text-center">
                <div className={`p-8 mb-6 rounded-lg ${playerWonBattle ? "bg-gradient-to-br from-green-700/50 to-emerald-800/50 border border-green-600/50" : "bg-gradient-to-br from-red-700/50 to-rose-800/50 border border-red-600/50"}`}>
                    <h2 className="text-3xl font-bold mb-4 text-gray-200">Csata Eredménye</h2>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="p-4 rounded-lg bg-black/30">
                            <h3 className="text-xl font-bold text-green-400 mb-2">Játékos</h3>
                            <div className="text-4xl font-bold text-gray-200">{playerWins}</div>
                            <div className="text-sm text-gray-400">Győzelem</div>
                        </div>
                        <div className="p-4 rounded-lg bg-black/30">
                            <h3 className="text-xl font-bold text-red-400 mb-2">Kazamata</h3>
                            <div className="text-4xl font-bold text-gray-200">{enemyWins}</div>
                            <div className="text-sm text-gray-400">Győzelem</div>
                        </div>
                    </div>

                    <div className="text-2xl font-bold mb-4">{playerWonBattle ? <span className="text-green-400">🎉 Győzelem! 🎉</span> : <span className="text-red-400">💀 Vereség</span>}</div>

                    <div className="text-gray-300 mb-2">Eredmény: {playerWins} - {enemyWins}</div>
                    <div className="text-sm text-gray-400 mb-6">{playerWonBattle ? "Gratulálok! Legyőzted a kazamatát!" : "Sajnos most nem sikerült. Próbáld újra!"}</div>

                    <div className="flex justify-center gap-4">
                        <button onClick={finishBattleAndNotifyParent} className="px-6 py-3 bg-black/40 hover:bg-black/50 rounded-lg font-semibold transition-colors text-gray-200 border border-gray-600/50 active:scale-95 hover:scale-105 cursor-pointer">
                            Befejezés
                        </button>

                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-6xl mx-auto overflow-x-hidden">
            {/* Harc folyamatban */}
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-200">Csata Folyamatban</h2>
                <p className="text-gray-400 mb-4">Harcolj a(z) {selectedDungeon.name} kazamata ellen!</p>

                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-green-400 font-semibold">Játékos: {playerWins}</div>
                    <div className="text-gray-500">-</div>
                    <div className="text-red-400 font-semibold">Kazamata: {enemyWins}</div>
                </div>

                <div className="bg-gray-800/50 rounded-full h-2 mb-2">
                    <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${((currentEncounter + 1) / totalEncounters) * 100}%` }}></div>
                </div>
                <div className="text-sm text-gray-500">Csata {currentEncounter + 1} / {totalEncounters}</div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={currentEncounter} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }} className="mb-8 relative">
                    {/* Eredmény overlay */}
                    {showResult && currentResult && (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`absolute inset-0 z-10 flex items-center justify-center rounded-lg ${currentResult.winner === "player" ? "bg-gradient-to-br from-green-700/50 to-emerald-800/50 border border-green-500/50" : "bg-gradient-to-br from-red-700/50 to-rose-800/50 border border-red-500/50"}`}>
                            <div className="text-center p-8">
                                <div className="text-4xl mb-4">{currentResult.winner === "player" ? "🎉" : "💀"}</div>
                                <div className={`text-2xl font-bold mb-2 ${currentResult.winner === "player" ? "text-green-400" : "text-red-400"}`}>{currentResult.winner === "player" ? "GYŐZELEM" : "VERESÉG"}</div>
                                <div className="text-gray-300 text-lg mb-2">{currentResult.message.map((line, index) => (<div key={index}>{line}</div>))}</div>

                                <div className="flex gap-3 justify-center mt-4">
                                    <button onClick={proceedToNextEncounter} className="px-6 py-3 bg-black/40 hover:bg-black/60 rounded-lg font-semibold transition-colors text-gray-200 border border-gray-600/50 active:scale-95 hover:scale-105 cursor-pointer">
                                        {currentEncounter < totalEncounters - 1 ? "Következő Csata →" : "Befejezés"}
                                    </button>

                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Harc visuals */}
                    <BattleVisuals currentPlayerCard={currentPlayerCard} currentEnemy={currentEnemy} battleInProgress={battleInProgress} battleTimer={battleTimer} currentEncounter={currentEncounter} />
                </motion.div>
            </AnimatePresence>

            {/* Harc info */}
            {battleInProgress && (
                <div className="text-center mb-6">
                    <button onClick={skipBattle} className="px-6 py-3 bg-black/40 hover:bg-black/60 rounded-lg font-semibold transition-colors text-gray-200 border border-gray-600/50 active:scale-95 hover:scale-105 cursor-pointer">Csata Kihagyása</button>
                </div>
            )}

            {/* Szabályok */}
            <div className="p-4 mb-6 rounded-lg bg-black/30">
                <h4 className="text-lg font-semibold mb-3 text-gray-300">Csata Szabályok:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="font-semibold text-green-400 mb-2">Harc menete:</div>
                        <ul className="text-gray-400 space-y-1">
                            <li>• Kártyák automatikusan harcolnak</li>
                            <li>• Ha egy kártya életereje ≤ 0, meghal (negatív értékek is megengedettek)</li>
                            <li>• Harc menete: minden körben egyszerre ütnek</li>
                            <li>• Ha mindketten ≤ 0 a kör végén, a nagyobb (kevésbé negatív) érték nyer</li>
                            <li>• Ha ugyanannyi, típuselőny dönt; ha nincs, ellenfél nyer</li>
                        </ul>
                    </div>
                    <div>
                        <div className="font-semibold text-blue-400 mb-2">Típus Hatások:</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-center p-2 bg-black/40 rounded">
                                <div className="font-bold text-red-400">🔥 Tűz</div>
                                <div className="text-gray-400">→ 🪨 Föld</div>
                            </div>
                            <div className="text-center p-2 bg-black/40 rounded">
                                <div className="font-bold text-yellow-600">🪨 Föld</div>
                                <div className="text-gray-400">→ 💧 Víz</div>
                            </div>
                            <div className="text-center p-2 bg-black/40 rounded">
                                <div className="font-bold text-blue-400">💧 Víz</div>
                                <div className="text-gray-400">→ 💨 Levegő</div>
                            </div>
                            <div className="text-center p-2 bg-black/40 rounded">
                                <div className="font-bold text-green-400">💨 Levegő</div>
                                <div className="text-gray-400">→ 🔥 Tűz</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <div className="text-center">
                <button onClick={onBack} className="px-6 py-3 bg-black/40 hover:bg-black/60 rounded-lg transition-colors text-gray-200 border border-gray-600/50 active:scale-95 cursor-pointer">Csata Megszakítása</button>
            </div>
        </motion.div>
    );
}

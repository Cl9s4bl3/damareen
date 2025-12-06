"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { WorldCreationData } from "@/components/world-creation/WorldCreationForm";

interface PlayerCardsStepProps {
    data: WorldCreationData;
    onUpdate: (updates: Partial<WorldCreationData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function PlayerCardsStep({ data, onUpdate, onBack, onNext }: PlayerCardsStepProps) {
    const toggleCardAvailability = (cardId: number) => {
        const newAvailableCards = data.availableCards.includes(cardId)
            ? data.availableCards.filter(id => id !== cardId)
            : [...data.availableCards, cardId];

        onUpdate({ availableCards: newAvailableCards });
    };

    const allCardsSelected = data.availableCards.length === data.cards.length;
    const noCardsSelected = data.availableCards.length === 0;

    const toggleAllCards = () => {
        if (allCardsSelected) {
            onUpdate({ availableCards: [] });
            toast.success("Összes kártya eltávolítva");
        } else {
            const allCardIds = data.cards.map(card => card.name);
            onUpdate({ availableCards: allCardIds });
            toast.success("Összes kártya kiválasztva");
        }
    };




    const handleNext = () => {

        if (noCardsSelected) {
            return (toast.error("Legalább egy kártyát ki kell választani, hogy tovább tudj lépni!"));

        }

        onNext();
    };


    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <Card
                className="w-full max-w-6xl mx-auto border-none shadow-lg"
                style={{
                    background: "hsl(0, 0%, 10%)",
                    color: "hsl(0, 0%, 95%)",
                }}
            >
                <CardHeader className="pb-4">
                    <CardTitle
                        className="text-center text-xl md:text-2xl font-semibold"
                        style={{ color: "hsl(0, 0%, 95%)" }}
                    >
                        Játékos Kártyák Beállítása
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 md:px-6">
                    <div className="space-y-6 md:space-y-8">
                        {/* Header leírás */}
                        <div className="text-center">
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Válaszd ki, mely kártyákat használhatják a játékosok a világban
                            </p>
                        </div>

                        {/* Minimum card követelmény */}
                        {data.cards.length === 0 && (
                            <div
                                className="p-4 rounded-md border-2 border-dashed text-center"
                                style={{
                                    background: "hsl(0, 0%, 12%)",
                                    borderColor: "hsl(45, 100%, 50%)",
                                }}
                            >
                                <div className="text-amber-300 font-semibold mb-2">
                                    ⚠️ Nincsenek kártyák
                                </div>
                                <div className="text-gray-400 text-sm">
                                    Először hozz létre normál kártyákat a második lépésben!
                                </div>
                            </div>
                        )}

                        {/* Elérhető kátryák kiválasztás */}
                        {data.cards.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card
                                    className="border-l-4 shadow-lg"
                                    style={{
                                        background: "hsl(0, 0%, 12%)",
                                        borderColor: "hsl(45, 100%, 50%)",
                                    }}
                                >
                                    <CardContent className="pt-4 md:pt-6">
                                        <div className="space-y-6">
                                            {/* Header az összes kiválasztással */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                <div>
                                                    <Label className="text-lg" style={{ color: "hsl(0, 0%, 75%)" }}>
                                                        Elérhető Kártyák a Játékosok Számára
                                                    </Label>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        Válaszd ki, mely kártyákat használhatják a játékosok
                                                    </p>
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={toggleAllCards}
                                                    className="px-4 py-2 rounded-md font-semibold text-sm transition-colors cursor-pointer"
                                                    style={{
                                                        background: "hsl(0, 0%, 20%)",
                                                        color: "hsl(0, 0%, 85%)",
                                                        border: "1px solid hsl(0, 0%, 40%)",
                                                    }}
                                                >
                                                    {allCardsSelected ? "Összes eltávolítása" : "Összes kiválasztása"}
                                                </motion.button>
                                            </div>

                                            {/* Kártyák */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                                                {data.cards.map((card, index) => {
                                                    const isSelected = data.availableCards.includes(card.name);
                                                    return (
                                                        <motion.div
                                                            key={card.name}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer group ${
                                                                isSelected
                                                                    ? "border-green-500 bg-green-500/10"
                                                                    : "border-gray-600 bg-gray-700/30 hover:bg-gray-600/30"
                                                            }`}
                                                            onClick={() => toggleCardAvailability(card.name)}
                                                        >
                                                            <div
                                                                className="flex items-center"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Checkbox
                                                                    checked={isSelected}
                                                                    onCheckedChange={() => toggleCardAvailability(card.name)}
                                                                    style={{
                                                                        background: isSelected
                                                                            ? "hsl(142, 76%, 36%)"
                                                                            : "hsl(0, 0%, 20%)",
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-sm flex items-center gap-2">
                                                                    {card.name}
                                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                                        card.type === "fire" ? "bg-red-500/20 text-red-300" :
                                                                            card.type === "water" ? "bg-blue-500/20 text-blue-300" :
                                                                                card.type === "earth" ? "bg-amber-500/20 text-amber-300" :
                                                                                    "bg-cyan-500/20 text-cyan-300"
                                                                    }`}>
                                                                        {card.type === "fire" ? "🔥" :
                                                                            card.type === "water" ? "💧" :
                                                                                card.type === "earth" ? "🪨" : "💨"}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-400 mt-1">
                                                                    <span>Sebzés: {card.damage}</span>
                                                                    <span className="mx-2">•</span>
                                                                    <span>Életerő: {card.health}</span>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>

                                            {/* Válaszás és figyelmeztetés summary */}
                                            <div className="space-y-3">
                                                {noCardsSelected && (
                                                    <div className="text-amber-500 text-sm text-center p-3 border border-amber-500/30 rounded-lg bg-amber-500/10">
                                                        ⚠️ Legalább egy kártyát válassz ki, hogy a játékosok tudjanak játszani!
                                                    </div>
                                                )}

                                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
                                                    <div className="text-gray-400">
                                                        {data.availableCards.length} / {data.cards.length} kártya kiválasztva
                                                    </div>
                                                    <div className="text-xs text-gray-500 text-center sm:text-right font-mono">
                                                        💡 Csak a normál kártyák közül választhatsz, mivel a játékosok csak ezeket gyűjthetik és fejleszthetik.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Üres */}
                        {data.cards.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                Még nincsenek kártyák. Először hozz létre normál kártyákat!
                            </div>
                        )}

                        {/* Validation summary */}
                        {data.cards.length > 0 && noCardsSelected && (
                            <div
                                className="p-3 rounded-md"
                                style={{ background: "hsl(45, 100%, 20%)" }}
                            >
                                <div className="text-amber-200 text-sm flex items-center">
                                    <span className="mr-2">⚠</span>
                                    Legalább egy kártyát ki kell választanod a játékosok számára!
                                </div>
                            </div>
                        )}

                        {/* Nav */}
                        <div className="flex flex-col-reverse md:flex-row justify-between gap-3 md:gap-0 pt-4">
                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    backgroundColor: "hsl(0, 0%, 85%)",
                                    color: "hsl(0, 0%, 10%)",
                                }}
                                whileTap={{ scale: 0.97 }}
                                onClick={onBack}
                                className="px-4 py-2 md:px-6 md:py-2 rounded-md font-semibold transition-colors text-sm md:text-base bg-gray-700 text-gray-100 hover:bg-white hover:text-black cursor-pointer"
                            >
                                Vissza
                            </motion.button>

                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleNext}
                                disabled={noCardsSelected}
                                style={{
                                    background: noCardsSelected
                                        ? "hsl(0, 0%, 35%)"
                                        : "hsl(0, 0%, 90%)",
                                    color: noCardsSelected
                                        ? "hsl(0, 0%, 60%)"
                                        : "hsl(0, 0%, 10%)",
                                    cursor: noCardsSelected ? "not-allowed" : "pointer",
                                }}
                                className="px-4 py-2 md:px-8 md:py-2 rounded-md font-semibold transition-colors text-sm md:text-base w-full md:w-auto"
                            >
                                Következő: Kazamaták Létrehozása
                            </motion.button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
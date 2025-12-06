"use client";

import { motion } from "framer-motion";

interface Card {
    id: string;
    name: string;
    description: string;
    asciiArt: string;
    health: number;
    damage: number;
    type: "fire" | "water" | "earth" | "air";
}

interface WorldCardProps {
    card: Card;
    index: number;
    vezer: boolean;
}

const WorldCard = ({ card, index, vezer = false }: WorldCardProps) => {
    const asciiLines = card.asciiArt
        ? card.asciiArt.split("\n").filter((line) => line.trim() !== "")
        : [];

    const bgColors: Record<Card["type"], string> = {
        fire: "rgba(80, 20, 20, 0.4)",
        water: "rgba(20, 40, 80, 0.4)",
        earth: "rgba(40, 35, 20, 0.4)",
        air: "rgba(30, 60, 50, 0.4)",
    };

    const borderColors: Record<Card["type"], string> = {
        fire: "hsla(0, 70%, 50%, 0.4)",
        water: "hsla(210, 80%, 60%, 0.4)",
        earth: "hsla(35, 50%, 40%, 0.4)",
        air: "hsla(160, 60%, 55%, 0.4)",
    };

    const typeNames: Record<Card["type"], string> = {
        fire: "🔥 Tűz",
        water: "💧 Víz",
        earth: "🪨 Föld",
        air: "💨 Levegő",
    };

    const hoverVariants = {
        hover: {
            y: -3,
            scale: 1.01,
            transition: { duration: 0.15, ease: "easeOut" },
        },
    };

    return (
        <motion.div
            className="relative group cursor-pointer h-auto w-full max-w-xs sm:max-w-sm"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover="hover"
            variants={hoverVariants}
            transition={{ delay: index * 0.05 }}
        >
            <motion.div
                className={`
          relative w-full rounded-xl border backdrop-blur-sm
          flex flex-col items-center text-center font-mono text-xs
          p-4 shadow-md
        `}
                style={{
                    backgroundColor: bgColors[card.type],
                    borderColor: borderColors[card.type],
                    color: "hsl(0, 0%, 90%)",
                }}
            >
                {/* ASCII art */}
                <div className="mb-3 flex justify-center">
                    <div className="leading-tight whitespace-pre font-mono text-left">
                        {asciiLines.length > 0 ? (
                            asciiLines.map((line, i) => <div key={i}>{line}</div>)
                        ) : (
                            <div className="text-gray-500 italic">Nincs ASCII Art</div>
                        )}
                    </div>
                </div>



                {/* Név */}
                <div className="font-semibold text-sm text-white/90 mb-1">
                    {card.name || "Névtelen"}
                </div>

                {/* Statok */}
                <div className="text-gray-300 text-xs mb-1">
                    Seb: {card.damage}  Élet: {card.health}
                </div>

                {/* Típus */}
                <div className="text-gray-400 text-xs italic mt-1">
                    {typeNames[card.type]}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default WorldCard;

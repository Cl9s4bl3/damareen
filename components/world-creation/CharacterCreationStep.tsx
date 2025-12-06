import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { toast } from "sonner";

interface CharacterCreationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const elementTypes = ["fire", "water", "earth", "air"] as const;

const cardSchema = z.object({
  name: z
      .string()
      .min(1, "A kártya neve kötelező")
      .max(16, "A név maximum 16 karakter hosszú lehet")
      .regex(
          /^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ ]+$/,
          "A név csak betűket, számokat és szóközöket tartalmazhat"
      ),
  damage: z.number().min(2, "A sebzés legalább 2 kell legyen").max(100, "A sebzés maximum 100 lehet"),
  health: z.number().min(1, "Az életerő legalább 1 kell legyen").max(100, "Az életerő maximum 100 lehet"),
  type: z.enum(elementTypes),
  asciiArt: z.string().min(1, "Az ASCII ábrának legalább 1 karaktert tartalmaznia kell")
});

interface ValidationErrors {
  name?: string[];
  damage?: string[];
  health?: string[];
  type?: string[];
  asciiArt?: string[];
}

export function CharacterCreationStep({ data, onUpdate, onNext, onBack }: CharacterCreationStepProps) {
  const [cursorPositions, setCursorPositions] = useState<{ [key: number]: number }>({});
  const textAreaRefs = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});

  useEffect(() => {
    const cards = data.cards || [];
    const newCards = cards.map((c: any) => {
      if (!c.asciiArt || c.asciiArt === "") {
        return { ...c, asciiArt: getAsciiArt(c) };
      }
      return c;
    });
    onUpdate({ cards: newCards });
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;

        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        return successful;
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  };

  const handleCopyClick = async (emoji: string) => {
    const success = await copyToClipboard(emoji);
    if (success) {
      toast.success("Szimbólum sikeres másolása a vágólapra!");
    } else {
      toast.info(
          <div className="text-center">
            <div>Másold ki manuálisan:</div>
            <div className="font-mono text-lg bg-gray-800 p-2 rounded mt-1 select-all">{emoji}</div>
            <div className="text-xs text-gray-300 mt-1">Koppints a szövegre a kijelöléshez</div>
          </div>,
          { duration: 5000 }
      );
    }
  };

  const validateCard = (card: any): ValidationErrors => {
    const errors: ValidationErrors = {};

    try {
      cardSchema.parse(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        Object.assign(errors, error.flatten().fieldErrors);
      }
    }

    if ((card.name || "").trim() && card.asciiArt) {
      const allowedSymbol = getSymbolForType(card.type);
      const forbiddenSymbols = ["🔥", "💧", "🪨", "💨"].filter((e) => e !== allowedSymbol);

      if (forbiddenSymbols.some((sym) => card.asciiArt.includes(sym))) {
        errors.asciiArt = [
          `Csak a(z) "${allowedSymbol}" elem szimbóluma használható ebben a kártyában.`,
        ];
      }

      const emojiRegex = /\p{Emoji}/u;
      const asciiWithoutAllowed = card.asciiArt.split(allowedSymbol).join("");
      if (emojiRegex.test(asciiWithoutAllowed)) {
        errors.asciiArt = [
          `Csak ASCII karakterek és a(z) "${allowedSymbol}" szimbóluma engedélyezett.`,
        ];
      }

      if (!card.asciiArt.includes(allowedSymbol)) {
        errors.asciiArt = [
          `A(z) "${allowedSymbol}" elem szimbólumának legalább egyszer szerepelnie kell az ASCII ábrában.`,
        ];
      }
    }

    return errors;
  };

  const validateAllCards = (): boolean => {
    if (!data.cards || data.cards.length === 0) return false;
    return data.cards.every((card: any) => Object.keys(validateCard(card)).length === 0);
  };

  const hasDuplicateNames = (): boolean => {
    if (!data.cards || data.cards.length === 0) return false;
    const names = data.cards.map((card: any) => (card.name || "").trim().toLowerCase()).filter((n) => n.length > 0);
    return new Set(names).size !== names.length;
  };

  const addCard = () => {
    const newCard = {
      name: "",
      damage: 5,
      health: 10,
      type: "fire" as const,
      asciiArt: getAsciiArt({ name: "", damage: 5, health: 10, type: "fire" }),
    };
    onUpdate({ cards: [...(data.cards || []), newCard] });
  };

  const updateCard = (index: number, updates: any) => {
    const newCards = [...(data.cards || [])];
    if (!newCards[index]) return;

    if (updates.type !== undefined) {
      let currentArt = newCards[index].asciiArt ?? "";
      const allSymbols = ["🔥", "💧", "🪨", "💨"];
      const newSymbol = getSymbolForType(updates.type);

      const oldSymbolsRegex = new RegExp(allSymbols.join("|"), "g");

      if (currentArt.match(oldSymbolsRegex)) {
        currentArt = currentArt.replace(oldSymbolsRegex, newSymbol);
      } else {
        const cursorPos = cursorPositions[index] ?? currentArt.length;
        currentArt = currentArt.slice(0, cursorPos) + newSymbol + currentArt.slice(cursorPos);
        setCursorPositions((prev) => ({ ...prev, [index]: cursorPos + newSymbol.length }));
      }

      updates = { ...updates, asciiArt: currentArt };
    }

    newCards[index] = { ...newCards[index], ...updates };
    onUpdate({ cards: newCards });

    // Restore cursor position

  };


  const removeCard = (index: number) => {
    const newCards = (data.cards || []).filter((_: any, i: number) => i !== index);
    onUpdate({ cards: newCards });
    setCursorPositions((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    delete textAreaRefs.current[index];
  };

  const handleDamageChange = (index: number, value: string) => {
    const numValue = parseInt(value) || 2;
    const clampedValue = Math.min(Math.max(numValue, 2), 100);
    updateCard(index, { damage: clampedValue });
  };

  const handleHealthChange = (index: number, value: string) => {
    const numValue = parseInt(value) || 1;
    const clampedValue = Math.min(Math.max(numValue, 1), 100);
    updateCard(index, { health: clampedValue });
  };

  const handleNext = () => {
    if (!validateAllCards()) {
      toast.error("Kérlek, javítsd ki a hibákat a kártyákban mielőtt továbbmész!");
      return;
    }
    if (hasDuplicateNames()) {
      toast.error("Minden kártyának egyedi névvel kell rendelkeznie!");
      return;
    }
    onNext();
  };

  const cards = data.cards || [];
  const allCardsValid = cards.length > 0 && validateAllCards() && !hasDuplicateNames();

  return (
      <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }} className="w-full">
        <Card className="w-full max-w-4xl mx-auto border-none shadow-lg" style={{ background: "hsl(0, 0%, 10%)", color: "hsl(0, 0%, 95%)" }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl md:text-2xl font-semibold" style={{ color: "hsl(0, 0%, 95%)" }}>
              Normál Kártyák
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6 space-y-4 md:space-y-6">
            {cards.map((card: any, index: number) => {
              const errors = validateCard(card);
              const hasAsciiError = !!errors.asciiArt?.length;
              const hasOtherErrors = !!errors.name?.length || !!errors.damage?.length || !!errors.health?.length || !!errors.type?.length;

              return (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                    <Card className={`border-l-4 shadow-md ${hasOtherErrors || hasAsciiError ? "ring-2 ring-red-500" : ""}`} style={{
                      background: "hsl(0, 0%, 15%)",
                      color: "hsl(0, 0%, 90%)",
                      borderColor: card.type === "fire" ? "hsla(0,80%,50%,0.5)" : card.type === "water" ? "hsla(210,100%,50%,0.99)" : card.type === "earth" ? "hsl(35, 50%, 40%)" : "hsl(180, 70%, 60%)",
                    }}>
                      <CardContent className="pt-4 md:pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          {/* Bal */}
                          <div className="space-y-3 md:space-y-4">
                            {/* Név */}
                            <div className="space-y-2">
                              <Label className="text-sm md:text-base" style={{ color: "hsl(0, 0%, 75%)" }}>Kártya Neve *</Label>
                              <Input value={card.name || ""} onChange={(e) => updateCard(index, { name: e.target.value })} placeholder="Add meg a kártya nevét..." maxLength={16} className={`border-none focus:ring-2 text-sm md:text-base ${errors.name ? "ring-2 ring-red-500" : ""}`} style={{ background: "hsl(0, 0%, 20%)", color: "hsl(0, 0%, 95%)", borderRadius: "0.5rem" }} />
                              {errors.name && <p className="text-red-400 text-xs">{errors.name[0]}</p>}
                            </div>

                            {/* Seb és élet */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label className="text-sm md:text-base" style={{ color: "hsl(0, 0%, 75%)" }}>Sebzés (2-100) *</Label>
                                <Input type="number" min="2" max="100" value={card.damage} onChange={(e) => handleDamageChange(index, e.target.value)} className={`border-none focus:ring-2 text-sm ${errors.damage ? "ring-2 ring-red-500" : ""}`} style={{ background: "hsl(0, 0%, 20%)", color: "hsl(0, 0%, 95%)", borderRadius: "0.5rem" }} />
                                {errors.damage && <p className="text-red-400 text-xs">{errors.damage[0]}</p>}
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm md:text-base" style={{ color: "hsl(0, 0%, 75%)" }}>Életerő (1-100) *</Label>
                                <Input type="number" min="1" max="100" value={card.health} onChange={(e) => handleHealthChange(index, e.target.value)} className={`border-none focus:ring-2 text-sm ${errors.health ? "ring-2 ring-red-500" : ""}`} style={{ background: "hsl(0, 0%, 20%)", color: "hsl(0, 0%, 95%)", borderRadius: "0.5rem" }} />
                                {errors.health && <p className="text-red-400 text-xs">{errors.health[0]}</p>}
                              </div>
                            </div>

                            {/* Elem típus */}
                            <div className="space-y-2">
                              <Label className="text-sm md:text-base" style={{ color: "hsl(0, 0%, 75%)" }}>Elem Típusa *</Label>
                              <Select value={card.type} onValueChange={(value: any) => updateCard(index, { type: value })}>
                                <SelectTrigger className={`text-sm md:text-base ${errors.type ? "ring-2 ring-red-500" : ""}`} style={{ background: "hsl(0, 0%, 20%)", color: "hsl(0, 0%, 95%)", borderRadius: "0.5rem" }}>
                                  <SelectValue placeholder="Válassz elemet..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {elementTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                  <span className="capitalize text-sm md:text-base">
                                    {type === "fire" && "🔥 Tűz"}
                                    {type === "water" && "💧 Víz"}
                                    {type === "earth" && "🪨 Föld"}
                                    {type === "air" && "💨 Levegő"}
                                  </span>
                                      </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.type && <p className="text-red-400 text-xs">{errors.type[0]}</p>}
                            </div>
                          </div>

                          {/* Jobb oldal - ASCII */}
                          <div className="space-y-2 md:space-y-4">
                            <Label className="text-sm md:text-base" style={{ color: "hsl(0, 0%, 75%)" }}>ASCII Előnézet (szerkeszthető)</Label>
                            <textarea
                                ref={(el) => (textAreaRefs.current[index] = el)}
                                value={card.asciiArt ?? ""}
                                onChange={(e) => updateCard(index, { asciiArt: e.target.value })}
                                onClick={(e) => setCursorPositions(prev => ({ ...prev, [index]: (e.target as HTMLTextAreaElement).selectionStart }))}
                                onKeyUp={(e) => setCursorPositions(prev => ({ ...prev, [index]: (e.target as HTMLTextAreaElement).selectionStart }))}
                                className="p-3 md:p-4 rounded-md font-mono text-xs md:text-sm whitespace-pre overflow-x-auto w-full"
                                style={{
                                  background: "hsl(0, 0%, 20%)",
                                  color: (card.name || "").trim() ? "hsl(0, 0%, 95%)" : "hsl(0, 0%, 60%)",
                                  minHeight: "120px",
                                  border: !(card.name || "").trim() ? "1px dashed hsl(0, 0%, 40%)" : "none",
                                  resize: "vertical",
                                }}
                                required={true}
                            />
                            {errors.asciiArt && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-amber-400 text-xs mt-1">
                                  <div className="flex items-center">
                                    <span className="mr-1">⚠</span>
                                    <span>{errors.asciiArt[0]}</span>
                                  </div>

                                  {(() => {
                                    const match = errors.asciiArt[0].match(/"(.+?)"/);
                                    if (!match) return null;
                                    const emoji = match[1];

                                    return (
                                        <button
                                            onClick={() => handleCopyClick(emoji)}
                                            className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-500 active:bg-gray-600 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg cursor-pointer touch-manipulation"
                                            title={`Másolás: ${emoji}`}
                                        >
                                          <svg
                                              width="18px"
                                              height="18px"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="stroke-white"
                                          >
                                            <path
                                                d="M6 11C6 8.17157 6 6.75736 6.87868 5.87868C7.75736 5 9.17157 5 12 5H15C17.8284 5 19.2426 5 20.1213 5.87868C21 6.75736 21 8.17157 21 11V16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H12C9.17157 22 7.75736 22 6.87868 21.1213C6 20.2426 6 18.8284 6 16V11Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            />
                                            <path
                                                opacity="0.8"
                                                d="M6 19C4.34315 19 3 17.6569 3 16V10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H15C16.6569 2 18 3.34315 18 5"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            />
                                          </svg>
                                          <span className="text-white font-medium">Másolás</span>
                                        </button>
                                    );
                                  })()}
                                </div>
                            )}
                          </div>
                        </div>

                        {/* Eltávolítás gomb */}
                        <div className="flex justify-end mt-3 md:mt-4">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => removeCard(index)} className="px-4 py-2 md:px-4 md:py-2 rounded-md font-semibold transition-colors text-sm md:text-base bg-red-700 hover:bg-red-500 cursor-pointer touch-manipulation">
                            Eltávolítás
                          </motion.button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
              );
            })}

            {/* Kártya + gomb */}
            <motion.button whileHover={{ scale: 1.02, backgroundColor: "hsl(0, 0%, 25%)" }} whileTap={{ scale: 0.98 }} onClick={addCard} className="w-full h-16 md:h-20 border-dashed border-2 rounded-md font-semibold transition-all text-sm md:text-base touch-manipulation" style={{ borderColor: "hsl(0, 0%, 40%)", background: "hsl(0, 0%, 15%)", color: "hsl(0, 0%, 85%)" }}>
              + Új Kártya Hozzáadása
            </motion.button>

            {/* Validation összefoglaló */}
            {cards.length > 0 && !allCardsValid && (
                <div className="p-3 rounded-md" style={{ background: "hsl(45, 100%, 20%)" }}>
                  <div className="text-amber-200 text-sm flex items-center">
                    <span className="mr-2">⚠</span>
                    {hasDuplicateNames()
                        ? "Minden kártyának egyedi névvel kell rendelkeznie!"
                        : "Néhány kártya nincs megfelelően kitöltve. Kérlek ellenőrizd a piros hibaüzeneteket."}
                  </div>
                </div>
            )}

            {/* Nav */}
            <div className="flex flex-col-reverse md:flex-row justify-between gap-3 md:gap-0 pt-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={onBack} className="px-4 py-2 md:px-6 md:py-2 rounded-md font-semibold transition-colors text-sm md:text-base bg-gray-700 text-gray-100 hover:bg-white hover:text-black cursor-pointer touch-manipulation">
                Vissza
              </motion.button>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={allCardsValid ? { scale: 0.97 } : {}} onClick={handleNext} disabled={!allCardsValid} className="px-4 py-2 md:px-8 md:py-2 rounded-md font-semibold transition-colors text-sm md:text-base w-full md:w-auto touch-manipulation" style={{ background: !allCardsValid ? "hsl(0, 0%, 35%)" : "hsl(0, 0%, 90%)", color: !allCardsValid ? "hsl(0, 0%, 60%)" : "hsl(0, 0%, 10%)", cursor: !allCardsValid ? "not-allowed" : "pointer" }}>
                Következő: Vezér Kártyák
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
  );
}

/* ---------------------------
   Segítő functionök
--------------------------- */

function getSymbolForType(type: string) {
  return { fire: "🔥", water: "💧", earth: "🪨", air: "💨" }[type];
}

function getAsciiArt(card: any) {
  if (!card) return "";
  const symbol = getSymbolForType(card.type) ?? "❓";
  return `  /\\
 /__\\
/____\\
 |${symbol}|
 |/\\|
/____\\
`;
}
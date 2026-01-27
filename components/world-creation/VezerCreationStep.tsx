import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { z } from "zod";

interface VezerCreationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const elementTypes = ["fire", "water", "earth", "air"] as const;

const vezerCardSchema = z.object({
  name: z
      .string()
      .min(1, "A vezér kártya neve kötelező")
      .max(16, "A név maximum 16 karakter hosszú lehet")
      .regex(
          /^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ ]+$/,
          "A név csak betűket, számokat és szóközöket tartalmazhat",
      ),
  baseCardId: z.number().min(1, "Alap kártya azonosító kötelező"),
  baseCardName: z.string().min(1, "Alap kártya neve kötelező"),
  boostType: z.enum(["damage_double", "health_double"]),
  damage: z
      .number()
      .min(2, "A sebzés legalább 2 kell legyen")
      .max(200, "A sebzés maximum 200 lehet"),
  health: z
      .number()
      .min(1, "Az életerő legalább 1 kell legyen")
      .max(200, "Az életerő maximum 200 lehet"),
  type: z.enum(elementTypes),
  asciiArt: z.string().min(1, "Az ASCII ábrának legalább 1 karaktert tartalmaznia kell")
});

interface VezerValidationErrors {
  name?: string[];
  damage?: string[];
  health?: string[];
  type?: string[];
  boostType?: string[];
  asciiArt?: string[];
}

export function VezerCreationStep({
                                    data,
                                    onUpdate,
                                    onNext,
                                    onBack,
                                  }: VezerCreationStepProps) {
  const [cursorPositions, setCursorPositions] = useState<{ [key: number]: number }>({});
  const textAreaRefs = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});

  const validateVezerCard = (card: any): VezerValidationErrors => {
    const errors: VezerValidationErrors = {};

    try {
      vezerCardSchema.parse(card);

      if ((card.name || "").trim() && card.asciiArt) {
        const allowedSymbol = getSymbolForType(card.type);
        const forbiddenSymbols = ["🔥", "💧", "🪨", "💨"].filter(e => e !== allowedSymbol);

        if (forbiddenSymbols.some(sym => card.asciiArt.includes(sym))) {
          errors.asciiArt = [`Csak a(z) "${allowedSymbol}" elem szimbóluma használható ebben a kártyában.`];
        }

        const emojiRegex = /\p{Emoji}/u;
        const asciiWithoutAllowed = card.asciiArt.split(allowedSymbol).join("");
        if (emojiRegex.test(asciiWithoutAllowed)) {
          errors.asciiArt = [`Csak ASCII karakterek és a(z) "${allowedSymbol}" szimbóluma engedélyezett.`];
        }

        if (!card.asciiArt.includes(allowedSymbol)) {
          errors.asciiArt = [`A(z) "${allowedSymbol}" elem szimbólumának legalább egyszer szerepelnie kell az ASCII ábrában.`];
        }
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        Object.assign(errors, error.flatten().fieldErrors);
      }
    }

    return errors;
  };

  const validateAllVezerCards = () => {
    if (!data.vezerCards || data.vezerCards.length === 0) return true;
    return data.vezerCards.every(card => Object.keys(validateVezerCard(card)).length === 0);
  };

  const hasDuplicateVezerNames = () => {
    if (!data.vezerCards || data.vezerCards.length === 0) return false;
    const names = data.vezerCards.map(c => (c.name || "").trim().toLowerCase());
    return new Set(names).size !== names.length;
  };

  const hasAvailableNormalCards = () => {
    if (!data.cards || data.cards.length === 0) return false;
    return data.cards.some(
        (card: any) =>
            !data.vezerCards ||
            !data.vezerCards.some((v: any) => v.baseCardName === card.name)
    );
  };

  const addVezerCard = (baseCard: any) => {
    const newCard = {
      name: `Vezér ${baseCard.name}`.substring(0, 16),
      baseCardId: baseCard.id || Math.floor(Math.random() * 100000) + 1,
      baseCardName: baseCard.name,
      boostType: "damage_double",
      damage: baseCard.damage * 2,
      health: baseCard.health,
      type: baseCard.type,
      asciiArt: generateVezerAscii({ ...baseCard, boostType: "damage_double", name: `Vezér ${baseCard.name}`.substring(0,16), damage: baseCard.damage*2 })
    };
    onUpdate({ vezerCards: [...(data.vezerCards || []), newCard] });
  };

  const updateVezerCard = (index: number, updates: any) => {
    const vezerCards = [...(data.vezerCards || [])];
    if (!vezerCards[index]) return;

    let updated = { ...vezerCards[index], ...updates };

    if (updates.boostType) {
      const baseCard = data.cards.find((c: any) => c.name === updated.baseCardName);
      if (baseCard) {
        updated.damage = updates.boostType === "damage_double" ? baseCard.damage*2 : baseCard.damage;
        updated.health = updates.boostType === "health_double" ? baseCard.health*2 : baseCard.health;
      }
    }

    if ((updates.name || updates.type || updates.damage || updates.health) && updates.asciiArt === undefined) {
      updated.asciiArt = generateVezerAscii(updated);
    }

    vezerCards[index] = updated;
    onUpdate({ vezerCards });

      if (updates.asciiArt !== undefined) {
          onUpdate(prev => {
              const updatedCards = [...prev.vezerCards];
              updatedCards[index] = {
                  ...updatedCards[index],
                  asciiArt: updates.asciiArt
              };
              return { ...prev, vezerCards: updatedCards };
          });
          return;
      }
  };

  const removeVezerCard = (index: number) => {
    const vezerCards = (data.vezerCards || []).filter((_, i) => i !== index);
    onUpdate({ vezerCards });
    setCursorPositions(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    delete textAreaRefs.current[index];
  };

  const handleNext = () => {
    if (!validateAllVezerCards()) {
      toast.error("Kérlek, javítsd ki a hibákat a vezér kártyákban mielőtt továbbmész!");
      return;
    }
    if (hasDuplicateVezerNames()) {
      toast.error("Minden vezér kártyának egyedi névvel kell rendelkeznie!");
      return;
    }
    onNext();
  };

  const vezerCards = data.vezerCards || [];
  const allVezerCardsValid = vezerCards.length === 0 || (validateAllVezerCards() && !hasDuplicateVezerNames());

  return (
      <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }} className="w-full">
        <Card className="w-full max-w-4xl mx-auto border-none shadow-lg" style={{ background: "hsl(0,0%,10%)", color: "hsl(0,0%,95%)" }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl md:text-2xl font-semibold" style={{ color: "hsl(0,0%,95%)" }}>
              Vezér Kártyák Létrehozása
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6 space-y-6">
            {/* Normál kártyák választás */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold" style={{ color: "hsl(0,0%,85%)" }}>Elérhető Normál Kártyák</h3>
              {!hasAvailableNormalCards() && <div className="p-3 rounded-md" style={{ background: "hsl(45,100%,20%)" }}><div className="text-amber-200 text-sm">Minden normál kártya már fel van használva vezér kártyákhoz.</div></div>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.cards?.map((card: any, index: number) => {
                  const alreadyUsed = vezerCards.some((v: any) => v.baseCardName === card.name);
                  return (
                      <motion.div key={index} whileHover={{ scale: alreadyUsed ? 1 : 1.02 }} whileTap={{ scale: alreadyUsed ? 1 : 0.98 }}>
                        <Card className={`p-4 cursor-pointer transition-all ${alreadyUsed ? "opacity-50" : "hover:shadow-lg"}`} style={{ background: "hsl(0,0%,15%)", borderLeft: `4px solid ${getBorderColor(card.type)}` }} onClick={() => !alreadyUsed && addVezerCard(card)}>
                          <CardContent className="p-0 flex flex-col items-center space-y-2">
                            <div>{card.name}</div>
                            <pre className="leading-tight font-mono text-left">{card.asciiArt || getAsciiPreview(card)}</pre>
                            <div className="text-gray-500 text-sm">Seb: {card.damage} Életerő: {card.health}</div>
                            {alreadyUsed ? <p className="text-xs text-yellow-400">Hozzáadva</p> : <p className="text-xs text-green-400">Kattints a hozzáadáshoz</p>}
                          </CardContent>
                        </Card>
                      </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Vezér Cards */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold" style={{ color: "hsl(0,0%,85%)" }}>Létrehozott Vezér Kártyák ({vezerCards.length})</h3>
              {vezerCards.length === 0 && <div className="text-center py-8 text-gray-400">Még nincsenek vezér kártyák. Válassz egy normál kártyát felülről!</div>}
              <div className="space-y-4">
                {vezerCards.map((vezerCard: any, index: number) => {
                  const errors = validateVezerCard(vezerCard);
                  const hasErrors = Object.keys(errors).length > 0;
                  return (
                      <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Card className={`border-l-4 shadow-md ${hasErrors ? "ring-2 ring-red-500" : ""}`} style={{ background: "hsl(0,0%,15%)", borderColor: "hsl(260,60%,60%)" }}>
                          <CardContent className="pt-4 md:pt-6 space-y-4">
                            {/* Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm md:text-base" style={{ color: "hsl(0,0%,75%)" }}>Vezér Kártya Neve *</Label>
                                  <Input
                                      value={vezerCard.name || ""}
                                      onChange={(e) => updateVezerCard(index, { name: e.target.value })}
                                      placeholder="Add meg a vezér kártya nevét..."
                                      maxLength={16}
                                      className={`border-none focus:ring-2 text-sm md:text-base ${errors.name ? "ring-2 ring-red-500" : ""}`}
                                      style={{ background: "hsl(0,0%,20%)", color: "hsl(0,0%,95%)", borderRadius: "0.5rem" }}
                                  />
                                  {errors.name && <p className="text-red-400 text-xs">{errors.name[0]}</p>}
                                </div>

                                <div>
                                  <Label className="text-sm md:text-base" style={{ color: "hsl(0,0%,75%)" }}>Erősítés Típusa *</Label>
                                  <RadioGroup value={vezerCard.boostType} onValueChange={(value) => updateVezerCard(index, { boostType: value })} className="flex space-x-4">
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="damage_double" id={`damage-${index}`} />
                                      <Label htmlFor={`damage-${index}`} className="text-sm">Sebzés Duplázás</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="health_double" id={`health-${index}`} />
                                      <Label htmlFor={`health-${index}`} className="text-sm">Életerő Duplázás</Label>
                                    </div>
                                  </RadioGroup>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm" style={{ color: "hsl(0,0%,75%)" }}>Sebzés</Label>
                                    <div className={`p-2 rounded text-center ${errors.damage ? "ring-2 ring-red-500" : ""}`} style={{ background: "hsl(0,0%,20%)" }}>{vezerCard.damage}</div>
                                  </div>
                                  <div>
                                    <Label className="text-sm" style={{ color: "hsl(0,0%,75%)" }}>Életerő</Label>
                                    <div className={`p-2 rounded text-center ${errors.health ? "ring-2 ring-red-500" : ""}`} style={{ background: "hsl(0,0%,20%)" }}>{vezerCard.health}</div>
                                  </div>
                                </div>
                              </div>

                              {/* ASCII előnézet & editor */}
                              <div className="space-y-2">
                                <Label className="text-sm md:text-base" style={{ color: "hsl(0,0%,75%)" }}>ASCII Előnézet (szerkeszthető)</Label>
                                <textarea
                                    ref={(el) => (textAreaRefs.current[index] = el)}
                                    value={vezerCard.asciiArt || ""}
                                    onChange={(e) => updateVezerCard(index, { asciiArt: e.target.value })}
                                    onClick={(e) => {
                                      const target = e.currentTarget;
                                      if (target && typeof target.selectionStart === "number") {
                                        setCursorPositions(prev => ({ ...prev, [index]: target.selectionStart }));
                                      }
                                    }}
                                    onKeyUp={(e) => {
                                      const target = e.currentTarget;
                                      if (target && typeof target.selectionStart === "number") {
                                        setCursorPositions(prev => ({ ...prev, [index]: target.selectionStart }));
                                      }
                                    }}
                                    className="p-3 md:p-4 rounded-md font-mono text-xs md:text-sm whitespace-pre overflow-x-auto w-full"
                                    style={{
                                      background: "hsl(0,0%,20%)",
                                      color: vezerCard.name ? "hsl(0,0%,95%)" : "hsl(0,0%,60%)",
                                      minHeight: "120px",
                                      border: !vezerCard.name ? "1px dashed hsl(0,0%,40%)" : "none",
                                      resize: "vertical"
                                    }}
                                    required={true}
                                />

                                {errors.asciiArt && (
                                    <div className="flex items-center text-amber-400 text-xs mt-1">
                                      <span className="mr-1">⚠</span>
                                      <span>{errors.asciiArt[0]}</span>

                                      {(() => {
                                        const match = errors.asciiArt[0].match(/"(.+?)"/);
                                        if (!match) return null;
                                        const emoji = match[1];

                                        return (
                                            <button
                                                onClick={() => {
                                                  navigator.clipboard.writeText(emoji);
                                                  toast.success("Szimbólum sikeres másolása a vágólapra!");
                                                }}
                                                className="ml-2 px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-500 active:bg-gray-600 transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-md hover:shadow-lg cursor-pointer"
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

                            <div className="flex justify-between items-center mt-4">
                              <div className="text-sm text-gray-400">Alap kártya: <strong>{vezerCard.baseCardName}</strong></div>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => removeVezerCard(index)} className="px-4 py-2 rounded-md font-semibold text-sm md:text-base bg-red-700 hover:bg-red-500 cursor-pointer">Eltávolítás</motion.button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Validation summary */}
            {vezerCards.length > 0 && !allVezerCardsValid && (
                <div className="p-3 rounded-md" style={{ background: "hsl(45,100%,20%)" }}>
                  <div className="text-amber-200 text-sm flex items-center">
                    <span className="mr-2">⚠</span>
                    {hasDuplicateVezerNames() ? "Minden vezér kártyának egyedi névvel kell rendelkeznie!" : "Néhány vezér kártya nincs megfelelően kitöltve. Kérlek ellenőrizd a piros hibaüzeneteket."}
                  </div>
                </div>
            )}

            {/* Nav */}
            <div className="flex flex-col-reverse md:flex-row justify-between gap-3 md:gap-0 pt-4">
              <motion.button whileHover={{ scale: 1.05, backgroundColor: "hsl(0,0%,85%)", color: "hsl(0,0%,10%)" }} whileTap={{ scale: 0.97 }} onClick={onBack} className="px-4 py-2 rounded-md font-semibold text-sm md:text-base bg-gray-700 text-gray-100 hover:bg-white hover:text-black cursor-pointer">Vissza</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={handleNext} disabled={!allVezerCardsValid} style={{ background: allVezerCardsValid ? "hsl(0,0%,90%)" : "hsl(0,0%,35%)", color: allVezerCardsValid ? "hsl(0,0%,10%)" : "hsl(0,0%,60%)", cursor: allVezerCardsValid ? "pointer" : "not-allowed" }} className="px-4 py-2 rounded-md font-semibold text-sm md:text-base w-full md:w-auto">Következő: Játékos Kártyák</motion.button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
  );
}

function getSymbolForType(type: string) {
  return type === "fire" ? "🔥" : type === "water" ? "💧" : type === "earth" ? "🪨" : "💨";
}

function getBorderColor(type: string) {
  return type === "fire" ? "hsla(0,80%,50%,0.5)" : type === "water" ? "hsla(210,100%,50%,0.99)" : type === "earth" ? "hsl(35,50%,40%)" : "hsl(180,70%,60%)";
}

function generateVezerAscii(card: any) {
  const symbol = getSymbolForType(card.type);

  return `
        /\\
       /__\\
      /____\\
      /(o_o)\\
   __/| [∞] |__     ${symbol}
  /  /|  ^  |\\  \\    |
 |__/ |_____| \\__|   |
    /_|_\\/|_\\_       |
   /__/    \\__\\      |`;
}

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { toast } from "sonner";

interface DungeonCreationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const dungeonTypes = [
  {
    type: "simple",
    name: "Egyszerű találkozás",
    normalCards: 1,
    vezerCards: 0,
    reward: "+1 sebzés",
    description: "1 normál kártya",
  },
  {
    type: "small",
    name: "Kis kazamata",
    normalCards: 3,
    vezerCards: 1,
    reward: "+2 életerő",
    description: "3 normál + 1 vezér",
  },
  {
    type: "large",
    name: "Nagy kazamata",
    normalCards: 5,
    vezerCards: 1,
    reward: "+3 sebzés",
    description: "5 normál + 1 vezér",
  },
];

const dungeonCardSchema = z.object({
  cardId: z.number().min(1, "Kártya azonosító kötelező"),
  cardType: z.enum(["normal", "vezer"]),
  order: z.number().min(0),
  name: z.string().min(1, "Kártya név kötelező"),
  damage: z.number().min(1, "Sebzés legalább 1"),
  health: z.number().min(1, "Életerő legalább 1"),
  type: z.enum(["fire", "water", "earth", "air"]),
});

const dungeonSchema = z.object({
  name: z
    .string()
    .min(1, "A kazamata neve kötelező")
    .max(32, "A név maximum 32 karakter hosszú lehet")
    .regex(
      /^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ ,.!?-]+$/,
      "A név csak betűket, számokat, szóközöket és ,.!?- karaktereket tartalmazhat",
    ),
  type: z.enum(["simple", "small", "large"]),
  description: z
    .string()
    .max(200, "A leírás maximum 200 karakter hosszú lehet")
    .optional(),
  cards: z.array(dungeonCardSchema),
  reward: z.string().min(1, "Nyeremény kötelező"),
});


interface DungeonValidationErrors {
  name?: string[];
  type?: string[];
  description?: string[];
  cards?: string[];
  reward?: string[];
}

const getEffectiveDungeonCards = (dungeon: any) => {
  const dungeonType = dungeonTypes.find(dt => dt.type === dungeon.type);
  if (!dungeonType) return dungeon.cards || [];

  const cards = dungeon.cards || [];

  const normalCount = cards.filter((c: any) => c.cardType === "normal").length;
  const vezerCount = cards.filter((c: any) => c.cardType === "vezer").length;

  const missingVezer = Math.max(0, dungeonType.vezerCards - vezerCount);
  const defaultVezerCards = Array.from({ length: missingVezer }, (_, i) => ({
    cardId: -1 - i,
    cardType: "vezer",
    order: normalCount + i,
    name: "Alap Vezér",
    damage: 1,
    health: 1,
    type: "air",
  }));

  return [...cards, ...defaultVezerCards];
};


export function DungeonCreationStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: DungeonCreationStepProps) {
  const validateDungeon = (dungeon: any): DungeonValidationErrors => {
    try {
      const dungeonToValidate = {
        name: dungeon.name || "",
        type: dungeon.type || "simple",
        description: dungeon.description || "",
        cards: dungeon.cards || [],
        reward: dungeon.reward || "",
      };

      dungeonSchema.parse(dungeonToValidate);

      const dungeonType = dungeonTypes.find((dt) => dt.type === dungeon.type);
      if (dungeonType) {
        const normalCards = (dungeon.cards || []).filter(
            (c: any) => c.cardType === "normal",
        ).length;
        const vezerCards = (dungeon.cards || []).filter(
            (c: any) => c.cardType === "vezer",
        ).length;

        const errors: DungeonValidationErrors = {};

        if (normalCards !== dungeonType.normalCards) {
          errors.cards = [
            `Ez a kazamata típus pontosan ${dungeonType.normalCards} normál kártyát igényel (jelenleg: ${normalCards})`,
          ];
        }

        if (vezerCards !== dungeonType.vezerCards) {
          if (errors.cards) {
            errors.cards[0] += ` és ${dungeonType.vezerCards} vezér kártyát (jelenleg: ${vezerCards})`;
          } else {
            errors.cards = [
              `Ez a kazamata típus pontosan ${dungeonType.vezerCards} vezér kártyát igényel (jelenleg: ${vezerCards})`,
            ];
          }
        }

        if (Object.keys(errors).length > 0) {
          return errors;
        }
      }

      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        console.log("Dungeon validation errors:", fieldErrors);
        return fieldErrors;
      }
      return {};
    }
  };

  const validateAllDungeons = (): boolean => {
    if (!data.dungeons || data.dungeons.length === 0) return false;

    return data.dungeons.every((dungeon: any) => {
      const errors = validateDungeon(dungeon);
      return Object.keys(errors).length === 0;
    });
  };

  const hasDuplicateDungeonNames = (): boolean => {
    if (!data.dungeons || data.dungeons.length === 0) return false;

    const names = data.dungeons
      .map((dungeon: any) => (dungeon.name || "").trim().toLowerCase())
      .filter((name) => name.length > 0);

    return new Set(names).size !== names.length;
  };


  const addDungeon = () => {
    const newDungeon = {
      name: "",
      type: "simple" as const,
      description: "",
      cards: [],
      reward: "+1 sebzés",
    };
    onUpdate({ dungeons: [newDungeon, ...(data.dungeons || [])] });
  };

  const updateDungeon = (index: number, updates: any) => {
    const newDungeons = [...(data.dungeons || [])];
    newDungeons[index] = { ...newDungeons[index], ...updates };

    if (updates.type) {
      const dungeonType = dungeonTypes.find((dt) => dt.type === updates.type);
      if (dungeonType) {
        newDungeons[index].reward = dungeonType.reward;
      }
    }

    onUpdate({ dungeons: newDungeons });
  };

  const removeDungeon = (index: number) => {
    const newDungeons = (data.dungeons || []).filter(
      (_: any, i: number) => i !== index,
    );
    onUpdate({ dungeons: newDungeons });
  };

  const addCardToDungeon = (
    dungeonIndex: number,
    card: any,
    cardType: "normal" | "vezer",
  ) => {

    const dungeon = data.dungeons[dungeonIndex];
    const dungeonType = dungeonTypes.find((dt) => dt.type === dungeon.type);

    if (!dungeonType) return;

    const currentCards = dungeon.cards || [];
    const maxNormal = dungeonType.normalCards;
    const maxVezer = dungeonType.vezerCards;

    const currentNormal = currentCards.filter(
      (c: any) => c.cardType === "normal",
    ).length;
    const currentVezer = currentCards.filter(
      (c: any) => c.cardType === "vezer",
    ).length;

    if (cardType === "normal" && currentNormal >= maxNormal) {
      toast.error(
        `Maximum ${maxNormal} normál kártya lehet ebben a kazamatában!`,
      );
      return;
    }

    if (cardType === "vezer" && currentVezer >= maxVezer) {
      toast.error(
        `Maximum ${maxVezer} vezér kártya lehet ebben a kazamatában!`,
      );
      return;
    }

    if (currentCards.some(c => c.name === card.name && c.cardType === cardType)) {
      toast.error("Ez a kártya már hozzá van adva a kazamatához!");
      return;
    }

    // Vezér a végére
    let order;
    if (cardType === "vezer") {
      order = currentCards.length;
    } else {
      const lastNormalIndex = currentCards.filter(
        (c: any) => c.cardType === "normal",
      ).length;
      order = lastNormalIndex;
    }

    const newCard = {
      cardId: card.id || Math.floor(Math.random() * 1000) + 1,
      cardType: cardType,
      order: order,
      name: card.name,
      damage: card.damage,
      health: card.health,
      type: card.type,
    };

    const newCards = [...currentCards, newCard];

    const reorderedCards = reorderCardsForVezerLast(newCards);
    updateDungeon(dungeonIndex, { cards: reorderedCards });
  };

  const reorderCardsForVezerLast = (cards: any[]): any[] => {
    const normalCards = cards.filter((c: any) => c.cardType === "normal");
    const vezerCards = cards.filter((c: any) => c.cardType === "vezer");

    const reordered = [
      ...normalCards.map((card, index) => ({ ...card, order: index })),
      ...vezerCards.map((card, index) => ({
        ...card,
        order: normalCards.length + index,
      })),
    ];

    return reordered;
  };

  const removeCardFromDungeon = (dungeonIndex: number, cardIndex: number) => {
    const dungeon = data.dungeons[dungeonIndex];
    const newCards = dungeon.cards.filter(
      (_: any, i: number) => i !== cardIndex,
    );

    const reorderedCards = reorderCardsForVezerLast(newCards);
    updateDungeon(dungeonIndex, { cards: reorderedCards });
  };

  const moveCard = (
    dungeonIndex: number,
    cardIndex: number,
    direction: "up" | "down",
  ) => {
    const dungeon = data.dungeons[dungeonIndex];
    const cards = [...dungeon.cards];
    const cardToMove = cards[cardIndex];

    if (cardToMove.cardType === "vezer") {
      return;
    }

    const vezerCards = cards.filter((c: any) => c.cardType === "vezer");
    const lastNormalIndex = cards.length - vezerCards.length - 1;

    if (direction === "up" && cardIndex > 0) {
      [cards[cardIndex - 1], cards[cardIndex]] = [
        cards[cardIndex],
        cards[cardIndex - 1],
      ];
    } else if (direction === "down" && cardIndex < lastNormalIndex) {
      // Only allow moving down if we're not trying to go past the last normal card position
      [cards[cardIndex], cards[cardIndex + 1]] = [
        cards[cardIndex + 1],
        cards[cardIndex],
      ];
    }

    // Update order for all cards and ensure vezer cards are last
    const reorderedCards = reorderCardsForVezerLast(cards);
    updateDungeon(dungeonIndex, { cards: reorderedCards });
  };

  const getDungeonTypeInfo = (type: string) => {
    return dungeonTypes.find((dt) => dt.type === type) || dungeonTypes[0];
  };

  const getAvailableCardsForDungeon = (dungeonIndex: number) => {
    const dungeon = data.dungeons[dungeonIndex];
    const dungeonType = getDungeonTypeInfo(dungeon.type);
    const currentCards = dungeon.cards || [];

    const usedNormalIds = (data.dungeons || [])
        .flatMap((d: any) => (d.cards || []).filter((c: any) => c.cardType === "normal").map((c: any) => c.cardId));

    const usedVezerIds = (data.dungeons || [])
        .flatMap((d: any) => (d.cards || []).filter((c: any) => c.cardType === "vezer").map((c: any) => c.cardId));

    const availableNormal = (data.cards || []).filter(
        (card: any) => !usedNormalIds.includes(card.id)
    );

    const availableVezer = (data.vezerCards || []).filter(
        (card: any) => !usedVezerIds.includes(card.id)
    );

    const currentNormal = currentCards.filter((c: any) => c.cardType === "normal").length;
    const currentVezer = currentCards.filter((c: any) => c.cardType === "vezer").length;

    return {
      availableNormal,
      availableVezer,
      canAddNormal: currentNormal < dungeonType.normalCards,
      canAddVezer: currentVezer < dungeonType.vezerCards,
      maxNormal: dungeonType.normalCards,
      maxVezer: dungeonType.vezerCards,
      currentNormal,
      currentVezer,
    };
  };


  const handleNext = () => {

    if (!validateAllDungeons()){
        toast.error("Hiba")
    }

    const addedDungeons = data.dungeons || [];

    if (addedDungeons.length === 0) {
      toast.error("Legalább egy kazamata szükséges!");
      return;
    }

    // Determine the highest normal card requirement among added dungeons
    const requiredNormal = Math.max(
        ...addedDungeons.map(d => {
          const dungeonType = dungeonTypes.find(dt => dt.type === d.type);
          return dungeonType ? dungeonType.normalCards + dungeonType.vezerCards : 0;
        })
    );

    const playerNormalCards = data.availableCards?.length || 0;

    if (playerNormalCards < requiredNormal) {
      toast.error(
          `Legalább ${requiredNormal}, játékosok számára elérhető kártya szükséges a kazamatákhoz!`
      );
      return;
    }

    onNext();
  };





  const dungeons = data.dungeons || [];
  const allDungeonsValid =
    dungeons.length > 0 && validateAllDungeons() && !hasDuplicateDungeonNames();

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
            Kazamaták Létrehozása
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="space-y-6 md:space-y-8">
            {dungeons.length === 0 && (
              <div
                className="p-4 rounded-md border-2 border-dashed text-center"
                style={{
                  background: "hsl(0, 0%, 12%)",
                  borderColor: "hsl(45, 100%, 50%)",
                }}
              >
                <div className="text-amber-300 font-semibold mb-2">
                  ⚠️ Legalább egy kazamata szükséges
                </div>
                <div className="text-gray-400 text-sm">
                  A világ létrehozásához legalább egy kazamatát hozzá kell
                  adnod.
                </div>
              </div>
            )}

            {/* Kazamata + gomb */}
            <div className="text-center">
              <motion.button
                whileHover={{
                  backgroundColor: "hsl(0, 0%, 25%)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={addDungeon}
                className="px-6 py-3 rounded-md font-semibold transition-colors text-sm md:text-base"
                style={{
                  background: "hsl(0, 0%, 15%)",
                  color: "hsl(0, 0%, 85%)",
                  border: "2px dashed hsl(0, 0%, 40%)",
                }}
              >
                + Új Kazamata Hozzáadása
              </motion.button>
            </div>

            {/* Kazamata lista */}
            <div className="space-y-6">
              {dungeons.map((dungeon: any, index: number) => {
                const dungeonType = getDungeonTypeInfo(dungeon.type);
                const availableCards = getAvailableCardsForDungeon(index);
                const errors = validateDungeon(dungeon);
                const hasErrors = Object.keys(errors).length > 0;

                // Get sorted cards (vezer always last)
                const sortedCards = [...(dungeon.cards || [])].sort(
                  (a: any, b: any) => a.order - b.order,
                );

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`border-l-4 shadow-lg ${
                        hasErrors ? "ring-2 ring-red-500" : ""
                      }`}
                      style={{
                        background: "hsl(0, 0%, 12%)",
                        borderColor: "hsl(45, 100%, 50%)",
                      }}
                    >
                      <CardContent className="pt-4 md:pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Bal - Kazamata info */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label
                                className="text-sm md:text-base"
                                style={{
                                  color: "hsl(0, 0%, 75%)",
                                }}
                              >
                                Kazamata Neve *
                              </Label>
                              <Input
                                value={dungeon.name}
                                onChange={(e) =>
                                  updateDungeon(index, {
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Add meg a kazamata nevét..."
                                className={`border-none focus:ring-2 text-sm md:text-base ${
                                  errors.name ? "ring-2 ring-red-500" : ""
                                }`}
                                style={{
                                  background: "hsl(0, 0%, 20%)",
                                  color: "hsl(0, 0%, 95%)",
                                  borderRadius: "0.5rem",
                                }}
                              />
                              {errors.name && (
                                <p className="text-red-400 text-xs">
                                  {errors.name[0]}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label
                                className="text-sm md:text-base"
                                style={{
                                  color: "hsl(0, 0%, 75%)",
                                }}
                              >
                                Kazamata Típusa *
                              </Label>
                              <Select
                                value={dungeon.type}
                                onValueChange={(value: any) =>
                                  updateDungeon(index, {
                                    type: value,
                                  })
                                }
                              >
                                <SelectTrigger
                                  className={
                                    errors.type ? "ring-2 ring-red-500" : ""
                                  }
                                  style={{
                                    background: "hsl(0, 0%, 20%)",
                                    color: "hsl(0, 0%, 95%)",
                                    borderRadius: "0.5rem",
                                  }}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {dungeonTypes.map((type) => (
                                    <SelectItem
                                      key={type.type}
                                      value={type.type}
                                    >
                                      <div>
                                        <div className="font-semibold">
                                          {type.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {type.description} - {type.reward}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.type && (
                                <p className="text-red-400 text-xs">
                                  {errors.type[0]}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label
                                className="text-sm md:text-base"
                                style={{
                                  color: "hsl(0, 0%, 75%)",
                                }}
                              >
                                Leírás
                              </Label>
                              <Textarea
                                value={dungeon.description}
                                onChange={(e) =>
                                  updateDungeon(index, {
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Írj leírást a kazamatához..."
                                rows={3}
                                className={`resize-none border-none focus:ring-2 text-sm ${
                                  errors.description
                                    ? "ring-2 ring-red-500"
                                    : ""
                                }`}
                                style={{
                                  background: "hsl(0, 0%, 20%)",
                                  color: "hsl(0, 0%, 95%)",
                                  borderRadius: "0.5rem",
                                }}
                              />
                              {errors.description && (
                                <p className="text-red-400 text-xs">
                                  {errors.description[0]}
                                </p>
                              )}
                            </div>

                            <div
                              className="p-3 rounded-md"
                              style={{
                                background: "hsl(0, 0%, 18%)",
                              }}
                            >
                              <div className="text-sm font-mono">
                                <div>
                                  <strong>Típus:</strong> {dungeonType.name}
                                </div>
                                <div>
                                  <strong>Kártyák:</strong>{" "}
                                  {dungeonType.description}
                                </div>
                                <div>
                                  <strong>Nyeremény:</strong>{" "}
                                  {dungeonType.reward}
                                </div>
                                <div>
                                  <strong>Jelenlegi kártyák:</strong>{" "}
                                  {availableCards.currentNormal} normál,{" "}
                                  {availableCards.currentVezer} vezér
                                </div>
                                {errors.cards && (
                                  <div className="text-red-400 mt-2 text-xs">
                                    {errors.cards.map((error, i) => (
                                      <div key={i}>{error}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Középen - Elérhető kártyák */}
                          <div className="space-y-4">
                            <Label
                              className="text-sm md:text-base"
                              style={{
                                color: "hsl(0, 0%, 75%)",
                              }}
                            >
                              Elérhető Kártyák
                            </Label>

                            {/* Normal kártyák */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label
                                  className="text-sm"
                                  style={{
                                    color: "hsl(0, 0%, 75%)",
                                  }}
                                >
                                  Normál Kártyák ({availableCards.currentNormal}
                                  /{availableCards.maxNormal})
                                </Label>
                                {!availableCards.canAddNormal && (
                                  <span className="text-xs text-amber-400">
                                    Maximum elérve
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {availableCards.availableNormal.length > 0 ? (
                                  availableCards.availableNormal.map(
                                    (card: any, cardIndex: number) => (
                                      <div
                                        key={cardIndex}
                                        className="p-2 rounded cursor-pointer text-xs transition-colors hover:bg-hsl(0, 0%, 25%)"
                                        style={{
                                          background: "hsl(0, 0%, 20%)",
                                          borderLeft: `3px solid ${
                                            card.type === "fire"
                                              ? "hsla(0,80%,50%,0.5)"
                                              : card.type === "water"
                                                ? "hsla(210,100%,50%,0.99)"
                                                : card.type === "earth"
                                                  ? "hsl(35, 50%, 40%)"
                                                  : "hsl(180, 70%, 60%)"
                                          }`,
                                        }}
                                        onClick={() =>
                                          addCardToDungeon(
                                            index,
                                            card,
                                            "normal",
                                          )
                                        }
                                      >
                                        <div className="font-medium">
                                          {card.name}
                                        </div>
                                        <div className="text-gray-400">
                                          Seb: {card.damage} Élet: {card.health} |{" "}
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
                                        </div>
                                      </div>
                                    ),
                                  )
                                ) : (
                                  <div className="text-center text-gray-400 text-xs py-2">
                                    {data.cards?.length === 0
                                      ? "Nincsenek normál kártyák"
                                      : "Minden normál kártya már használva van"}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Vezer kártyák */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label
                                  className="text-sm"
                                  style={{
                                    color: "hsl(0, 0%, 75%)",
                                  }}
                                >
                                  Vezér Kártyák ({availableCards.currentVezer}/
                                  {availableCards.maxVezer})
                                </Label>
                                {!availableCards.canAddVezer && (
                                  <span className="text-xs text-amber-400">
                                    Maximum elérve
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {availableCards.availableVezer.length > 0 ? (
                                  availableCards.availableVezer.map(
                                    (card: any, cardIndex: number) => (
                                      <div
                                        key={cardIndex}
                                        className="p-2 rounded cursor-pointer text-xs transition-colors hover:bg-hsl(0, 0%, 25%)"
                                        style={{
                                          background: "hsl(0, 0%, 20%)",
                                          borderLeft:
                                            "3px solid hsl(260, 60%, 60%)",
                                        }}
                                        onClick={() =>
                                          addCardToDungeon(index, card, "vezer")
                                        }
                                      >
                                        <div className="font-medium text-purple-300">
                                          {card.name}
                                        </div>
                                        <div className="text-gray-400">
                                          Seb: {card.damage} Élet: {card.health} |{" "}
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
                                        </div>
                                      </div>
                                    ),
                                  )
                                ) : (
                                  <div className="text-center text-gray-400 text-xs py-2">
                                    {data.vezerCards?.length === 0
                                      ? "Nincsenek vezér kártyák"
                                      : "Minden vezér kártya már használva van"}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Jobb */}
                          <div className="space-y-4">
                            <Label
                              className="text-sm md:text-base"
                              style={{
                                color: "hsl(0, 0%, 75%)",
                              }}
                            >
                              Kiválasztott Kártyák (Sorrend)
                            </Label>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {sortedCards.length > 0 ? (
                                sortedCards.map(
                                  (card: any, cardIndex: number) => {
                                    const isVezer = card.cardType === "vezer";
                                    const isLastNormal =
                                      !isVezer &&
                                      cardIndex ===
                                        sortedCards.filter(
                                          (c: any) => c.cardType === "normal",
                                        ).length -
                                          1;

                                    return (
                                      <motion.div
                                        key={cardIndex}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-2 p-2 rounded text-xs group"
                                        style={{
                                          background: "hsl(0, 0%, 18%)",
                                          borderLeft: `3px solid ${
                                            isVezer
                                              ? "hsl(260, 60%, 60%)"
                                              : card.type === "fire"
                                                ? "hsla(0,80%,50%,0.5)"
                                                : card.type === "water"
                                                  ? "hsla(210,100%,50%,0.99)"
                                                  : card.type === "earth"
                                                    ? "hsl(35, 50%, 40%)"
                                                    : "hsl(180, 70%, 60%)"
                                          }`,
                                        }}
                                      >
                                        {/* Sorrend variálás */}
                                        <div className="flex flex-col gap-1">
                                          <motion.button
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                              moveCard(index, cardIndex, "up")
                                            }
                                            disabled={
                                              cardIndex === 0 || isVezer
                                            }
                                            className="w-4 h-4 flex items-center justify-center text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                                            style={{
                                              color: "hsl(0, 0%, 75%)",
                                            }}
                                            title={
                                              isVezer
                                                ? "Vezér kártyák nem mozgathatók"
                                                : "Fel mozgatás"
                                            }
                                          >
                                            ↑
                                          </motion.button>
                                          <motion.button
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                              moveCard(index, cardIndex, "down")
                                            }
                                            disabled={isVezer || isLastNormal}
                                            className="w-4 h-4 flex items-center justify-center text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                                            style={{
                                              color: "hsl(0, 0%, 75%)",
                                            }}
                                            title={
                                              isVezer
                                                ? "Vezér kártyák nem mozgathatók"
                                                : "Le mozgatás"
                                            }
                                          >
                                            ↓
                                          </motion.button>
                                        </div>

                                        {/* Sorrend szám */}
                                        <div
                                          className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold"
                                          style={{
                                            background: isVezer
                                              ? "hsl(260, 60%, 30%)"
                                              : "hsl(0, 0%, 25%)",
                                            color: "hsl(0, 0%, 95%)",
                                          }}
                                        >
                                          {card.order + 1}
                                        </div>

                                        {/* Kártya info */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={
                                                isVezer
                                                  ? "text-purple-300 font-medium"
                                                  : "font-medium"
                                              }
                                            >
                                              {isVezer ? "⚡ " : ""}
                                              {card.name}
                                            </span>
                                            {isVezer && (
                                              <span className="text-xs text-purple-400 bg-purple-900 bg-opacity-50 px-1 rounded">
                                                Vezér
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-gray-400">
                                            Seb: {card.damage} Élet: {card.health}{" "}
                                            |{" "}
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
                                          </div>
                                        </div>

                                        {/* Eltávolítás */}
                                        <motion.button
                                          whileHover={{ scale: 1.2 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() =>
                                            removeCardFromDungeon(
                                              index,
                                              cardIndex,
                                            )
                                          }
                                          className="text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Kártya eltávolítása"
                                        >
                                          ✕
                                        </motion.button>
                                      </motion.div>
                                    );
                                  },
                                )
                              ) : (
                                <div className="text-center text-gray-400 text-sm py-4">
                                  Még nincsenek kártyák a kazamatában
                                </div>
                              )}
                            </div>

                            {/* Vezer kártya notice */}
                            {sortedCards.some(
                              (card: any) => card.cardType === "vezer",
                            ) && (
                              <div className="text-xs text-purple-400 bg-purple-900 bg-opacity-30 p-2 rounded">
                                ⚡ A vezér kártyák mindig az utolsó helyen
                                szerepelnek
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Kazamata eltávolítás */}
                        <div className="flex justify-between items-center mt-4">
                          {hasErrors && (
                            <div className="text-amber-400 text-xs flex items-center">
                              <span className="mr-1">⚠</span>A kazamata nincs
                              megfelelően kitöltve
                            </div>
                          )}
                          <motion.button
                            whileHover={{
                              scale: 1.05,
                              backgroundColor: "hsl(0, 70%, 55%)",
                            }}
                            whileTap={{
                              scale: 0.95,
                            }}
                            onClick={() => removeDungeon(index)}
                            className="px-4 py-2 md:px-4 md:py-2 rounded-md font-semibold transition-colors text-sm md:text-base bg-red-700 hover:bg-red-500 cursor-pointer ml-auto"
                          >
                            Eltávolítás
                          </motion.button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {dungeons.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Még nincsenek kazamaták. Kattints a "Új Kazamata Hozzáadása"
                gombra!
              </div>
            )}

            {/* Validation summary */}
            {dungeons.length > 0 && !allDungeonsValid && (
              <div
                className="p-3 rounded-md"
                style={{ background: "hsl(45, 100%, 20%)" }}
              >
                <div className="text-amber-200 text-sm flex items-center">
                  <span className="mr-2">⚠</span>
                  {hasDuplicateDungeonNames()
                    ? "Minden kazamatának egyedi névvel kell rendelkeznie!"
                    : "Néhány kazamata nincs megfelelően kitöltve. Kérlek ellenőrizd a piros hibaüzeneteket."}
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
                disabled={!allDungeonsValid}
                style={{
                  background: !allDungeonsValid
                    ? "hsl(0, 0%, 35%)"
                    : "hsl(0, 0%, 90%)",
                  color: !allDungeonsValid
                    ? "hsl(0, 0%, 60%)"
                    : "hsl(0, 0%, 10%)",
                  cursor: !allDungeonsValid ? "not-allowed" : "pointer",
                }}
                className="px-4 py-2 md:px-8 md:py-2 rounded-md font-semibold transition-colors text-sm md:text-base w-full md:w-auto"
              >
                Következő: Áttekintés
              </motion.button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

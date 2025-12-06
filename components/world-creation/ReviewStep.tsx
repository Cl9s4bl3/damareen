import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewStepProps {
  data: any;
  onBack: () => void;
  onSubmit: () => void;
}

const dungeonTypes = [
  {
    type: "simple",
    name: "Egyszerű találkozás",
    reward: "+1 sebzés",
  },
  {
    type: "small",
    name: "Kis kazamata",
    reward: "+2 életerő",
  },
  {
    type: "large",
    name: "Nagy kazamata",
    reward: "+3 sebzés",
  },
];

export function ReviewStep({ data, onBack, onSubmit }: ReviewStepProps) {
  const getDungeonTypeName = (type: string) => {
    return dungeonTypes.find((dt) => dt.type === type)?.name || type;
  };

  const getDungeonReward = (type: string) => {
    return dungeonTypes.find((dt) => dt.type === type)?.reward || "";
  };

  const getElementColor = (type: string) => {
    switch (type) {
      case "fire":
        return "hsl(0, 80%, 55%)";
      case "water":
        return "hsl(210, 80%, 55%)";
      case "earth":
        return "hsl(35, 50%, 45%)";
      case "air":
        return "hsl(180, 70%, 60%)";
      default:
        return "hsl(0, 0%, 50%)";
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case "fire":
        return "🔥";
      case "water":
        return "💧";
      case "earth":
        return "🪨";
      case "air":
        return "💨";
      default:
        return "✨";
    }
  };

  // Játékosok számára elérhető kártyák
  const availableCards = data.cards?.filter((card: any) =>
      data.availableCards?.includes(card.name)
  ) || [];

  // Játékosok számára NEM elérhető kártyák (hasonlítás miatt kell)
  const unavailableCards = data.cards?.filter((card: any) =>
      !data.availableCards?.includes(card.name)
  ) || [];

  return (
      <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
      >
        <Card
            className="w-full max-w-6xl mx-auto border-none shadow-lg"
            style={{
              background: "hsl(0, 0%, 10%)",
              color: "hsl(0, 0%, 95%)",
            }}
        >
          <CardHeader>
            <CardTitle
                className="text-center text-2xl md:text-3xl font-bold"
                style={{ color: "hsl(0, 0%, 95%)" }}
            >
              Világ Áttekintése
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Világ leírás */}
            <div
                className="text-center space-y-4 p-6 rounded-lg"
                style={{ background: "hsl(0, 0%, 15%)" }}
            >
              <h2 className="text-4xl md:text-5xl font-bold  bg-clip-text text-yellow-600 ">
                {data.worldName || "—"}
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                {data.description || "Nincs leírás megadva."}
              </p>
              {data.bgStyle && (
                  <div className="flex justify-center items-center gap-2 text-sm text-gray-400">
                    <span>Stílus:</span>
                  {data.bgStyle === "forest" ? "🌲 Erdő" :
                      data.bgStyle === "desert" ? "🏜️ Sivatag" :
                          data.bgStyle === "mountains" ? "⛰️ Hegy" :
                              data.bgStyle === "water" ? "🌊 Víz" :
                                  data.bgStyle === "fire" ? "🔥 Tűz" : "🌲 Erdő"}
                  </div>
              )}
            </div>

            {/* Summary Statok */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                  className="text-center p-4 rounded-lg"
                  style={{ background: "hsl(0, 0%, 15%)" }}
              >
                <div className="text-2xl font-bold text-blue-400">
                  {data.cards?.length || 0}
                </div>
                <div className="text-sm text-gray-400 mt-1">Normál Kártyák</div>
              </div>
              <div
                  className="text-center p-4 rounded-lg"
                  style={{ background: "hsl(0, 0%, 15%)" }}
              >
                <div className="text-2xl font-bold text-purple-400">
                  {data.vezerCards?.length || 0}
                </div>
                <div className="text-sm text-gray-400 mt-1">Vezér Kártyák</div>
              </div>
              <div
                  className="text-center p-4 rounded-lg"
                  style={{ background: "hsl(0, 0%, 15%)" }}
              >
                <div className="text-2xl font-bold text-yellow-400">
                  {data.dungeons?.length || 0}
                </div>
                <div className="text-sm text-gray-400 mt-1">Kazamaták</div>
              </div>
              <div
                  className="text-center p-4 rounded-lg"
                  style={{ background: "hsl(0, 0%, 15%)" }}
              >
                <div className="text-2xl font-bold text-green-400">
                  {availableCards.length}
                </div>
                <div className="text-sm text-gray-400 mt-1">Játékos Kártyák</div>
              </div>
            </div>

            {/* Játékos elérhető kártyák */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3
                    className="text-xl font-bold"
                    style={{ color: "hsl(0, 0%, 90%)" }}
                >
                  Játékosok Számára Elérhető Kártyák
                </h3>
                <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ background: "hsl(0, 0%, 20%)" }}
                >
                {availableCards.length} / {data.cards?.length || 0} db
              </span>
              </div>

              {availableCards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableCards.map((card: any, index: number) => (
                        <motion.div
                            key={card.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-lg border-l-4 relative overflow-hidden"
                            style={{
                              background: "hsl(0, 0%, 15%)",
                              borderLeftColor: getElementColor(card.type),
                            }}
                        >
                          {/* Elérhető badge */}
                          <div
                              className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold"
                              style={{
                                background: "hsl(142, 76%, 36%)",
                                color: "hsl(0, 0%, 100%)",
                              }}
                          >
                            ✅ Elérhető
                          </div>

                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getElementIcon(card.type)}
                        </span>
                              <span className="font-bold text-lg">{card.name}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div
                                className="text-center p-2 rounded"
                                style={{ background: "hsl(0, 0%, 20%)" }}
                            >
                              <div className="text-red-400 font-bold">
                                ⚔️ {card.damage}
                              </div>
                              <div className="text-gray-400 text-xs">Sebzés</div>
                            </div>
                            <div
                                className="text-center p-2 rounded"
                                style={{ background: "hsl(0, 0%, 20%)" }}
                            >
                              <div className="text-green-400 font-bold">
                                ❤️ {card.health}
                              </div>
                              <div className="text-gray-400 text-xs">Életerő</div>
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-gray-400 capitalize">
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
                            )}{" "}
                            elem
                          </div>
                        </motion.div>
                    ))}
                  </div>
              ) : (
                  <div
                      className="text-center py-8 text-gray-400 rounded-lg"
                      style={{ background: "hsl(0, 0%, 15%)" }}
                  >
                    <div className="text-4xl mb-2">🚫</div>
                    <div>Nincsenek játékosok számára elérhető kártyák</div>
                    <div className="text-sm mt-1">
                      A játékosok nem fognak tudni kártyákat választani
                    </div>
                  </div>
              )}

              {/* nem elérhető kártyák, ha vannak */}
              {unavailableCards.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <h4
                          className="text-lg font-bold"
                          style={{ color: "hsl(0, 0%, 70%)" }}
                      >
                        Játékosoknak Nem Elérhető Kártyák
                      </h4>
                      <span
                          className="px-3 py-1 rounded-full text-sm"
                          style={{ background: "hsl(0, 0%, 20%)" }}
                      >
                    {unavailableCards.length} db
                  </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 opacity-60">
                      {unavailableCards.map((card: any, index: number) => (
                          <motion.div
                              key={card.name}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="p-3 rounded-lg border-l-4 relative"
                              style={{
                                background: "hsl(0, 0%, 12%)",
                                borderLeftColor: getElementColor(card.type),
                              }}
                          >
                            <div
                                className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs"
                                style={{
                                  background: "hsl(0, 0%, 30%)",
                                  color: "hsl(0, 0%, 60%)",
                                }}
                            >
                              🔒 Letiltva
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">
                          {getElementIcon(card.type)}
                        </span>
                              <span className="font-medium text-sm text-gray-400">
                          {card.name}
                        </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Seb: {card.damage} | Életerő: {card.health}
                            </div>
                          </motion.div>
                      ))}
                    </div>
                  </div>
              )}
            </div>

            {/* Normál kártyák */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3
                    className="text-xl font-bold"
                    style={{ color: "hsl(0, 0%, 90%)" }}
                >
                  Összes Normál Kártya
                </h3>
                <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ background: "hsl(0, 0%, 20%)" }}
                >
                {data.cards?.length || 0} db
              </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.cards && data.cards.length > 0 ? (
                    data.cards.map((card: any, index: number) => {
                      const isAvailable = data.availableCards?.includes(card.name);
                      return (
                          <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 rounded-lg border-l-4 relative"
                              style={{
                                background: "hsl(0, 0%, 15%)",
                                borderLeftColor: getElementColor(card.type),
                                opacity: isAvailable ? 1 : 0.6,
                              }}
                          >
                            {/* Elérhetőség indicator */}
                            {!isAvailable && (
                                <div
                                    className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs"
                                    style={{
                                      background: "hsl(0, 0%, 30%)",
                                      color: "hsl(0, 0%, 60%)",
                                    }}
                                >
                                  🔒
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getElementIcon(card.type)}
                          </span>
                                <span className={`font-bold text-lg ${isAvailable ? '' : 'text-gray-400'}`}>
                            {card.name}
                          </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div
                                  className="text-center p-2 rounded"
                                  style={{ background: "hsl(0, 0%, 20%)" }}
                              >
                                <div className="text-red-400 font-bold">
                                  ⚔️ {card.damage}
                                </div>
                                <div className="text-gray-400 text-xs">Sebzés</div>
                              </div>
                              <div
                                  className="text-center p-2 rounded"
                                  style={{ background: "hsl(0, 0%, 20%)" }}
                              >
                                <div className="text-green-400 font-bold">
                                  ❤️ {card.health}
                                </div>
                                <div className="text-gray-400 text-xs">Életerő</div>
                              </div>
                            </div>

                            <div className="mt-3 text-xs text-gray-400 capitalize">
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
                              )}{" "}
                              elem
                              {!isAvailable && (
                                  <span className="ml-2 text-amber-400">(Nem elérhető játékosoknak)</span>
                              )}
                            </div>
                          </motion.div>
                      );
                    })
                ) : (
                    <div
                        className="col-span-full text-center py-8 text-gray-400 rounded-lg"
                        style={{ background: "hsl(0, 0%, 15%)" }}
                    >
                      <div className="text-4xl mb-2">🃏</div>
                      <div>Nincsenek normál kártyák</div>
                    </div>
                )}
              </div>
            </div>

            {/* Vezer kártyák */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3
                    className="text-xl font-bold"
                    style={{ color: "hsl(0, 0%, 90%)" }}
                >
                  Vezér Kártyák
                </h3>
                <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ background: "hsl(0, 0%, 20%)" }}
                >
                {data.vezerCards?.length || 0} db
              </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.vezerCards && data.vezerCards.length > 0 ? (
                    data.vezerCards.map((vezer: any, index: number) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-lg border-l-4 relative overflow-hidden"
                            style={{
                              background: "hsl(0, 0%, 15%)",
                              borderLeftColor: "hsl(260, 60%, 60%)",
                            }}
                        >
                          {/* Háttér effekt */}
                          <div
                              className="absolute top-0 right-0 w-20 h-20 opacity-10"
                              style={{
                                background:
                                    "radial-gradient(circle, hsl(260, 60%, 60%) 0%, transparent 70%)",
                              }}
                          />

                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">⚡</span>
                              <span className="font-bold text-lg text-purple-300">
                          {vezer.name}
                        </span>
                            </div>
                            <div
                                className="text-xs px-2 py-1 rounded-full"
                                style={{ background: "hsl(260, 60%, 20%)" }}
                            >
                              {vezer.boostType === "damage_double"
                                  ? "2× Sebzés"
                                  : "2× Életerő"}
                            </div>
                          </div>

                          <div className="mb-3 text-sm text-gray-400">
                            Alap kártya:{" "}
                            <span className="text-white">{vezer.baseCardName}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div
                                className="text-center p-2 rounded"
                                style={{ background: "hsl(0, 0%, 20%)" }}
                            >
                              <div
                                  className={`font-bold ${vezer.boostType === "damage_double" ? "text-yellow-400" : "text-red-400"}`}
                              >
                                ⚔️ {vezer.damage}
                              </div>
                              <div className="text-gray-400 text-xs">Sebzés</div>
                            </div>
                            <div
                                className="text-center p-2 rounded"
                                style={{ background: "hsl(0, 0%, 20%)" }}
                            >
                              <div
                                  className={`font-bold ${vezer.boostType === "health_double" ? "text-yellow-400" : "text-green-400"}`}
                              >
                                ❤️ {vezer.health}
                              </div>
                              <div className="text-gray-400 text-xs">Életerő</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                            <span>{getElementIcon(vezer.type)}</span>
                            <span className="capitalize">
                        {vezer.type === "fire" ? (
                            <span>Tűz</span>
                        ) : vezer.type === "water" ? (
                            <span>Víz</span>
                        ) : vezer.type === "earth" ? (
                            <span>Föld</span>
                        ) : vezer.type === "air" ? (
                            <span>Levegő</span>
                        ) : (
                            <span>???</span>
                        )}{" "}
                              elem
                      </span>
                          </div>
                        </motion.div>
                    ))
                ) : (
                    <div
                        className="col-span-full text-center py-8 text-gray-400 rounded-lg"
                        style={{ background: "hsl(0, 0%, 15%)" }}
                    >
                      <div className="text-4xl mb-2">👑</div>
                      <div>Nincsenek vezér kártyák</div>
                    </div>
                )}
              </div>
            </div>

            {/* Dungeons */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3
                    className="text-xl font-bold"
                    style={{ color: "hsl(0, 0%, 90%)" }}
                >
                  Kazamaták
                </h3>
                <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ background: "hsl(0, 0%, 20%)" }}
                >
                {data.dungeons?.length || 0} db
              </span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {data.dungeons && data.dungeons.length > 0 ? (
                    data.dungeons.map((dungeon: any, index: number) => {
                      const sortedCards = [...(dungeon.cards || [])].sort(
                          (a: any, b: any) => a.order - b.order,
                      );

                      return (
                          <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-6 rounded-lg border-l-4"
                              style={{
                                background: "hsl(0, 0%, 15%)",
                                borderLeftColor: "hsl(45, 100%, 50%)",
                              }}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-bold text-2xl text-yellow-400 ">
                                    {dungeon.name}
                                  </h4>
                                  <span
                                      className="px-3 py-1 rounded-full text-sm"
                                      style={{ background: "hsl(45, 100%, 20%)" }}
                                  >
                              {getDungeonTypeName(dungeon.type)}
                            </span>
                                </div>

                                {dungeon.description && (
                                    <p className="text-gray-300 leading-relaxed">
                                      {dungeon.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Nyeremény:</span>
                                    <span className="font-bold text-green-400">
                                {getDungeonReward(dungeon.type)}
                              </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Kártyák:</span>
                                    <span className="font-bold">
                                {dungeon.cards?.length || 0} db
                              </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Dungeon Cards with Order */}
                            {sortedCards.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-700">
                                  <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
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
                                            className="flex items-center gap-3 p-3 rounded-lg group"
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
                                              ? "text-purple-300 font-bold"
                                              : "font-bold"
                                        }
                                    >
                                      {card.cardType === "vezer" ? "⚡ " : ""}
                                      {card.name}
                                    </span>
                                              <span className="text-xs text-gray-400 capitalize">
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
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                              <span>Seb: {card.damage}</span>
                                              <span>Életerő: {card.health}</span>
                                              <span
                                                  className={
                                                    card.cardType === "vezer"
                                                        ? "text-purple-400"
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
                          </motion.div>
                      );
                    })
                ) : (
                    <div
                        className="text-center py-12 text-gray-400 rounded-lg"
                        style={{ background: "hsl(0, 0%, 15%)" }}
                    >
                      <div className="text-4xl mb-2">🏰</div>
                      <div className="text-lg">Nincsenek kazamaták</div>
                      <div className="text-sm mt-1">
                        A játékosok nem fognak kihívásokkal találkozni
                      </div>
                    </div>
                )}
              </div>
            </div>

            {/* Final Summary */}
            <div
                className="p-6 rounded-lg text-center"
                style={{ background: "hsl(0, 0%, 15%)" }}
            >
              <h3 className="text-xl font-bold mb-2">Világ Összegzése</h3>
              <p className="text-gray-400 mb-4">
                {data.dungeons?.length > 0
                    ? `A világ ${data.dungeons.length} kazamatát tartalmaz, összesen ${data.cards?.length || 0} normál kártyával és ${data.vezerCards?.length || 0} vezér kártyával.`
                    : `A világ ${data.cards?.length || 0} normál kártyából ${availableCards.length} elérhető a játékosok számára.`}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>{availableCards.length} játékosoknak elérhető kártya</span>
                </div>
                {unavailableCards.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span>{unavailableCards.length} játékosoknak letiltott kártya</span>
                    </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse md:flex-row justify-between gap-4 md:gap-0 pt-6">
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
                ← Vissza a Szerkesztéshez
              </motion.button>

              <motion.button
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "hsl(120, 60%, 50%)",
                    color: "hsl(0, 0%, 100%)",
                    boxShadow: "0 0 20px hsl(120, 60%, 40%)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onSubmit}
                  className="px-8 py-3 rounded-lg font-bold transition-all text-base md:text-lg relative overflow-hidden"
                  style={{
                    background: "hsl(120, 50%, 45%)",
                    color: "hsl(0, 0%, 100%)",
                  }}
              >
                {/* Animated background effect */}
                <motion.div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background:
                          "linear-gradient(90deg, transparent, hsl(120, 80%, 80%), transparent)",
                    }}
                    animate={{
                      x: ["0%", "100%", "0%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                />
                <span className="relative z-10 cursor-pointer ">
                🚀 Világ Létrehozása
              </span>
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
  );
}
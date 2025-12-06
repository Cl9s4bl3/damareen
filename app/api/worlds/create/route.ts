import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  worlds,
  normalCards,
  vezerCards,
  dungeons,
  dungeonNormalCards,
  dungeonVezerCards,
  dungeonTypes,
  worldAvailableCards,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
          { error: "Érvénytelen hitelesítés" },
          { status: 401 },
      );
    }

    const worldData = await req.json();

    console.log("Received world creation request from user:", user.id);
    console.log("World name:", worldData.worldName);
    console.log("Normal cards count:", worldData.cards?.length);
    console.log("Vezer cards count:", worldData.vezerCards?.length);
    console.log("Dungeons count:", worldData.dungeons?.length);
    console.log("Available cards count:", worldData.availableCards?.length);
    console.log("Background style:", worldData.bgStyle);

    if (!worldData.worldName || !worldData.cards || !worldData.dungeons) {
      return NextResponse.json(
          { error: "Hiányzó kötelező mezők: világ név, kártyák vagy kazamaták" },
          { status: 400 },
      );
    }

    if (!Array.isArray(worldData.cards) || worldData.cards.length === 0) {
      return NextResponse.json(
          { error: "Legalább egy normál kártya szükséges" },
          { status: 400 },
      );
    }

    if (!Array.isArray(worldData.dungeons) || worldData.dungeons.length === 0) {
      return NextResponse.json(
          { error: "Legalább egy kazamata szükséges" },
          { status: 400 },
      );
    }

    if (!worldData.availableCards || !Array.isArray(worldData.availableCards) || worldData.availableCards.length === 0) {
      return NextResponse.json(
          { error: "Legalább egy kártyát ki kell választani a játékosok számára" },
          { status: 400 },
      );
    }

    if (worldData.asciiArt === null || worldData.asciiArt === "") {
        return NextResponse.json(
            {error: "Az ASCII karakter nem lehet üres."},
            {status: 400}
        )
    }

    const worldInsertResult = await db.insert(worlds).values({
      name: worldData.worldName,
      description: worldData.description || "",
      bgStyle: worldData.bgStyle || "forest",
      createdBy: user.id,
    });

    console.log("World insert result:", worldInsertResult);

    let worldId: number;

    if (
        Array.isArray(worldInsertResult) &&
        worldInsertResult[0] &&
        "insertId" in worldInsertResult[0]
    ) {
      worldId = worldInsertResult[0].insertId;
    } else if (worldInsertResult && "insertId" in worldInsertResult) {
      worldId = (worldInsertResult as any).insertId;
    } else if (
        Array.isArray(worldInsertResult) &&
        worldInsertResult[0] &&
        "id" in worldInsertResult[0]
    ) {
      worldId = worldInsertResult[0].id;
    } else {
      const latestWorlds = await db
          .select()
          .from(worlds)
          .where(eq(worlds.createdBy, user.id))
          .orderBy(worlds.id)
          .limit(1);

      if (latestWorlds.length > 0) {
        worldId = latestWorlds[0].id;
      } else {
        throw new Error("Failed to get world ID after insertion");
      }
    }

    console.log("World created with ID:", worldId);

    try {
      const normalCardInserts = worldData.cards.map((card: any) => ({
        worldId: worldId,
        name: card.name,
        damage: card.damage,
        health: card.health,
        type: card.type,
        asciiArt: card.asciiArt,
        description: card.description || "",
      }));

      console.log("First normal card insert:", normalCardInserts[0]);

      await db.insert(normalCards).values(normalCardInserts);

      const insertedNormalCards = await db
          .select()
          .from(normalCards)
          .where(eq(normalCards.worldId, worldId));

      console.log("Normal cards inserted:", insertedNormalCards.length);

      const normalCardMap = new Map();
      insertedNormalCards.forEach((card) => {
        normalCardMap.set(card.name, card.id);
      });

      console.log("Processing available cards:", worldData.availableCards);

      const availableCardInserts = [];
      for (const cardIdentifier of worldData.availableCards) {
        let cardName = cardIdentifier;

        if (typeof cardIdentifier === 'object') {
          cardName = cardIdentifier.name || cardIdentifier.id;
        }

        const dbCardId = normalCardMap.get(cardName);
        if (dbCardId) {
          availableCardInserts.push({
            worldId: worldId,
            normalCardId: dbCardId,
            isAvailable: true,
          });
        } else {
          console.warn(`Card not found in database: ${cardName}`);
          // Nem teljes név használata, ha nincs találat
          const foundCard = insertedNormalCards.find(card =>
              card.name.includes(cardName) || cardName.includes(card.name)
          );
          if (foundCard) {
            availableCardInserts.push({
              worldId: worldId,
              normalCardId: foundCard.id,
              isAvailable: true,
            });
            console.log(`Found card by partial match: ${cardName} -> ${foundCard.name}`);
          }
        }
      }

      if (availableCardInserts.length === 0) {
        console.log("No available cards matched, adding all normal cards as available");
        for (const card of insertedNormalCards) {
          availableCardInserts.push({
            worldId: worldId,
            normalCardId: card.id,
            isAvailable: true,
          });
        }
      }

      if (availableCardInserts.length > 0) {
        await db.insert(worldAvailableCards).values(availableCardInserts);
        console.log("Available cards inserted:", availableCardInserts.length);
      } else {
        console.warn("No available cards were inserted - this might cause issues");
      }

      let insertedVezerCards = [];
      let vezerCardMap = new Map();

      if (worldData.vezerCards && worldData.vezerCards.length > 0) {
        const vezerCardInserts = worldData.vezerCards.map((vezerCard: any) => {
          const baseCardId = normalCardMap.get(vezerCard.baseCardName);
          if (!baseCardId) {
            throw new Error(
                `Alap kártya nem található: ${vezerCard.baseCardName}`,
            );
          }

          return {
            worldId: worldId,
            baseCardId,
            name: vezerCard.name,
            boostType: vezerCard.boostType,
            damage: vezerCard.damage,
            health: vezerCard.health,
            type: vezerCard.type,
            asciiArt: vezerCard.asciiArt,
            description: vezerCard.description || "",
          };
        });

        await db.insert(vezerCards).values(vezerCardInserts);

        insertedVezerCards = await db
            .select()
            .from(vezerCards)
            .where(eq(vezerCards.worldId, worldId));

        insertedVezerCards.forEach((card) => {
          vezerCardMap.set(card.name, card.id);
        });

        console.log("Vezer cards inserted:", insertedVezerCards.length);
      }

      const dungeonTypeRecords = await db.select().from(dungeonTypes);
      const dungeonTypeMap = new Map();
      dungeonTypeRecords.forEach((type) => {
        if (type.id === 1)
          dungeonTypeMap.set("simple", type.id);
        if (type.id === 2) dungeonTypeMap.set("small", type.id);
        if (type.id === 3) dungeonTypeMap.set("large", type.id);
      });

      for (const dungeonData of worldData.dungeons) {
        const typeId = dungeonTypeMap.get(dungeonData.type);
        if (!typeId) {
          throw new Error(`Érvénytelen kazamata típus: ${dungeonData.type}`);
        }

        const dungeonResult = await db.insert(dungeons).values({
          worldId: worldId,
          name: dungeonData.name,
          typeId,
          description: dungeonData.description || "",
          createdBy: user.id,
        });

        let dungeonId: number;

        if (
            Array.isArray(dungeonResult) &&
            dungeonResult[0] &&
            "insertId" in dungeonResult[0]
        ) {
          dungeonId = dungeonResult[0].insertId;
        } else if (dungeonResult && "insertId" in dungeonResult) {
          dungeonId = (dungeonResult as any).insertId;
        } else {
          const latestDungeons = await db
              .select()
              .from(dungeons)
              .where(eq(dungeons.createdBy, user.id))
              .orderBy(dungeons.id)
              .limit(1);

          if (latestDungeons.length > 0) {
            dungeonId = latestDungeons[0].id;
          } else {
            throw new Error("Failed to get dungeon ID after insertion");
          }
        }

        console.log(`Dungeon created: ${dungeonData.name} (ID: ${dungeonId})`);

        const dungeonNormalCardInserts = [];
        const dungeonVezerCardInserts = [];

        if (Array.isArray(dungeonData.cards)) {
          for (const card of dungeonData.cards) {
            let cardName, cardType, cardOrder;

            if (typeof card === 'string') {
              cardName = card;
              cardType = 'normal';
              cardOrder = 0;
            } else {
              cardName = card.name || card.cardName;
              cardType = card.cardType || card.type || 'normal';
              cardOrder = card.order || card.cardOrder || 0;
            }

            if (cardType === 'normal') {
              const normalCardId = normalCardMap.get(cardName);
              if (normalCardId) {
                dungeonNormalCardInserts.push({
                  dungeonId,
                  normalCardId,
                  cardOrder,
                });
              } else {
                console.warn(`Normal card not found in dungeon: ${cardName}`);
              }
            } else if (cardType === 'vezer') {
              const vezerCardId = vezerCardMap.get(cardName);
              if (vezerCardId) {
                dungeonVezerCardInserts.push({
                  dungeonId,
                  vezerCardId,
                  cardOrder,
                });
              } else {
                console.warn(`Vezer card not found in dungeon: ${cardName}`);
              }
            }
          }
        }

        if (dungeonNormalCardInserts.length > 0) {
          await db.insert(dungeonNormalCards).values(dungeonNormalCardInserts);
          console.log(
              `Inserted ${dungeonNormalCardInserts.length} normal cards to dungeon ${dungeonData.name}`,
          );
        }

        if (dungeonVezerCardInserts.length > 0) {
          await db.insert(dungeonVezerCards).values(dungeonVezerCardInserts);
          console.log(
              `Inserted ${dungeonVezerCardInserts.length} vezer cards to dungeon ${dungeonData.name}`,
          );
        }
      }

      console.log(
          "World creation completed successfully for world ID:",
          worldId,
      );

      return NextResponse.json({
        message: "Világ sikeresen létrehozva",
        worldId: worldId,
        stats: {
          normalCards: insertedNormalCards.length,
          vezerCards: insertedVezerCards.length,
          dungeons: worldData.dungeons.length,
          availableCards: availableCardInserts.length,
          bgStyle: worldData.bgStyle || "forest",
        },
      });
    } catch (nestedError) {
      console.error(
          "Error during world creation, rolling back world:",
          nestedError,
      );
      await db.delete(worlds).where(eq(worlds.id, worldId));
      throw nestedError;
    }
  } catch (error) {
    console.error("World creation error:", error);

    let errorMessage = "Hiba történt a világ létrehozása során";

    if (error instanceof Error) {
      if (error.message.includes("Alap kártya nem található")) {
        errorMessage = error.message;
      } else if (error.message.includes("Normál kártya nem található")) {
        errorMessage = error.message;
      } else if (error.message.includes("Vezér kártya nem található")) {
        errorMessage = error.message;
      } else if (error.message.includes("Érvénytelen kazamata típus")) {
        errorMessage = error.message;
      } else if (
          error.message.includes("unique constraint") ||
          error.message.includes("Duplicate entry")
      ) {
        errorMessage = "Már létezik világ ezzel a névvel";
      } else if (error.message.includes("Failed to get")) {
        errorMessage = "Adatbázis hiba: nem sikerült létrehozni a rekordot";
      } else if (error.message.includes("Legalább egy kártyát ki kell választani")) {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
          { error: "Érvénytelen hitelesítés" },
          { status: 401 },
      );
    }

    const worldList = await db
        .select()
        .from(worlds)
        .where(eq(worlds.isActive, true));

    return NextResponse.json({
      worlds: worldList,
      count: worldList.length,
    });
  } catch (error) {
    console.error("Error fetching worlds:", error);
    return NextResponse.json(
        { error: "Hiba történt a világok betöltése során" },
        { status: 500 },
    );
  }
}
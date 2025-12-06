import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { playerWorldCollection, worldAvailableCards, normalCards } from "@/db/schema";
import { and, eq } from "drizzle-orm";

import {getCurrentUser} from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Érvénytelen hitelesítés" }, { status: 401 });
        }

        const { worldId } = await request.json();

        if (!worldId) {
            return NextResponse.json({ error: "WorldID megadása kötelező" }, { status: 400 });
        }

        const userId = parseInt(user.id);

        const existingCollection = await db
            .select()
            .from(playerWorldCollection)
            .where(
                and(
                    eq(playerWorldCollection.userId, userId),
                    eq(playerWorldCollection.worldId, worldId)
                )
            )
            .limit(1);

        if (existingCollection.length > 0) {
            return NextResponse.json({
                message: "A játékosnak már vannak kártyái ehhez a világhoz",
                collection: existingCollection
            });
        }

        const availableCards = await db
            .select({
                normalCardId: worldAvailableCards.normalCardId,
                cardData: {
                    id: normalCards.id,
                    name: normalCards.name,
                    damage: normalCards.damage,
                    health: normalCards.health,
                    type: normalCards.type,
                    asciiArt: normalCards.asciiArt,
                    description: normalCards.description,
                }
            })
            .from(worldAvailableCards)
            .innerJoin(normalCards, eq(worldAvailableCards.normalCardId, normalCards.id))
            .where(
                and(
                    eq(worldAvailableCards.worldId, worldId),
                    eq(worldAvailableCards.isAvailable, true)
                )
            );

        if (availableCards.length === 0) {
            return NextResponse.json({
                error: "Nincsenek elérhető kártyák ehhez a világhoz"
            }, { status: 400 });
        }

        const playerCollectionData = availableCards.map(card => ({
            userId,
            worldId,
            normalCardId: card.normalCardId,
            currentDamage: card.cardData.damage,
            currentHealth: card.cardData.health,
        }));

        const result = await db
            .insert(playerWorldCollection)
            .values(playerCollectionData);

        return NextResponse.json({
            message: "Játékos kártyáinak gyűjteménye inicializálva!",
            cardsAdded: playerCollectionData.length,
            collection: playerCollectionData
        });

    } catch (error) {
        console.error("Error initializing player cards:", error);
        return NextResponse.json(
            { error: "Internal szerver hiba" },
            { status: 500 }
        );
    }
}
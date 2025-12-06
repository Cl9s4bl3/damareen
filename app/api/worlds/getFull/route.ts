import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
    worlds,
    normalCards,
    vezerCards,
    dungeons,
    dungeonTypes,
    worldAvailableCards,
    playerWorldCollection,
    dungeonNormalCards,
    dungeonVezerCards
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import {getCurrentUser} from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Érvénytelen hitelesítés" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const worldId = parseInt(searchParams.get('worldId') || '');

        const userId = parseInt(user.id);

        if (isNaN(worldId)) {
            return NextResponse.json({ error: "Érvénytelen worldId" }, { status: 400 });
        }

        const world = await db
            .select()
            .from(worlds)
            .where(eq(worlds.id, worldId))
            .then(rows => rows[0]);

        if (!world) {
            return NextResponse.json({ error: "Világ nem található" }, { status: 404 });
        }

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

        if (existingCollection.length === 0) {
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

            if (availableCards.length > 0) {
                const playerCollectionData = availableCards.map(card => ({
                    userId,
                    worldId,
                    normalCardId: card.normalCardId,
                    currentDamage: card.cardData.damage,
                    currentHealth: card.cardData.health,
                }));

                await db.insert(playerWorldCollection).values(playerCollectionData);
            }
        }

        const playerCards = await db
            .select({
                id: playerWorldCollection.id,
                currentDamage: playerWorldCollection.currentDamage,
                currentHealth: playerWorldCollection.currentHealth,
                normalCard: {
                    id: normalCards.id,
                    name: normalCards.name,
                    damage: normalCards.damage,
                    health: normalCards.health,
                    type: normalCards.type,
                    asciiArt: normalCards.asciiArt,
                    description: normalCards.description,
                }
            })
            .from(playerWorldCollection)
            .innerJoin(normalCards, eq(playerWorldCollection.normalCardId, normalCards.id))
            .where(
                and(
                    eq(playerWorldCollection.userId, userId),
                    eq(playerWorldCollection.worldId, worldId)
                )
            );

        const worldDungeons = await db
            .select({
                id: dungeons.id,
                name: dungeons.name,
                description: dungeons.description,
                isActive: dungeons.isActive,
                dungeonType: {
                    id: dungeonTypes.id,
                    name: dungeonTypes.name,
                    normalCardsCount: dungeonTypes.normalCardsCount,
                    vezerCardsCount: dungeonTypes.vezerCardsCount,
                    rewardDescription: dungeonTypes.rewardDescription,
                }
            })
            .from(dungeons)
            .innerJoin(dungeonTypes, eq(dungeons.typeId, dungeonTypes.id))
            .where(eq(dungeons.worldId, worldId));

        const dungeonNormalCardsData = await db
            .select({
                dungeonId: dungeonNormalCards.dungeonId,
                cardOrder: dungeonNormalCards.cardOrder,
                normalCard: {
                    id: normalCards.id,
                    name: normalCards.name,
                    damage: normalCards.damage,
                    health: normalCards.health,
                    type: normalCards.type,
                    asciiArt: normalCards.asciiArt,
                    description: normalCards.description,
                }
            })
            .from(dungeonNormalCards)
            .innerJoin(normalCards, eq(dungeonNormalCards.normalCardId, normalCards.id))
            .where(
                and(
                    eq(normalCards.worldId, worldId)
                )
            );

        const dungeonVezerCardsData = await db
            .select({
                dungeonId: dungeonVezerCards.dungeonId,
                cardOrder: dungeonVezerCards.cardOrder,
                vezerCard: {
                    id: vezerCards.id,
                    name: vezerCards.name,
                    damage: vezerCards.damage,
                    health: vezerCards.health,
                    type: vezerCards.type,
                    asciiArt: vezerCards.asciiArt,
                    description: vezerCards.description,
                    boostType: vezerCards.boostType,
                }
            })
            .from(dungeonVezerCards)
            .innerJoin(vezerCards, eq(dungeonVezerCards.vezerCardId, vezerCards.id))
            .where(
                and(
                    eq(vezerCards.worldId, worldId)
                )
            );

        const dungeonsWithCards = worldDungeons.map(dungeon => {
            const normalCardsForDungeon = dungeonNormalCardsData
                .filter(dnc => dnc.dungeonId === dungeon.id)
                .sort((a, b) => a.cardOrder - b.cardOrder)
                .map(dnc => ({
                    ...dnc.normalCard,
                    cardType: 'normal' as const,
                    order: dnc.cardOrder
                }));

            const vezerCardsForDungeon = dungeonVezerCardsData
                .filter(dvc => dvc.dungeonId === dungeon.id)
                .sort((a, b) => a.cardOrder - b.cardOrder)
                .map(dvc => ({
                    ...dvc.vezerCard,
                    cardType: 'vezer' as const,
                    order: dvc.cardOrder
                }));

            const allCards = [...normalCardsForDungeon, ...vezerCardsForDungeon]
                .sort((a, b) => a.order - b.order);

            return {
                ...dungeon,
                cards: allCards
            };
        });

        return NextResponse.json({
            world,
            playerCards,
            dungeons: dungeonsWithCards
        });

    } catch (error) {
        console.error("Error fetching world data:", error);
        return NextResponse.json(
            { error: "Internal szerver hiba" },
            { status: 500 }
        );
    }
}
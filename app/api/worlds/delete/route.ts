import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
    worlds,
    dungeons,
    normalCards,
    vezerCards,
    dungeonNormalCards,
    dungeonVezerCards,
    worldAvailableCards,
    playerWorldCollection,
    playerDecks,
    playerDeckCards
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

        const body = await req.json();
        const { worldId } = body;

        if (!worldId) {
            return NextResponse.json({ error: "Hiányzó worldId" }, { status: 400 });
        }

        const world = await db.select().from(worlds).where(eq(worlds.id, worldId)).then(r => r[0]);
        if (!world) return NextResponse.json({ error: "Világ nem található" }, { status: 404 });

        if (world.createdBy !== user.id) {
            return NextResponse.json({ error: "Megtiltott" }, { status: 403 });
        }

        const dungeonIds = (await db.select({ id: dungeons.id }).from(dungeons).where(eq(dungeons.worldId, worldId))).map(d => d.id);
        const normalCardIds = (await db.select({ id: normalCards.id }).from(normalCards).where(eq(normalCards.worldId, worldId))).map(c => c.id);
        const vezerCardIds = (await db.select({ id: vezerCards.id }).from(vezerCards).where(eq(vezerCards.worldId, worldId))).map(c => c.id);

        const playerCollectionIds = (
            await db
                .select({ id: playerWorldCollection.id })
                .from(playerWorldCollection)
                .where(eq(playerWorldCollection.worldId, worldId))
        ).map(p => p.id);

        const deckIds = (
            await db
                .select({ id: playerDecks.id })
                .from(playerDecks)
                .where(eq(playerDecks.worldId, worldId))
        ).map(d => d.id);

        await db.transaction(async (tx) => {

            if (dungeonIds.length > 0) {
                await tx.delete(dungeonNormalCards).where(inArray(dungeonNormalCards.dungeonId, dungeonIds));
                await tx.delete(dungeonVezerCards).where(inArray(dungeonVezerCards.dungeonId, dungeonIds));
            }

            if (playerCollectionIds.length > 0) {
                await tx.delete(playerDeckCards).where(inArray(playerDeckCards.playerCardId, playerCollectionIds));
            }
            if (deckIds.length > 0) {
                await tx.delete(playerDeckCards).where(inArray(playerDeckCards.deckId, deckIds));
            }

            if (playerCollectionIds.length > 0) {
                await tx.delete(playerWorldCollection).where(inArray(playerWorldCollection.id, playerCollectionIds));
            }

            if (deckIds.length > 0) {
                await tx.delete(playerDecks).where(inArray(playerDecks.id, deckIds));
            }

            await tx.delete(worldAvailableCards).where(eq(worldAvailableCards.worldId, worldId));

            if (vezerCardIds.length > 0) {
                await tx.delete(vezerCards).where(inArray(vezerCards.id, vezerCardIds));
            }
            if (normalCardIds.length > 0) {
                await tx.delete(normalCards).where(inArray(normalCards.id, normalCardIds));
            }

            if (dungeonIds.length > 0) {
                await tx.delete(dungeons).where(inArray(dungeons.id, dungeonIds));
            }

            await tx.delete(worlds).where(eq(worlds.id, worldId));
        });

        return NextResponse.json({ message: "Világ sikeresen törölve" });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal szerver hiba" }, { status: 500 });
    }
}

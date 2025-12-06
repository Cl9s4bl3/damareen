import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { playerWorldCollection, dungeons, dungeonTypes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });
        }

        const body = await request.json();
        const { cardId, dungeonId, worldId } = body;

        const userId = parseInt(user.id);

        if (!cardId || !dungeonId || !worldId) {
            return NextResponse.json({ error: "Érvénytelen mezők" }, { status: 400 });
        }

        const playerCard = await db
            .select()
            .from(playerWorldCollection)
            .where(
                and(
                    eq(playerWorldCollection.id, parseInt(cardId)),
                    eq(playerWorldCollection.userId, userId),
                    eq(playerWorldCollection.worldId, parseInt(worldId))
                )
            )
            .then(rows => rows[0]);

        if (!playerCard) {
            return NextResponse.json({ error: "Kártya nem található" }, { status: 404 });
        }

        const dungeon = await db
            .select({
                rewardType: dungeonTypes.rewardType
            })
            .from(dungeons)
            .innerJoin(dungeonTypes, eq(dungeons.typeId, dungeonTypes.id))
            .where(eq(dungeons.id, parseInt(dungeonId)))
            .then(rows => rows[0]);

        if (!dungeon) {
            return NextResponse.json({ error: "Kazamata nem található" }, { status: 404 });
        }

        let newDamage = playerCard.currentDamage;
        let newHealth = playerCard.currentHealth;

        switch (dungeon.rewardType) {
            case 'damage_plus_1':
                newDamage += 1;
                break;
            case 'health_plus_2':
                newHealth += 2;
                break;
            case 'damage_plus_3':
                newDamage += 3;
                break;
            default:
                return NextResponse.json({ error: "Érvénytelen reward típus" }, { status: 400 });
        }

        await db
            .update(playerWorldCollection)
            .set({
                currentDamage: newDamage,
                currentHealth: newHealth
            })
            .where(eq(playerWorldCollection.id, parseInt(cardId)));

        return NextResponse.json({
            success: true,
            message: "Sikeres kártyafejlesztés",
            card: {
                id: playerCard.id,
                newDamage,
                newHealth,
                damageIncrease: newDamage - playerCard.currentDamage,
                healthIncrease: newHealth - playerCard.currentHealth
            }
        });

    } catch (error) {
        console.error("Error upgrading card:", error);
        return NextResponse.json(
            { error: "Internal szerver hiba" },
            { status: 500 }
        );
    }
}
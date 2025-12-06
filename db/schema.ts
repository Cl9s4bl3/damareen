import {
    mysqlTable,
    int,
    varchar,
    text,
    boolean,
    timestamp,
    index
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: int("id").primaryKey().autoincrement(),
    username: varchar("username", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const worlds = mysqlTable("worlds", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    createdBy: int("created_by").references(() => users.id), // Készítő
    createdAt: timestamp("created_at").defaultNow().notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    bgStyle: varchar("bg_style", { length: 50 }).default("forest"),
});

export const normalCards = mysqlTable("normal_cards", {
    id: int("id").primaryKey().autoincrement(),
    worldId: int("world_id").references(() => worlds.id).notNull(),
    name: varchar("name", { length: 16 }).notNull(),
    damage: int("damage").notNull(),
    health: int("health").notNull(),
    type: varchar("type", { length: 10 }).notNull(),
    asciiArt: text("ascii_art").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        worldIdx: index("world_idx").on(table.worldId),
        nameIdx: index("name_idx").on(table.name),
    };
});

export const vezerCards = mysqlTable("vezer_cards", {
    id: int("id").primaryKey().autoincrement(),
    worldId: int("world_id").references(() => worlds.id).notNull(),
    baseCardId: int("base_card_id").references(() => normalCards.id).notNull(),
    name: varchar("name", { length: 16 }).notNull(),
    boostType: varchar("boost_type", { length: 20 }).notNull(),
    damage: int("damage").notNull(),
    health: int("health").notNull(),
    type: varchar("type", { length: 10 }).notNull(),
    asciiArt: text("ascii_art").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        worldIdx: index("vezer_world_idx").on(table.worldId),
        baseCardIdx: index("base_card_idx").on(table.baseCardId),
        nameIdx: index("vezer_name_idx").on(table.name),
    };
});

export const dungeonTypes = mysqlTable("dungeon_types", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 50 }).notNull(), // 'Egyszerű találkozás', 'Kis kazamata', 'Nagy kazamata'
    normalCardsCount: int("normal_cards_count").notNull(),
    vezerCardsCount: int("vezer_cards_count").notNull(),
    rewardType: varchar("reward_type", { length: 20 }).notNull(), // 'damage_plus_1', 'health_plus_2', 'damage_plus_3'
    rewardDescription: text("reward_description").notNull(),
});

export const dungeons = mysqlTable("dungeons", {
    id: int("id").primaryKey().autoincrement(),
    worldId: int("world_id").references(() => worlds.id).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    typeId: int("type_id").references(() => dungeonTypes.id).notNull(),
    description: text("description"),
    createdBy: int("created_by").references(() => users.id), // Készítő
    createdAt: timestamp("created_at").defaultNow().notNull(),
    isActive: boolean("is_active").default(true).notNull(),
}, (table) => {
    return {
        worldIdx: index("dungeon_world_idx").on(table.worldId),
        nameIdx: index("dungeon_name_idx").on(table.name),
    };
});

export const dungeonNormalCards = mysqlTable("dungeon_normal_cards", {
    id: int("id").primaryKey().autoincrement(),
    dungeonId: int("dungeon_id").references(() => dungeons.id).notNull(),
    normalCardId: int("normal_card_id").references(() => normalCards.id).notNull(),
    cardOrder: int("card_order").notNull(),
}, (table) => {
    return {
        dungeonIdx: index("dnc_dungeon_idx").on(table.dungeonId),
        cardIdx: index("dnc_card_idx").on(table.normalCardId),
        uniqueDungeonCard: index("unique_dungeon_card").on(table.dungeonId, table.normalCardId),
    };
});

export const dungeonVezerCards = mysqlTable("dungeon_vezer_cards", {
    id: int("id").primaryKey().autoincrement(),
    dungeonId: int("dungeon_id").references(() => dungeons.id).notNull(),
    vezerCardId: int("vezer_card_id").references(() => vezerCards.id).notNull(),
    cardOrder: int("card_order").notNull(),
}, (table) => {
    return {
        dungeonIdx: index("dvc_dungeon_idx").on(table.dungeonId),
        cardIdx: index("dvc_card_idx").on(table.vezerCardId),
        uniqueDungeonCard: index("unique_dungeon_vezer_card").on(table.dungeonId, table.vezerCardId),
    };
});

export const worldAvailableCards = mysqlTable("world_available_cards", {
    id: int("id").primaryKey().autoincrement(),
    worldId: int("world_id").references(() => worlds.id).notNull(),
    normalCardId: int("normal_card_id").references(() => normalCards.id).notNull(),
    isAvailable: boolean("is_available").default(true).notNull(),
    addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => {
    return {
        worldIdx: index("available_world_idx").on(table.worldId),
        cardIdx: index("available_card_idx").on(table.normalCardId),
        uniqueWorldCard: index("unique_world_card").on(table.worldId, table.normalCardId),
    };
});

export const playerWorldCollection = mysqlTable("player_world_collection", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").references(() => users.id).notNull(),
    worldId: int("world_id").references(() => worlds.id).notNull(),
    normalCardId: int("normal_card_id").references(() => normalCards.id).notNull(),
    currentDamage: int("current_damage").notNull(),
    currentHealth: int("current_health").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        userIdx: index("player_world_user_idx").on(table.userId),
        worldIdx: index("player_world_world_idx").on(table.worldId),
        cardIdx: index("player_world_card_idx").on(table.normalCardId),
        uniquePlayerWorldCard: index("unique_player_world_card").on(table.userId, table.worldId, table.normalCardId),
        playerWorldIdx: index("player_world_idx").on(table.userId, table.worldId),
    };
});

export const playerDecks = mysqlTable("player_decks", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").references(() => users.id).notNull(),
    worldId: int("world_id").references(() => worlds.id).notNull(),
    name: varchar("name", { length: 100 }).default("My Deck").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    isActive: boolean("is_active").default(true).notNull(),
}, (table) => {
    return {
        userIdx: index("deck_user_idx").on(table.userId),
        worldIdx: index("deck_world_idx").on(table.worldId),
        userWorldIdx: index("deck_user_world_idx").on(table.userId, table.worldId),
    };
});

export const playerDeckCards = mysqlTable("player_deck_cards", {
    id: int("id").primaryKey().autoincrement(),
    deckId: int("deck_id").references(() => playerDecks.id).notNull(),
    playerCardId: int("player_card_id").references(() => playerWorldCollection.id).notNull(),
    cardOrder: int("card_order").notNull(),
}, (table) => {
    return {
        deckIdx: index("deck_cards_deck_idx").on(table.deckId),
        playerCardIdx: index("deck_cards_player_card_idx").on(table.playerCardId),
        uniqueDeckOrder: index("unique_deck_order").on(table.deckId, table.cardOrder),
        uniqueDeckCard: index("unique_deck_card").on(table.deckId, table.playerCardId),
    };
});

// Nincs haszálva
export const initialDungeonTypes = [
    {
        name: 'Egyszerű találkozás',
        normalCardsCount: 1,
        vezerCardsCount: 0,
        rewardType: 'damage_plus_1',
        rewardDescription: '+1 sebzés a kiválasztott kártyára'
    },
    {
        name: 'Kis kazamata',
        normalCardsCount: 3,
        vezerCardsCount: 1,
        rewardType: 'health_plus_2',
        rewardDescription: '+2 életerő a kiválasztott kártyára'
    },
    {
        name: 'Nagy kazamata',
        normalCardsCount: 5,
        vezerCardsCount: 1,
        rewardType: 'damage_plus_3',
        rewardDescription: '+3 sebzés a kiválasztott kártyára'
    }
];

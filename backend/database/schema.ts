import { pgTable, bigserial, serial, bigint, integer, boolean, timestamp, foreignKey, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const games = pgTable("games", {
	id: serial().primaryKey(),
	dealerScore: integer("dealer_score").notNull(),
	nbPlayer: integer("nb_player").notNull(),
	createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const played = pgTable("played", {
	userId: bigint("user_id", { mode: 'number' }).notNull().references(() => users.id),
	gameId: integer("game_id").notNull().references(() => games.id),
	won: boolean().default(false).notNull(),
	playerScore: integer("player_score").notNull(),
	blackjack: boolean().default(false).notNull(),
}, (table) => [
	primaryKey({ columns: [table.userId, table.gameId], name: "played_pkey"}),
]);

export const users = pgTable("users", {
	id: bigserial({ mode: 'number' }).primaryKey(),
});

import { pgTable, serial, bigserial, bigint, integer, boolean, timestamp, foreignKey, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const bjGames = pgTable("bj_games", {
	id: serial().primaryKey(),
	dealerScore: integer("dealer_score").notNull(),
	nbPlayer: integer("nb_player").notNull(),
	createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const bjPlayed = pgTable("bj_played", {
	userId: bigint("user_id", { mode: 'number' }).notNull().references(() => bjUsers.id),
	gameId: integer("game_id").notNull().references(() => bjGames.id),
	won: boolean().default(false).notNull(),
	playerScore: integer("player_score").notNull(),
	blackjack: boolean().default(false).notNull(),
}, (table) => [
	primaryKey({ columns: [table.userId, table.gameId], name: "played_pkey"}),
]);

export const bjUsers = pgTable("bj_users", {
	id: bigserial({ mode: 'number' }).primaryKey(),
});

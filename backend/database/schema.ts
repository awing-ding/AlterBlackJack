import {
	pgTable,
	serial,
	bigserial,
	bigint,
	integer,
	boolean,
	timestamp,
	foreignKey,
	primaryKey,
	pgView,
    check
} from "drizzle-orm/pg-core"
import {eq, sql} from "drizzle-orm"

export const bjGames = pgTable("bj_games", {
	id: serial().primaryKey(),
	dealerScore: integer("dealer_score").notNull(),
	nbPlayer: integer("nb_player").notNull(),
	createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	check("dealer_score_check", sql`${table.dealerScore} BETWEEN 0 AND 31`),
	check("player_nb_check", sql`${table.nbPlayer} BETWEEN 1 AND 6`),
]
);

export const bjPlayed = pgTable("bj_played", {
	userId: bigint("user_id", { mode: 'number' }).notNull(),
	gameId: integer("game_id").notNull().references(() => bjGames.id),
	won: boolean().default(false).notNull(),
	playerScore: integer("player_score").notNull(),
	blackjack: boolean().default(false).notNull(),
}, (table) => [
	check("score_check", sql`${table.playerScore} BETWEEN 0 AND 31`),
	primaryKey({ columns: [table.userId, table.gameId], name: "played_pkey"}),
]);

export const bjStatsView = pgView("bj_stats_view").as((qb) => qb
	.select({
		userId: bjPlayed.userId.as("id"),
		minScore: (sql<number>`min(${bjPlayed.playerScore})`).as("minScore"),
		maxScore: (sql<number>`max(${bjPlayed.playerScore})`).as("maxScore"),
		avgScore: (sql<number>`avg(${bjPlayed.playerScore})`).as("avgScore"),
		totalGames: (sql<number>`count(*)`).as("totalGames"),
		nbBlackjack: (sql<number>`sum(case when ${bjPlayed.blackjack} then 1 else 0 end)`).as("nbBlackjack"),
		nbGagne: (sql<number>`sum(case when ${bjPlayed.won} then 1 else 0 end)`).as("nbGagne"),
		percentGagne: (sql<number>`(sum(case when ${bjPlayed.won} then 1 else 0 end)::float / count(*))`).as("percentGagne")
	}).from(bjPlayed).groupBy(bjPlayed.userId)
)

export const bjUsers = pgTable("bj_users", {
	id: bigserial({ mode: 'number' }).primaryKey(),
});

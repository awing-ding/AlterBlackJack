import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	bjGames: {
		bjUsers: r.many.bjUsers({
			from: r.bjGames.id.through(r.bjPlayed.gameId),
			to: r.bjPlayed.userId
		}),
	},
}))
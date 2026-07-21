import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	games: {
		users: r.many.users({
			from: r.games.id.through(r.played.gameId),
			to: r.users.id.through(r.played.userId)
		}),
	},
	users: {
		games: r.many.games(),
	},
}))
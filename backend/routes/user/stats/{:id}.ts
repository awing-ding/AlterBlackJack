import {db} from "../../../database/connexion";
import { Request, Response } from "express";
import {eq, sql} from "drizzle-orm"
import {validateId} from "../../../utility";
import {bjPlayed} from "../../../database/schema";

export async function get(req: Request, res: Response) {
    const id = validateId(req.params.id, res);
    if (!id) return;
    try{
        const stats = db
            .select({
                min_score: sql<number>`min(${bjPlayed.playerScore})`,
                max_score: sql<number>`max(${bjPlayed.playerScore})`,
                avg_score: sql<number>`avg(${bjPlayed.playerScore})`,
                total_games: sql<number>`count(*)`,
                nb_blackjack: sql<number>`sum(case when ${bjPlayed.blackjack} then 1 else 0 end)`,
                nb_gagne: sql<number>`sum(case when ${bjPlayed.won} then 1 else 0 end)`,
                percent_gagne: sql<number>`(sum(case when ${bjPlayed.won} then 1 else 0 end)::float / count(*))`
            })
            .from(bjPlayed)
            .where(eq(bjPlayed.userId, id));
        res.status(200).send(JSON.stringify(stats));
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
    }
}
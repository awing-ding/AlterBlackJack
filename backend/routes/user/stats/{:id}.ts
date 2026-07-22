import {db} from "@database/connexion";
import { Request, Response } from "express";
import {eq, sql} from "drizzle-orm"
import {validateId} from "@/utility";
import {bjStatsView} from "@database/schema";

export async function get(req: Request, res: Response) {
    const id = validateId(req.params.id, res);
    if (!id) return;
    try{
        const stats = await db
            .select()
            .from(bjStatsView)
            .where(eq(bjStatsView.userId, sql<number>`${id}::INTEGER`));
        console.log(stats);
        if (!stats) return res.status(404).send({error: "User Not Found"});
        res.status(200).send(JSON.stringify(stats));
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
    }
}
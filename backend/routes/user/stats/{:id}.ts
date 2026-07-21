import {db} from "../../../database/connexion.js";
import { Request, Response } from "express";
import {eq} from "drizzle-orm"
import {validateId} from "../../../utility.js";
import {bjStatsView} from "../../../database/schema.js";

export async function get(req: Request, res: Response) {
    const id = validateId(req.params.id, res);
    if (!id) return;
    try{
        const stats = db
            .select()
            .from(bjStatsView)
            .where(eq(bjStatsView.userId, id));
        res.status(200).send(JSON.stringify(stats));
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
    }
}
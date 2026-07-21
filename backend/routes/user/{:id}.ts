import {db} from "../../database/connexion";
import {Request, Response} from "express";
import {eq} from "drizzle-orm"
import * as db_schema from "../../database/schema"
import {validateId} from "../../utility";

export async function get(req: Request, res: Response){
    let id = validateId(req.params.id, res)
    if (!id) return;
    try {
        const history = await db.select().from(db_schema.users)
            .innerJoin(db_schema.played, eq(db_schema.played.userId, db_schema.users.id))
            .where(eq(db_schema.users.id, id))
        res.status(200).send(JSON.stringify(history));
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
    }
}

export async function post(req: Request, res: Response) {
    const id = validateId(req.params.id, res)
    if (!id) return;
    try {
        await db.insert(db_schema.users).values({id: id}).onConflictDoNothing();
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
        return;
    }
    res.status(200).send();
}

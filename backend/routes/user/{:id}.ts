import {db} from "../../database/connexion";
import {Request, Response} from "express";
import {eq} from "drizzle-orm"
import {bjPlayed, bjGames, bjUsers} from "../../database/schema"
import {validateId} from "../../utility";

export async function get(req: Request, res: Response){
    let id = validateId(req.params.id, res)
    if (!id) return;
    try {
        const history = await db.select().from(bjUsers)
            .innerJoin(bjPlayed, eq(bjPlayed.userId, bjUsers.id))
            .where(eq(bjUsers.id, id))
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
        await db.insert(bjUsers).values({id: id}).onConflictDoNothing();
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
        return;
    }
    res.status(200).send();
}

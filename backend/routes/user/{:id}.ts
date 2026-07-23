import {db} from "@database/connexion";
import {Request, Response} from "express";
import {eq} from "drizzle-orm"
import {bjPlayed} from "@database/schema"
import {validateId} from "@/utility";

export async function get(req: Request, res: Response){
    let id = validateId(req.params.id, res)
    if (!id) return;
    try {
        const history = await db.select().from(bjPlayed)
            .where(eq(bjPlayed.userId, BigInt(id)))
        if (!history) return res.status(404).send({error: "user not found"});
        res.status(200).send(JSON.stringify(history));
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
    }
}

export async function post(req: Request, res: Response) {
    console.warn("Call to disabled endpoint POST /user/:id");
    res.status(403).send({error: "endpoint disabled"});
}

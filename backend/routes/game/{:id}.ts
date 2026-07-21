import { Request, Response } from "express";
import {db} from "../../database/connexion";
import {eq} from "drizzle-orm"
import * as yup from "yup";
import * as db_schema from "../../database/schema"

export async function get(req: Request, res: Response) {
    const schema = yup.object({
        id: yup.number().min(1).required(),
    })
    try {
        await schema.validate(req.params)
    } catch (e) {
        console.error(e);
        res.status(400).send({error: "invalid id"});
        return;
    }
    const params = schema.cast(req.params);
    try {
        const game = await db.select().from(db_schema.games).where(eq(db_schema.games.id, params.id))
        res.status(200).send(JSON.stringify(game[0]));
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
    }
}

export async function post(req: Request, res: Response){
    const schema = yup.object({
        id: yup.number(),
        dealerScore: yup.number().required(),
        nbPlayers: yup.number().min(1).max(6).required(),
        created_at: yup.number().default(() => Date.now()),
        players: yup.array(yup.object({
            gameId: yup.number().default(0),
            userId: yup.number().min(1).required(),
            won: yup.boolean().required(),
            playerScore: yup.number().min(1).required(),
            blackjack: yup.boolean().default(false),
        })).required()
    })
    try {
        await schema.validate(req.params)
    } catch (e) {
        console.error(e);
        res.status(400).send({error: "Request malformed"});
    }
    const queryParams = schema.cast(req.params);
    try {
        const q = await db.insert(db_schema.games).values({
            dealerScore: queryParams.dealerScore,
            nbPlayer: queryParams.nbPlayers
        }).returning({id: db_schema.games.id});
        const id = q[0].id;
        const player_ids = queryParams.players.map(obj => ({id: obj.userId}));
        await db.insert(db_schema.users).values(player_ids).onConflictDoNothing();
        const played_data = queryParams.players.map(obj => {
            obj.gameId = id;
            return obj;
        })
        await db.insert(db_schema.played).values(played_data);
        res.status(200).send();
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
    }
}


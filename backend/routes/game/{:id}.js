import {pool} from "../../dist/database/connexion.cjs";

export async function get(req, res){
    let id = undefined;
    try {
        id = parseInt(req.params.id);
    } catch (e) {
        console.error(e);
        res.status(400).send({error: "invalid id"});
        return;
    }
    if (isNaN(id)){
        res.status(400).send({error: "invalid id"});
        return;
    }
    id = req.params.id;
    const client = await pool.connect();
    try {
        const game = await client.query("SELECT * FROM games WHERE id = $1", [id]);
        res.status(200).send(JSON.stringify(game.rows[0]));
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
    } finally {
        await client.release();
    }
}

export async function post(req, res){
    const gameObject = {
        id: undefined,
        dealer_score: req.body.dealer_score,
        nb_player: req.body.nb_player,
        created_at: Date.now(),
        players: []
    }
    for (const i of req.body.players){
        gameObject.players.push({
            user_id: i.user_id,
            won: i.won,
            player_score: i.player_score,
            blackjack: i.blackjack
        })
    }
    let id = undefined;

    const gameData = [
        gameObject.id,
        gameObject.dealer_score,
        gameObject.nb_player,
    ]
    const client = await pool.connect();
    try {
        id = await client.query("INSERT INTO games (dealer_score, nb_player) " +
            "VALUES ($1, $2) RETURNING id;", gameData.slice(1)
        );
        id = id.rows[0].id;
        for (const player of gameObject.players){
            await client.query("INSERT INTO users (id) VALUES ($1) ON CONFLICT DO NOTHING;", [player.user_id]);
            const data = [
                player.user_id,
                id,
                player.won,
                player.player_score,
                player.blackjack
            ]
            await client.query("INSERT INTO played (user_id, game_id, won, player_score, blackjack) VALUES ($1, $2, $3, $4, $5);", data)
        }
        res.status(200).send();
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
    } finally {
        await client.release();
    }
}


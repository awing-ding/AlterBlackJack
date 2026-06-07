import {pool} from "../../../dist/database/connexion.cjs";

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
    try{
        const sqlString = "SELECT MIN(player_score) AS min_score," +
            "MAX(player_score) AS max_score, " +
            "AVG(player_score) AS avg_score, " +
            "COUNT(*) AS total_games, " +
            "SUM(CASE WHEN blackjack THEN 1 ELSE 0 END) as nb_blackjack, " +
            "SUM(CASE WHEN won THEN 1 ELSE 0 END) as nb_gagne, " +
            "(SUM(CASE WHEN won THEN 1 ELSE 0 END) / COUNT(*)) as percent_gagne " +
            "FROM played WHERE user_id=$1;";
        const stats = await client.query(sqlString, [id]);
        res.status(200).send(JSON.stringify(stats.rows[0]));
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
    } finally {
        await client.release();
    }
}
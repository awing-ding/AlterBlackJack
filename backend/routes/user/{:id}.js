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
    const client = await pool.connect();
    try {
        const history = await client.query("SELECT * FROM users, played WHERE users.id = played.user_id AND users.id = $1", [id])
        res.status(200).send(JSON.stringify(history.rows));
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
    } finally {
        await client.release()
    }

}

export async function post(req, res) {
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
    const client = await pool.connect();
    try {
        await client.query("INSERT INTO users (id) values ($1) ON CONFLICT DO NOTHING;", [id])
    } catch (e) {
        console.error(e);
        res.status(500).send({error: "database error"});
        await client.release();
        return;
    }
    res.status(200).send();
}

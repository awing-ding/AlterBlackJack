import {Response} from "express";

export function validateId(id: string | string[], res: Response) {
    let ret = undefined
    try {
        if (typeof id === "string") {
            ret = parseInt(id);
        } else {
            console.error("id must be string: ", id);
            res.status(400).send({error: "id must be a string"});
            return;
        }
    } catch (e) {
        console.error(e);
        res.status(400).send({error: "invalid id"});
        return;
    }
    if (isNaN(ret)) {
        res.status(400).send({error: "invalid id"});
        return;
    }
    return ret;
}
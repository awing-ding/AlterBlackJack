import {Pool} from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export let pool = new Pool();

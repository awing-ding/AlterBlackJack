BEGIN;

CREATE TABLE IF NOT EXISTS users
(
    id
    BIGSERIAL
    PRIMARY
    KEY
);

CREATE TABLE IF NOT EXISTS games
(
    id
    SERIAL
    PRIMARY
    KEY,
    dealer_score
    INTEGER
    NOT
    NULL,
    nb_player
    INTEGER
    NOT
    NULL,
    created_at
    TIMESTAMP
    NOT
    NULL
    DEFAULT
    CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS played
(
    user_id
    BIGINT
    REFERENCES
    users
(
    id
),
    game_id INTEGER REFERENCES games
(
    id
),
    won BOOLEAN NOT NULL DEFAULT FALSE,
    player_score INTEGER NOT NULL,
    blackjack BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY
(
    user_id,
    game_id
)
    );
COMMIT;
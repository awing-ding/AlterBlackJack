-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "bj_games" (
	"id" serial,
	"dealer_score" integer NOT NULL,
	"nb_player" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "games_pkey" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "bj_played" (
	"user_id" bigint,
	"game_id" integer,
	"won" boolean DEFAULT false NOT NULL,
	"player_score" integer NOT NULL,
	"blackjack" boolean DEFAULT false NOT NULL,
	CONSTRAINT "played_pkey" PRIMARY KEY("user_id","game_id")
);
--> statement-breakpoint
CREATE TABLE "bj_users" (
	"id" bigserial,
	CONSTRAINT "users_pkey" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "bj_played" ADD CONSTRAINT "played_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "bj_games"("id");--> statement-breakpoint
ALTER TABLE "bj_played" ADD CONSTRAINT "played_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "bj_users"("id");
*/
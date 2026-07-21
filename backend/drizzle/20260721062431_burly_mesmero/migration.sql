-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "games" (
	"id" serial PRIMARY KEY,
	"dealer_score" integer NOT NULL,
	"nb_player" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "played" (
	"user_id" bigint,
	"game_id" integer,
	"won" boolean DEFAULT false NOT NULL,
	"player_score" integer NOT NULL,
	"blackjack" boolean DEFAULT false NOT NULL,
	CONSTRAINT "played_pkey" PRIMARY KEY("user_id","game_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY
);
--> statement-breakpoint
ALTER TABLE "played" ADD CONSTRAINT "played_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id");--> statement-breakpoint
ALTER TABLE "played" ADD CONSTRAINT "played_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");
*/
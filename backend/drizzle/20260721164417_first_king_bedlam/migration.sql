ALTER TABLE "bj_played" DROP CONSTRAINT "played_user_id_fkey";--> statement-breakpoint
ALTER TABLE "bj_played" RENAME CONSTRAINT "played_game_id_fkey" TO "bj_played_game_id_bj_games_id_fkey";--> statement-breakpoint
ALTER TABLE "bj_games" RENAME CONSTRAINT "games_pkey" TO "bj_games_pkey";--> statement-breakpoint
ALTER TABLE "bj_users" RENAME CONSTRAINT "users_pkey" TO "bj_users_pkey";--> statement-breakpoint
ALTER TABLE "bj_games" ADD CONSTRAINT "dealer_score_check" CHECK ("dealer_score" BETWEEN 0 AND 31);--> statement-breakpoint
ALTER TABLE "bj_games" ADD CONSTRAINT "player_nb_check" CHECK ("nb_player" BETWEEN 1 AND 6);--> statement-breakpoint
ALTER TABLE "bj_played" ADD CONSTRAINT "score_check" CHECK ("player_score" BETWEEN 0 AND 31);--> statement-breakpoint
CREATE VIEW "bj_stats_view" AS (select "user_id" as "id", min("player_score") as "minScore", max("player_score") as "maxScore", avg("player_score") as "avgScore", count(*) as "totalGames", sum(case when "blackjack" then 1 else 0 end) as "nbBlackjack", sum(case when "won" then 1 else 0 end) as "nbGagne", (sum(case when "won" then 1 else 0 end)::float / count(*)) as "percentGagne" from "bj_played" group by "bj_played"."user_id");
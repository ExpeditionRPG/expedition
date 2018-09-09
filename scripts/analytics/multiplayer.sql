/* Weekly multiplayer sessions */

SELECT date_trunc('week', created_at::date) AS weekly,
       COUNT(1)
FROM sessions
GROUP BY weekly
ORDER BY weekly;

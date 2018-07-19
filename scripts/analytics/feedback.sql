/* Feedback for a specific quest */

SELECT created, rating, text
FROM feedback
WHERE questid = '1pYQj-bnwXvV1Gam76GWvCcuF3hbPpwiO'
  AND text <> ''
ORDER BY created DESC;

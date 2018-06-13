/*
Points of interest:
- Quality control: Quests with unusually low finish ratios
- Quality Control: Quests with extreme avg and maximum playtimes compared to their metadata
- Interesting: Quests with unusually large standard deviations in playtime
- Interesting: Quests with unusually high rating count vs quest starts
- Interesting: Quests with unusually high number of repeat players (per-user finishes)

Questions and action items:
- What correlates with low finish ratios? Low ratings? Quest duration?
- Need to be able to measure how long people play a quest for (even if they
  don't get to a quest end event) to expand our understanding of user behavior
  and differentiate between casually checking vs not finishing after an hour.
- Are these metrics improving or getting worse over time?
- How do these metrics correlate with users coming back for more / continuing to play?
- We should also track quest complaints in the DB rather than throwing them over the wall
  as another quality signal.
- Review: what are the most common themes, words and phrases used in 1/2 star ratings
  vs 4/5 star ratings? (informs feedback tags)
    - we already know spelling / grammar is a huge one
- Eliminating noise:
  - Create a compiled / cleaned table that builds off the raw table
    to keep the raw data around but make it easier to run clean analysis
  - Not counting events from the quest's author (not hugely valuable for more popular quests)
  - Not counting rapidly duplicated events
    - start where another user+quest start happens again in <5 minutes
    - end where another user+quest end happened <5 minutes ago

As of June 9, 2018:
- Avg finish ratio across all quests was 0.36
  - Per-quest ranging 0.10 - 0.65
*/

/* QUESTS OVERVIEW */

SELECT * FROM (
  SELECT title,
    ratingavg,
    ratingcount,
    (
      SELECT count(*)
      FROM analyticsevents
      WHERE quest_id = Q.id
      AND category = 'quest'
      AND action = 'start'
    ) as QuestStarts,
    CAST((
      SELECT count(*) * 1.0
      FROM analyticsevents
      WHERE quest_id = Q.id
      AND category = 'quest'
      AND action = 'end'
    ) / (
      SELECT count(*)
      FROM analyticsevents
      WHERE quest_id = Q.id
      AND category = 'quest'
      AND action = 'start'
    ) as DECIMAL(4,2)) as FinishRatio
  FROM quests as Q
  WHERE partition = 'expedition-public'
  AND tombstone IS NULL
) as output
WHERE QuestStarts > 10
ORDER BY FinishRatio;

/* AVG FINISH RATIO ACROSS ALL QUESTS */

SELECT CAST(sum(ends)/sum(starts) as DECIMAL(4,2)) as AvgFinishRatio
FROM (
  SELECT (
      SELECT count(*)
      FROM analyticsevents
      WHERE quest_id = Q.id
      AND category = 'quest'
      AND action = 'start'
    ) as starts,
    (
      SELECT count(*) * 1.0
      FROM analyticsevents
      WHERE quest_id = Q.id
      AND category = 'quest'
      AND action = 'end'
    ) as ends
  FROM quests as Q
  WHERE partition = 'expedition-public'
  AND tombstone IS NULL
) as output;

/* AVG PLAY DURATION + STD DEV VS CLAIMED RANGE */

/* TODO: Challenge: matching user+quest starts to most recent end event,
  but capping the end search at the next start's time,
  and capping the value at (4 or 5 hours?) to avoid outlier skew */

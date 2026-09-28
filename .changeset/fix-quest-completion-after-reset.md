---
'poi-plugin-quest-info-2': patch
---

Fix quests being wrongly marked as "Already Completed": the completion status is no longer inferred from currently visible successor quests, which broke after periodical (daily / weekly / monthly) resets. Completion records are now timestamped and expire with the quest's own period, so a weekly prerequisite is no longer reported as completed after the weekly reset while its successors are still locked.

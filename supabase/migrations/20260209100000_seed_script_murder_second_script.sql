-- 劇本殺 30 項優化：第二支劇本「派對疑雲」（計劃 5.3 #24）
INSERT INTO public.scripts (id, title, slug, duration_min, min_players, max_players, is_18_plus)
VALUES (
  'a0e00002-0002-4000-8000-000000000002'::uuid,
  '派對疑雲',
  'party-mystery-02',
  25,
  4,
  8,
  false
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.script_chapters (id, script_id, chapter_index, title, content)
VALUES
  (gen_random_uuid(), 'a0e00002-0002-4000-8000-000000000002'::uuid, 0, '開場', '[{"type":"narrative","text":"派對中有人偷喝了主人的珍藏。大家輪流發言，找出誰是偷喝的人。"}]'),
  (gen_random_uuid(), 'a0e00002-0002-4000-8000-000000000002'::uuid, 1, '第一輪發言', '[{"type":"narrative","text":"每人說一句：你當時在做什麼？"}]'),
  (gen_random_uuid(), 'a0e00002-0002-4000-8000-000000002'::uuid, 2, '投票', '[{"type":"vote","prompt":"誰最可能是偷喝的人？","options":["玩家一","玩家二","玩家三","玩家四","跳過"],"resultAction":"得票最多者接受懲罰"}]'),
  (gen_random_uuid(), 'a0e00002-0002-4000-8000-000000002'::uuid, 3, '懲罰', '[{"type":"punishment","rule":"得票最多者喝兩口","detail":"或自訂：做一個大冒險"}]'),
  (gen_random_uuid(), 'a0e00002-0002-4000-8000-000000002'::uuid, 4, '結局', '[{"type":"narrative","text":"真相大白（或留到下一輪）。乾杯！"}]');

INSERT INTO public.script_roles (id, script_id, role_name, role_description, secret_clue)
VALUES
  (gen_random_uuid(), 'a0e00002-0002-4000-8000-000000000002'::uuid, '主人', '你知道酒放在哪裡', '你的珍藏被動過了。'),
  (gen_random_uuid(), 'a0e00002-0002-4000-8000-000000002'::uuid, '偷喝者', '你偷喝了一口', '別被投出去，裝無辜。'),
  (gen_random_uuid(), 'a0e00002-0002-4000-8000-000000002'::uuid, '目擊者', '你看見有人靠近酒櫃', '偷喝者穿深色衣服。'),
  (gen_random_uuid(), 'a0e00002-0002-4000-8000-000000002'::uuid, '無辜者', '你完全沒碰酒', '你是清白的。'),
  (gen_random_uuid(), 'a0e00002-0002-4000-8000-000000002'::uuid, '共犯', '你知道誰偷喝，但沒說', '目擊者可能指認你。');

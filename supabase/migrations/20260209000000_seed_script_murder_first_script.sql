-- 殺手功能 #13：第一支短劇本（約 20 分鐘）、章節含敘事/投票/懲罰節點、4 個角色
INSERT INTO public.scripts (id, title, slug, duration_min, min_players, max_players, is_18_plus)
VALUES (
  'a0e00001-0001-4000-8000-000000000001'::uuid,
  '酒局真相',
  'wine-truth-01',
  20,
  4,
  6,
  false
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.script_chapters (id, script_id, chapter_index, title, content)
VALUES
  (gen_random_uuid(), 'a0e00001-0001-4000-8000-000000000001'::uuid, 0, '開場', '{"type":"narrative","text":"今晚的派對，有人說謊、有人藏著秘密。請依照你的角色卡行動，找出誰在說謊。"}'),
  (gen_random_uuid(), 'a0e00001-0001-4000-8000-000000000001'::uuid, 1, '第一輪投票', '{"type":"vote","prompt":"誰最可能在說謊？","options":["玩家A","玩家B","玩家C","玩家D"],"resultAction":"得票最多者喝一口"}'),
  (gen_random_uuid(), 'a0e00001-0001-4000-8000-000000000001'::uuid, 2, '懲罰', '{"type":"punishment","rule":"得票最多者喝一口","detail":"可選：指定下一輪發問者"}');

INSERT INTO public.script_roles (id, script_id, role_name, role_description, secret_clue)
VALUES
  (gen_random_uuid(), 'a0e00001-0001-4000-8000-000000000001'::uuid, '偵探', '你可以多問一個問題', '今晚沒有人說真話。'),
  (gen_random_uuid(), 'a0e00001-0001-4000-8000-000000000001'::uuid, '說謊者', '你的其中一句必須是謊言', '你是說謊者，別被投出去。'),
  (gen_random_uuid(), 'a0e00001-0001-4000-8000-000000000001'::uuid, '平民', '如實回答即可', '偵探在找說謊者。'),
  (gen_random_uuid(), 'a0e00001-0001-4000-8000-000000000001'::uuid, '酒保', '你可以指定一個人喝半口', '說謊者最怕被灌醉。');
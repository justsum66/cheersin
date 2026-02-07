#!/usr/bin/env node
/**
 * 一鍵執行：link → db push → functions deploy
 * 使用前（二選一）：
 *   A) 終端執行一次：supabase login
 *      再在 .env.local 設定：SUPABASE_DB_PASSWORD=你的資料庫密碼
 *   B) 在 .env.local 設定：SUPABASE_ACCESS_TOKEN=... 與 SUPABASE_DB_PASSWORD=...
 * 執行：npm run supabase:deploy
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const projectRef = 'etrqxhpbhimrkcyolbrr';

function run(cmd, env = {}) {
  const fullEnv = { ...process.env, ...env };
  try {
    execSync(cmd, { cwd: root, stdio: 'inherit', env: fullEnv });
    return true;
  } catch (e) {
    return false;
  }
}

// 從 .env.local 讀取（不覆蓋 process.env 已有值）
function loadEnvLocal() {
  try {
    const content = readFileSync(join(root, '.env.local'), 'utf8');
    const env = {};
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
    return env;
  } catch {
    return {};
  }
}

const envLocal = loadEnvLocal();
const dbPassword = process.env.SUPABASE_DB_PASSWORD ?? envLocal.SUPABASE_DB_PASSWORD;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN ?? envLocal.SUPABASE_ACCESS_TOKEN;

console.log('Step 1: supabase link (skip if already linked)');
const linkOk = dbPassword
  ? run(`npx supabase link --project-ref ${projectRef}`, { SUPABASE_DB_PASSWORD: dbPassword })
  : run(`npx supabase link --project-ref ${projectRef}`);
if (!linkOk) {
  console.error('\n[Link 失敗] 帳號可能無此專案存取權限（necessary privileges）。');
  console.error('→ 請用「專案 Owner」帳號執行 supabase login，或改用手動套用 migrations：');
  console.error('  開啟 Supabase Dashboard → SQL Editor，貼上並執行：');
  console.error('  supabase/migrations/RUN_ALL_IN_DASHBOARD.sql');
  console.error('→ Edge Function 需用有權限的帳號執行：npm run supabase:functions:deploy');
  process.exit(1);
}

console.log('\nStep 2: supabase db push');
if (!run('npx supabase db push')) {
  console.error('\n[db push 失敗] 檢查上方錯誤');
  process.exit(1);
}

console.log('\nStep 3: supabase functions deploy cleanup-expired-rooms');
const deployEnv = accessToken ? { SUPABASE_ACCESS_TOKEN: accessToken } : {};
if (!run(`npx supabase functions deploy cleanup-expired-rooms --project-ref ${projectRef}`, deployEnv)) {
  console.error('\n[Deploy 失敗] 請先執行 supabase login 或設定 SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

console.log('\nDone. 請到 Dashboard 為 cleanup-expired-rooms 設定 cron: 0 * * * *');

/**
 * cleanup-expired-rooms
 * 每小時清理過期房間：刪除 game_rooms 中 expires_at IS NOT NULL AND expires_at < NOW() 的紀錄
 * P3-36：僅刪有設過期時間的房間，永不過期（expires_at NULL）不受影響
 * P1-16：game_room_players、game_states 已有 ON DELETE CASCADE，僅刪 game_rooms 即可
 * 建議以 cron 每小時觸發：0 * * * *
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const client = createClient(supabaseUrl, supabaseServiceKey);

    const { data: expired, error: selectError } = await client
      .from("game_rooms")
      .select("id")
      .not("expires_at", "is", null)
      .lt("expires_at", new Date().toISOString());

    if (selectError) {
      return new Response(
        JSON.stringify({ error: selectError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ids = (expired ?? []).map((r) => r.id);
    if (ids.length === 0) {
      return new Response(
        JSON.stringify({ deleted: 0, message: "No expired rooms" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: deleteError } = await client
      .from("game_rooms")
      .delete()
      .in("id", ids);

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ deleted: ids.length, ids }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

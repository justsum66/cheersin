-- P3-53：game_states.updated_at 由 DB 觸發更新，應用層可不傳
CREATE OR REPLACE FUNCTION public.set_game_states_updated_at()
RETURN TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS game_states_updated_at ON public.game_states;
CREATE TRIGGER game_states_updated_at
  BEFORE UPDATE ON public.game_states
  FOR EACH ROW
  EXECUTE FUNCTION public.set_game_states_updated_at();

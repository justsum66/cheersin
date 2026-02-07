-- Fix: add subscription_tier to profiles if table exists but column is missing
-- Run this in Supabase SQL Editor if you get: column "subscription_tier" does not exist

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'subscription_tier')
  THEN
    ALTER TABLE public.profiles
      ADD COLUMN subscription_tier TEXT DEFAULT 'free';
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_subscription_tier_check
      CHECK (subscription_tier IN ('free', 'basic', 'premium'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_tier);

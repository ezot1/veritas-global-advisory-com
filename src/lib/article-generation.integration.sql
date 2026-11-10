-- Run against the application database; all state and the test article roll back.
BEGIN;
SELECT id FROM public.article_rotation_state WHERE id = 1 FOR UPDATE;
DO $$
DECLARE t uuid := gen_random_uuid(); other_t uuid := gen_random_uuid(); result integer;
BEGIN
  UPDATE public.article_rotation_state SET paused_reason='Review required', lease_token=NULL, lease_until=NULL WHERE id=1;
  IF public.claim_article_generation(t, false, false) IS NOT NULL THEN RAISE EXCEPTION 'Paused schedule ran'; END IF;
  IF public.claim_article_generation(t, true, false) IS NOT NULL THEN RAISE EXCEPTION 'Unapproved retry ran'; END IF;
  IF public.claim_article_generation(t, true, true) IS NULL THEN RAISE EXCEPTION 'Approved retry blocked'; END IF;
  IF public.claim_article_generation(other_t, true, true) IS NOT NULL THEN RAISE EXCEPTION 'Overlapping retry ran'; END IF;
  IF (SELECT paused_reason IS NULL FROM public.article_rotation_state WHERE id=1) THEN RAISE EXCEPTION 'Pause cleared before success'; END IF;
  PERFORM public.fail_article_generation(t, 'Review required');
  IF (SELECT paused_reason FROM public.article_rotation_state WHERE id=1) <> 'Review required' THEN RAISE EXCEPTION 'Failure lost pause'; END IF;
  result := public.claim_article_generation(t, true, true);
  IF NOT public.complete_article_generation(t, jsonb_build_object('slug','test-'||t::text,'continent','Europe','tag','Test','region','Europe','title','Rollback test','summary','Test','body',jsonb_build_array('Test'),'author','Test','image_url','https://example.org/test.jpg','published_date','Nov 10, 2026')) THEN RAISE EXCEPTION 'Recovery publication failed'; END IF;
  IF (SELECT paused_reason IS NOT NULL FROM public.article_rotation_state WHERE id=1) THEN RAISE EXCEPTION 'Success did not resume'; END IF;
  UPDATE public.article_rotation_state SET last_run_at=now()-interval '14 days'+interval '5 minutes' WHERE id=1;
  IF public.claim_article_generation(t, false, false) IS NOT NULL THEN RAISE EXCEPTION 'Ran before fourteen days'; END IF;
  UPDATE public.article_rotation_state SET last_run_at=now()-interval '14 days' WHERE id=1;
  IF public.claim_article_generation(t, false, false) IS NULL THEN RAISE EXCEPTION 'Blocked at fourteen days'; END IF;
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname='generate-continental-article' AND schedule='0 10 * * *' AND active) THEN RAISE EXCEPTION 'Daily due-date check missing'; END IF;
END $$;
ROLLBACK;
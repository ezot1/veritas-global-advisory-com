CREATE OR REPLACE FUNCTION public.claim_article_generation(p_token uuid, p_manual boolean DEFAULT false, p_resume boolean DEFAULT false) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_index integer;
BEGIN
 UPDATE public.article_rotation_state SET lease_token=p_token, lease_until=now()+interval '20 minutes'
 WHERE id=1 AND (paused_reason IS NULL OR (p_manual AND p_resume)) AND (lease_until IS NULL OR lease_until<now()) AND (p_manual OR last_run_at IS NULL OR last_run_at <= now()-interval '14 days') RETURNING next_index INTO v_index;
 RETURN v_index;
END; $$;
-- Keep the deployed two-argument entry point guarded until the updated app is published.
CREATE OR REPLACE FUNCTION public.claim_article_generation(p_token uuid, p_manual boolean DEFAULT false) RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
 SELECT public.claim_article_generation(p_token, p_manual, false);
$$;
CREATE OR REPLACE FUNCTION public.complete_article_generation(p_token uuid, p_article jsonb) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 PERFORM 1 FROM public.article_rotation_state WHERE id=1 AND lease_token=p_token FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 INSERT INTO public.generated_articles (slug,continent,tag,region,title,summary,body,author,image_url,published_date) VALUES (p_article->>'slug',p_article->>'continent',p_article->>'tag',p_article->>'region',p_article->>'title',p_article->>'summary',p_article->'body',p_article->>'author',p_article->>'image_url',p_article->>'published_date');
 UPDATE public.article_rotation_state SET next_index=next_index+1,last_run_at=now(),lease_token=NULL,lease_until=NULL,paused_reason=NULL WHERE id=1;
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.claim_article_generation(uuid,boolean,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_article_generation(uuid,boolean,boolean) TO service_role;
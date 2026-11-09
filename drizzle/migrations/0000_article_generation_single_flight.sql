ALTER TABLE public.article_rotation_state ADD COLUMN IF NOT EXISTS lease_token uuid, ADD COLUMN IF NOT EXISTS lease_until timestamptz, ADD COLUMN IF NOT EXISTS paused_reason text;
CREATE OR REPLACE FUNCTION public.claim_article_generation(p_token uuid, p_manual boolean DEFAULT false) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_index integer;
BEGIN
 UPDATE public.article_rotation_state SET lease_token=p_token, lease_until=now()+interval '20 minutes'
 WHERE id=1 AND paused_reason IS NULL AND (lease_until IS NULL OR lease_until<now()) AND (p_manual OR last_run_at IS NULL OR last_run_at <= now()-interval '14 days') RETURNING next_index INTO v_index;
 RETURN v_index;
END; $$;
CREATE OR REPLACE FUNCTION public.complete_article_generation(p_token uuid, p_article jsonb) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 PERFORM 1 FROM public.article_rotation_state WHERE id=1 AND lease_token=p_token FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 INSERT INTO public.generated_articles (slug,continent,tag,region,title,summary,body,author,image_url,published_date) VALUES (p_article->>'slug',p_article->>'continent',p_article->>'tag',p_article->>'region',p_article->>'title',p_article->>'summary',p_article->'body',p_article->>'author',p_article->>'image_url',p_article->>'published_date');
 UPDATE public.article_rotation_state SET next_index=next_index+1,last_run_at=now(),lease_token=NULL,lease_until=NULL WHERE id=1;
 RETURN true;
END; $$;
CREATE OR REPLACE FUNCTION public.fail_article_generation(p_token uuid, p_reason text DEFAULT NULL) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
 UPDATE public.article_rotation_state SET lease_token=NULL,lease_until=NULL,paused_reason=p_reason WHERE id=1 AND lease_token=p_token;
$$;
REVOKE ALL ON FUNCTION public.claim_article_generation(uuid,boolean),public.complete_article_generation(uuid,jsonb),public.fail_article_generation(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_article_generation(uuid,boolean),public.complete_article_generation(uuid,jsonb),public.fail_article_generation(uuid,text) TO service_role;
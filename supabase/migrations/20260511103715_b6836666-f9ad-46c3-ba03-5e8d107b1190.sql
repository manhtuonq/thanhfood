
-- Tracking page visits
CREATE TABLE IF NOT EXISTS public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  user_agent text,
  device text,
  browser text,
  os text,
  visitor_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_page_visits_created ON public.page_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor ON public.page_visits(visitor_id);

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anon) to insert a visit
CREATE POLICY page_visits_insert_any ON public.page_visits
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admin can read
CREATE POLICY page_visits_admin_read ON public.page_visits
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY page_visits_admin_delete ON public.page_visits
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

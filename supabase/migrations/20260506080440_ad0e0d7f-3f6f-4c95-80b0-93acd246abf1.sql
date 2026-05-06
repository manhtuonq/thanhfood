
-- Lock down search_path on touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Revoke broad EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Restrict storage listing: only admins can list, but file URLs remain public
DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_admin_list" ON storage.objects FOR SELECT USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));

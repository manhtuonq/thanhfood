import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const KEYS = ["owner", "branding", "footer", "socials"] as const;

export default function AdminSettings() {
  const qc = useQueryClient();
  const [v, setV] = useState<Record<string, any>>({ owner: {}, branding: {}, footer: {}, socials: {} });

  const { data } = useQuery({
    queryKey: ["site_settings_admin"],
    queryFn: async () => (await supabase.from("site_settings").select("*")).data || [],
  });

  useEffect(() => {
    if (data) {
      const m: any = { owner: {}, branding: {}, footer: {}, socials: {} };
      data.forEach((r: any) => { m[r.key] = r.value; });
      m.branding.banner_urls = m.branding.banner_urls || [];
      setV(m);
    }
  }, [data]);

  const upload = async (file: File): Promise<string | null> => {
    const path = `settings/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast.error(error.message); return null; }
    return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  };

  const save = async (key: string) => {
    const { error } = await supabase.from("site_settings").upsert({ key, value: v[key] });
    if (error) toast.error(error.message);
    else { toast.success("Đã lưu"); qc.invalidateQueries({ queryKey: ["site_settings"] }); qc.invalidateQueries({ queryKey: ["site_settings_admin"] }); }
  };

  const onLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await upload(f); if (url) setV({ ...v, branding: { ...v.branding, logo_url: url } });
  };
  const onBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls: string[] = [];
    for (const f of files) { const u = await upload(f); if (u) urls.push(u); }
    setV({ ...v, branding: { ...v.branding, banner_urls: [...(v.branding.banner_urls || []), ...urls] } });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold mb-6">Cài đặt</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* OWNER */}
        <Section title="Thông tin chủ sở hữu" onSave={() => save("owner")}>
          {[
            ["name", "Tên doanh nghiệp"], ["email", "Email"], ["phone", "Số điện thoại"],
            ["address", "Địa chỉ"], ["working_hours", "Giờ làm việc"],
          ].map(([k, l]) => (
            <Field key={k} label={l}>
              <input value={v.owner?.[k] || ""} onChange={(e) => setV({ ...v, owner: { ...v.owner, [k]: e.target.value } })} className="w-full border-2 rounded-lg px-3 py-2" />
            </Field>
          ))}
        </Section>

        {/* BRANDING */}
        <Section title="Logo & Banner" onSave={() => save("branding")}>
          <Field label="Logo">
            <div className="flex items-center gap-3">
              {v.branding?.logo_url && <img src={v.branding.logo_url} className="w-16 h-16 object-contain border rounded-lg" />}
              <input type="file" accept="image/*" onChange={onLogo} className="text-sm" />
            </div>
          </Field>
          <Field label="Banner trang chủ">
            <input type="file" accept="image/*" multiple onChange={onBanner} className="text-sm mb-2" />
            <div className="grid grid-cols-3 gap-2">
              {(v.branding?.banner_urls || []).map((u: string, i: number) => (
                <div key={i} className="relative group">
                  <img src={u} className="w-full aspect-video object-cover rounded-lg" />
                  <button type="button" onClick={() => setV({ ...v, branding: { ...v.branding, banner_urls: v.branding.banner_urls.filter((_: any, j: number) => j !== i) } })} className="absolute top-1 right-1 bg-destructive text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100">×</button>
                </div>
              ))}
            </div>
          </Field>
          <Field label="Tiêu đề website (SEO)"><input value={v.branding?.site_title || ""} onChange={(e) => setV({ ...v, branding: { ...v.branding, site_title: e.target.value } })} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
          <Field label="Mô tả website (SEO)"><textarea value={v.branding?.site_description || ""} onChange={(e) => setV({ ...v, branding: { ...v.branding, site_description: e.target.value } })} rows={2} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
        </Section>

        {/* FOOTER */}
        <Section title="Footer" onSave={() => save("footer")}>
          <Field label="Giới thiệu ngắn"><textarea value={v.footer?.about || ""} onChange={(e) => setV({ ...v, footer: { ...v.footer, about: e.target.value } })} rows={3} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
          <Field label="Copyright"><input value={v.footer?.copyright || ""} onChange={(e) => setV({ ...v, footer: { ...v.footer, copyright: e.target.value } })} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
        </Section>

        {/* SOCIALS */}
        <Section title="Mạng xã hội" onSave={() => save("socials")}>
          {[
            ["facebook", "fa-facebook-f", "Facebook"],
            ["tiktok", "fa-tiktok", "TikTok"],
            ["instagram", "fa-instagram", "Instagram"],
            ["youtube", "fa-youtube", "YouTube"],
            ["zalo", "fa-comment-dots", "Zalo"],
            ["messenger", "fa-facebook-messenger", "Messenger"],
          ].map(([k, ic, l]) => (
            <Field key={k} label={<span><i className={`fa-brands ${ic} mr-2 text-[hsl(var(--teal-mid))]`} /> {l}</span>}>
              <input value={v.socials?.[k] || ""} onChange={(e) => setV({ ...v, socials: { ...v.socials, [k]: e.target.value } })} placeholder="https://..." className="w-full border-2 rounded-lg px-3 py-2" />
            </Field>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, onSave, children }: { title: string; onSave: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg">{title}</h3>
        <button onClick={onSave} className="bg-gradient-brand text-white px-4 py-2 rounded-lg font-bold text-sm hover:shadow-glow">Lưu</button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-semibold block mb-1">{label}</span>{children}</label>;
}

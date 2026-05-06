import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { slugify } from "@/lib/seo";
import ImageDropzone from "@/components/admin/ImageDropzone";

type FormState = {
  name: string; slug: string; short_description: string; description: string;
  cover_image: string; gallery: string[]; category_id: string;
  origin: string; weight: string; storage: string;
  price: string; price_old: string; is_hot: boolean; is_visible: boolean;
  meta_title: string; meta_description: string; meta_keywords: string;
  og_image: string; canonical_url: string;
};

const empty: FormState = {
  name: "", slug: "", short_description: "", description: "",
  cover_image: "", gallery: [], category_id: "",
  origin: "", weight: "", storage: "-18°C",
  price: "Liên hệ Zalo", price_old: "", is_hot: false, is_visible: true,
  meta_title: "", meta_description: "", meta_keywords: "",
  og_image: "", canonical_url: "",
};

export default function AdminProductEdit() {
  const { id } = useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const [f, setF] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const { data: cats } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data || [],
  });

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id!).maybeSingle();
      if (error) { toast.error(error.message); return; }
      if (data) {
        // Normalize all nullable text fields to empty strings to avoid `.length` on null
        const normalize = (v: any) => (v === null || v === undefined ? "" : v);
        setF({
          ...empty,
          name: normalize(data.name),
          slug: normalize(data.slug),
          short_description: normalize(data.short_description),
          description: normalize(data.description),
          cover_image: normalize(data.cover_image),
          gallery: Array.isArray(data.gallery) ? (data.gallery as string[]) : [],
          category_id: normalize(data.category_id),
          origin: normalize(data.origin),
          weight: normalize(data.weight),
          storage: normalize(data.storage),
          price: normalize(data.price),
          price_old: normalize(data.price_old),
          is_hot: !!data.is_hot,
          is_visible: !!data.is_visible,
          meta_title: normalize(data.meta_title),
          meta_description: normalize(data.meta_description),
          meta_keywords: normalize(data.meta_keywords),
          og_image: normalize(data.og_image),
          canonical_url: normalize(data.canonical_url),
        });
      }
    })();
  }, [id, isNew]);

  const upload = async (file: File): Promise<string | null> => {
    const path = `products/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); return null; }
    return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  };

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const onCoverFiles = async (files: File[]) => {
    setUploadingCover(true);
    const url = await upload(files[0]);
    if (url) setF((p) => ({ ...p, cover_image: url }));
    setUploadingCover(false);
  };
  const onGalleryFiles = async (files: File[]) => {
    setUploadingGallery(true);
    const urls: string[] = [];
    for (const file of files) { const u = await upload(file); if (u) urls.push(u); }
    setF((p) => ({ ...p, gallery: [...p.gallery, ...urls] }));
    setUploadingGallery(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...f,
      slug: f.slug || slugify(f.name),
      category_id: f.category_id || null,
      gallery: f.gallery,
    };
    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", id!);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Đã lưu");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    nav("/admin/products");
  };

  // SEO score (simple heuristic)
  const seoScore = computeScore(f);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-extrabold">{isNew ? "Thêm" : "Sửa"} sản phẩm</h1>
        <Link to="/admin/products" className="text-sm text-muted-foreground hover:underline"><i className="fa-solid fa-arrow-left mr-1" /> Quay lại</Link>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-5">
          <Card title="Thông tin chính">
            <Field label="Tên sản phẩm *"><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value, slug: isNew && !f.slug ? slugify(e.target.value) : f.slug })} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
            <Field label="Slug *"><input required value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 font-mono text-sm" /></Field>
            <Field label="Mô tả ngắn"><input value={f.short_description} onChange={(e) => setF({ ...f, short_description: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
            <Field label="Mô tả chi tiết"><textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={6} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
          </Card>

          <Card title="Hình ảnh">
            <Field label="Ảnh đại diện">
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-3 items-start">
                <div className="aspect-square rounded-xl overflow-hidden bg-[hsl(var(--green-pale))] grid place-items-center border-2 border-[hsl(var(--green-pale))]">
                  {f.cover_image ? (
                    <img src={f.cover_image} className="w-full h-full object-cover" alt="cover" />
                  ) : (
                    <i className="fa-solid fa-image text-4xl text-[hsl(var(--green-mid))]/40" />
                  )}
                </div>
                <div className="space-y-2">
                  <ImageDropzone onFiles={onCoverFiles} uploading={uploadingCover} hint="JPG/PNG/WebP — khuyến nghị 800x600" />
                  {f.cover_image && (
                    <button type="button" onClick={() => setF({ ...f, cover_image: "" })} className="text-xs text-destructive hover:underline">
                      <i className="fa-solid fa-trash mr-1" /> Xoá ảnh đại diện
                    </button>
                  )}
                </div>
              </div>
            </Field>
            <Field label="Album ảnh">
              <ImageDropzone multiple onFiles={onGalleryFiles} uploading={uploadingGallery} hint="Có thể chọn nhiều ảnh cùng lúc" />
              {f.gallery.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
                  {f.gallery.map((u, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-[hsl(var(--green-pale))]">
                      <img src={u} className="w-full aspect-square object-cover" alt={`gallery-${i}`} />
                      <button type="button" onClick={() => setF({ ...f, gallery: f.gallery.filter((_, j) => j !== i) })} className="absolute top-1 right-1 bg-destructive text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Field>
          </Card>

          <Card title="Phân loại & Giá">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Danh mục">
                <select value={f.category_id} onChange={(e) => setF({ ...f, category_id: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2">
                  <option value="">— Chưa phân loại —</option>
                  {cats?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Xuất xứ"><input value={f.origin} onChange={(e) => setF({ ...f, origin: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
              <Field label="Khối lượng"><input value={f.weight} onChange={(e) => setF({ ...f, weight: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
              <Field label="Bảo quản"><input value={f.storage} onChange={(e) => setF({ ...f, storage: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
              <Field label="Giá"><input value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
              <Field label="Giá cũ"><input value={f.price_old} onChange={(e) => setF({ ...f, price_old: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
            </div>
          </Card>

          <Card title="SEO chuẩn 100%">
            <div className="mb-4 p-4 rounded-lg bg-[hsl(var(--green-pale))]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">Điểm SEO</span>
                <span className={`font-extrabold text-2xl ${seoScore.score >= 80 ? "text-[hsl(var(--green-dark))]" : seoScore.score >= 50 ? "text-[hsl(var(--yellow-accent))]" : "text-destructive"}`}>{seoScore.score}/100</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-gradient-brand transition-all" style={{ width: `${seoScore.score}%` }} />
              </div>
              <ul className="mt-3 text-xs space-y-1">
                {seoScore.checks.map((c, i) => (
                  <li key={i} className={c.ok ? "text-[hsl(var(--green-dark))]" : "text-muted-foreground"}>
                    <i className={`fa-solid ${c.ok ? "fa-check" : "fa-circle"} mr-1.5`} /> {c.label}
                  </li>
                ))}
              </ul>
            </div>
            <Field label={`Meta Title (${f.meta_title.length}/60)`}>
              <input value={f.meta_title} onChange={(e) => setF({ ...f, meta_title: e.target.value })} maxLength={70} className="w-full border-2 rounded-lg px-3 py-2" />
            </Field>
            <Field label={`Meta Description (${f.meta_description.length}/160)`}>
              <textarea value={f.meta_description} onChange={(e) => setF({ ...f, meta_description: e.target.value })} rows={2} maxLength={170} className="w-full border-2 rounded-lg px-3 py-2" />
            </Field>
            <Field label="Từ khoá (cách nhau dấu phẩy)"><input value={f.meta_keywords} onChange={(e) => setF({ ...f, meta_keywords: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
            <Field label="OG Image URL"><input value={f.og_image} onChange={(e) => setF({ ...f, og_image: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
            <Field label="Canonical URL"><input value={f.canonical_url} onChange={(e) => setF({ ...f, canonical_url: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
            {/* Google preview */}
            <div className="mt-4 p-4 border rounded-lg bg-white">
              <div className="text-xs text-muted-foreground mb-1">Xem trước Google</div>
              <div className="text-blue-700 text-base font-medium truncate">{f.meta_title || f.name || "Tiêu đề sản phẩm"}</div>
              <div className="text-green-700 text-xs">{f.canonical_url || `${typeof window !== 'undefined' ? window.location.origin : ''}/san-pham/${f.slug || "slug"}`}</div>
              <div className="text-xs text-gray-700 line-clamp-2 mt-1">{f.meta_description || f.short_description || "Mô tả meta sẽ xuất hiện ở đây."}</div>
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Trạng thái">
            <Toggle label="Hiển thị ra trang chủ" checked={f.is_visible} onChange={(v) => setF({ ...f, is_visible: v })} />
            <Toggle label="Đánh dấu Bán chạy" checked={f.is_hot} onChange={(v) => setF({ ...f, is_hot: v })} />
            <button disabled={saving} className="w-full bg-gradient-brand text-white rounded-lg py-3 font-bold mt-4 hover:shadow-glow disabled:opacity-50">
              {saving ? "Đang lưu..." : isNew ? "Đăng bài" : "Cập nhật"}
            </button>
          </Card>
        </aside>
      </form>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-5">
      <h3 className="font-display font-bold text-lg mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-semibold block mb-1">{label}</span>{children}</label>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-2">
      <span className="text-sm font-semibold">{label}</span>
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-[hsl(var(--green-mid))] relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
    </label>
  );
}

function computeScore(f: FormState) {
  const checks = [
    { ok: f.name.length >= 10 && f.name.length <= 70, label: "Tên 10-70 ký tự" },
    { ok: !!f.slug && /^[a-z0-9-]+$/.test(f.slug), label: "Slug hợp lệ (chữ thường, số, gạch ngang)" },
    { ok: f.meta_title.length >= 30 && f.meta_title.length <= 60, label: "Meta title 30-60 ký tự" },
    { ok: f.meta_description.length >= 120 && f.meta_description.length <= 160, label: "Meta description 120-160 ký tự" },
    { ok: !!f.meta_keywords, label: "Có từ khoá" },
    { ok: !!f.cover_image, label: "Có ảnh đại diện" },
    { ok: !!f.og_image || !!f.cover_image, label: "Có OG image cho mạng xã hội" },
    { ok: !!f.short_description && f.short_description.length >= 50, label: "Mô tả ngắn ≥ 50 ký tự" },
    { ok: f.description.length >= 200, label: "Mô tả chi tiết ≥ 200 ký tự" },
    { ok: !!f.category_id, label: "Đã phân loại danh mục" },
  ];
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  return { score, checks };
}

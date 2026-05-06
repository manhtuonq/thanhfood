import SiteLayout from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { setSEO } from "@/lib/seo";
import { useSettings } from "@/hooks/useSettings";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { data: settings } = useSettings();
  const owner = settings?.owner ?? {};
  const socials = settings?.socials ?? {};
  const [activeImg, setActiveImg] = useState<string | null>(null);

  const { data: p } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase.from("products")
        .select("*, category:categories(name,slug)")
        .eq("slug", slug!).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (!p) return;
    setActiveImg(p.cover_image);
    setSEO({
      title: p.meta_title || `${p.name} - Thanh Food`,
      description: p.meta_description || p.short_description || `${p.name} - Thực phẩm đông lạnh tại Thanh Food`,
      keywords: p.meta_keywords || undefined,
      ogImage: p.og_image || p.cover_image || undefined,
      canonical: p.canonical_url || `${window.location.origin}/san-pham/${p.slug}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        description: p.meta_description || p.short_description || "",
        image: p.cover_image,
        offers: { "@type": "Offer", price: "0", priceCurrency: "VND", availability: "https://schema.org/InStock" },
      },
    });
  }, [p]);

  if (!p) return <SiteLayout><div className="max-w-[1400px] mx-auto px-10 py-20 text-center">Đang tải...</div></SiteLayout>;

  const gallery: string[] = Array.isArray(p.gallery) ? (p.gallery as string[]) : [];
  const allImages = [p.cover_image, ...gallery].filter(Boolean) as string[];

  return (
    <SiteLayout>
      <div className="bg-white border-b border-[hsl(var(--green-pale))]">
        <div className="max-w-[1400px] mx-auto px-10 py-3 text-sm flex gap-2 text-muted-foreground">
          <Link to="/" className="hover:text-[hsl(var(--green-mid))]">Trang chủ</Link><span>/</span>
          <Link to={`/danh-muc/${p.category?.slug ?? ""}`} className="hover:text-[hsl(var(--green-mid))]">{p.category?.name}</Link><span>/</span>
          <span className="text-[hsl(var(--green-dark))] font-semibold">{p.name}</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-10 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square bg-white rounded-2xl shadow-soft overflow-hidden">
            <img src={activeImg || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/placeholder.svg'}}/>
          </div>
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {allImages.map((img) => (
                <button key={img} onClick={() => setActiveImg(img)} className={`aspect-square rounded-lg overflow-hidden border-2 ${activeImg === img ? "border-[hsl(var(--green-mid))]" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="text-[hsl(var(--teal-mid))] font-bold text-sm mb-1">{p.category?.name}</div>
          <h1 className="font-display text-4xl font-extrabold mb-3">{p.name}</h1>
          {p.short_description && <p className="text-muted-foreground mb-4">{p.short_description}</p>}
          <div className="text-3xl font-extrabold text-[hsl(var(--green-dark))] mb-5">{p.price}</div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {p.origin && <Info icon="fa-map-pin" label="Xuất xứ" value={p.origin} />}
            {p.weight && <Info icon="fa-weight-hanging" label="Khối lượng" value={p.weight} />}
            {p.storage && <Info icon="fa-snowflake" label="Bảo quản" value={p.storage} />}
          </div>
          <div className="flex gap-3 mb-8">
            <a href={socials.zalo || `tel:${(owner.phone||'').replace(/\s/g,'')}`} target="_blank" className="flex-1 bg-gradient-brand text-white rounded-xl py-4 font-bold text-base flex items-center justify-center gap-2 hover:shadow-glow transition">
              <i className="fa-solid fa-comment-dots" /> Liên hệ Zalo đặt hàng
            </a>
            <a href={`tel:${(owner.phone||'').replace(/\s/g,'')}`} className="bg-[hsl(var(--green-pale))] text-[hsl(var(--green-dark))] rounded-xl px-6 font-bold flex items-center gap-2 border border-[hsl(var(--green-light))]">
              <i className="fa-solid fa-phone" /> Gọi
            </a>
          </div>
          {p.description && (
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="font-display text-xl font-bold mb-3">Mô tả sản phẩm</h3>
              <div className="prose max-w-none text-sm text-muted-foreground whitespace-pre-line">{p.description}</div>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

function Info({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-[hsl(var(--green-pale))] rounded-xl p-3 text-center">
      <i className={`fa-solid ${icon} text-[hsl(var(--teal-mid))] mb-1`} />
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-bold text-sm">{value}</div>
    </div>
  );
}

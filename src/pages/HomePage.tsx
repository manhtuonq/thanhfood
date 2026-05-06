import SiteLayout from "@/components/site/SiteLayout";
import { ProductCard, ProductRow } from "@/components/site/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { setSEO } from "@/lib/seo";
import { useSettings } from "@/hooks/useSettings";

export default function HomePage() {
  const { data: settings } = useSettings();
  const branding = settings?.branding ?? {};

  useEffect(() => {
    setSEO({
      title: branding.site_title || "Thanh Food - Cá Viên Đông Lạnh Phan Thiết",
      description: branding.site_description || "Thanh Food Phan Thiết - Thực phẩm đông lạnh chất lượng cao, giao hàng nhanh trong 2H. Hải sản, thịt, xúc xích, phô mai tươi ngon.",
      keywords: "thanh food, đông lạnh, phan thiết, hải sản, cá viên, xúc xích",
    });
  }, [branding]);

  const { data: hot } = useQuery({
    queryKey: ["products-hot"],
    queryFn: async () => {
      const { data } = await supabase.from("products")
        .select("*, category:categories(name,slug)")
        .eq("is_visible", true).eq("is_hot", true).limit(10);
      return (data || []) as ProductRow[];
    },
  });

  const { data: latest } = useQuery({
    queryKey: ["products-latest"],
    queryFn: async () => {
      const { data } = await supabase.from("products")
        .select("*, category:categories(name,slug)")
        .eq("is_visible", true).order("created_at", { ascending: false }).limit(10);
      return (data || []) as ProductRow[];
    },
  });

  const banners: string[] = branding.banner_urls || [];

  return (
    <SiteLayout>
      {/* Hero banner */}
      <section className="bg-gradient-pale py-10">
        <div className="max-w-[1400px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="bg-white rounded-2xl shadow-soft p-1 hidden lg:block">
            <div className="bg-gradient-brand text-white px-5 py-3.5 rounded-xl font-display font-bold text-base flex items-center gap-2">
              <i className="fa-solid fa-bars-staggered" /> Danh mục sản phẩm
            </div>
            {[
              ["hai-san","fa-fish","Hải sản đông lạnh"],
              ["thit-dong-lanh","fa-drumstick-bite","Thịt đông lạnh"],
              ["xuc-xich","fa-hotdog","Xúc xích & Chả"],
              ["pho-mai","fa-cheese","Phô mai & Bơ"],
              ["vien-chien","fa-circle-dot","Viên chiên"],
            ].map(([slug, ic, name]) => (
              <a key={slug} href={`/danh-muc/${slug}`} className="flex items-center gap-3 px-5 py-3 hover:bg-[hsl(var(--green-pale))] transition border-b border-[hsl(var(--green-pale))] last:border-0 text-sm font-semibold">
                <i className={`fa-solid ${ic} text-[hsl(var(--teal-mid))] w-5`} /> {name}
              </a>
            ))}
          </aside>
          <div className="rounded-2xl overflow-hidden h-[420px] relative bg-gradient-brand grid place-items-center">
            {banners[0] ? (
              <img src={banners[0]} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="text-white text-center p-10">
                <h1 className="font-display text-5xl font-extrabold mb-3">Thanh Food Phan Thiết</h1>
                <p className="text-xl opacity-95">Thực phẩm đông lạnh tươi ngon mỗi ngày</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-10">
          <SectionTitle tag="Bán chạy nhất" icon="fa-star" title="Sản Phẩm Nổi Bật" desc="Những sản phẩm được yêu thích nhất tại Thanh Food" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10">
            {hot?.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      {/* New */}
      <section className="py-16 bg-gradient-pale">
        <div className="max-w-[1400px] mx-auto px-10">
          <SectionTitle tag="Mới về" icon="fa-bolt" title="Sản Phẩm Mới Về" desc="Cập nhật hàng mới liên tục, tươi ngon mỗi ngày" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10">
            {latest?.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-14 bg-gradient-trust text-white">
        <div className="max-w-[1400px] mx-auto px-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            ["fa-award","Chất Lượng Đảm Bảo","Kiểm tra chất lượng nghiêm ngặt"],
            ["fa-truck-fast","Giao Hàng Nhanh 2H","Giao tận nơi trong 2 giờ"],
            ["fa-snowflake","Bảo Quản Lạnh Chuẩn","Chuỗi lạnh từ kho đến tay bạn"],
            ["fa-headset","Hỗ Trợ 24/7","Tư vấn nhiệt tình mọi lúc"],
          ].map(([ic, t, d]) => (
            <div key={t} className="text-center bg-white/10 backdrop-blur rounded-2xl p-7 border border-white/15 hover:bg-white/15 transition">
              <i className={`fa-solid ${ic} text-4xl text-[hsl(var(--yellow-accent))] mb-3 block`} />
              <h4 className="font-display text-lg font-bold mb-2">{t}</h4>
              <p className="text-sm opacity-80">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionTitle({ tag, icon, title, desc }: { tag: string; icon: string; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 bg-[hsl(var(--green-pale))] text-[hsl(var(--green-dark))] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase">
        <i className={`fa-solid ${icon}`} /> {tag}
      </div>
      <h2 className="font-display text-4xl font-extrabold mt-3">{title}</h2>
      <p className="text-muted-foreground mt-2">{desc}</p>
    </div>
  );
}

import SiteLayout from "@/components/site/SiteLayout";
import { ProductCard, ProductRow } from "@/components/site/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { setSEO } from "@/lib/seo";

const PAGE_SIZE = 12;

export default function CategoryPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(1);

  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data || [],
  });
  const current = cats?.find((c: any) => c.slug === slug);

  useEffect(() => {
    setPage(1);
    setSEO({
      title: current ? `${current.name} - Thanh Food` : "Tất cả sản phẩm - Thanh Food",
      description: current?.description || `Khám phá ${current?.name || "sản phẩm"} chất lượng cao tại Thanh Food Phan Thiết`,
    });
  }, [slug, current]);

  const { data, isLoading } = useQuery({
    queryKey: ["products-cat", slug, page],
    enabled: true,
    queryFn: async () => {
      let q = supabase.from("products")
        .select("*, category:categories!inner(name,slug)", { count: "exact" })
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (slug) q = q.eq("categories.slug", slug);
      const res = await q;
      return { items: (res.data || []) as ProductRow[], count: res.count || 0 };
    },
  });

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[hsl(var(--green-pale))]">
        <div className="max-w-[1400px] mx-auto px-10 py-3 text-sm text-muted-foreground flex gap-2">
          <Link to="/" className="hover:text-[hsl(var(--green-mid))]"><i className="fa-solid fa-house" /> Trang chủ</Link>
          <span>/</span>
          <span className="text-[hsl(var(--green-dark))] font-semibold">{current?.name || "Tất cả sản phẩm"}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-pale py-10">
        <div className="max-w-[1400px] mx-auto px-10">
          <h1 className="font-display text-4xl font-extrabold text-[hsl(var(--green-dark))]">
            <i className={`fa-solid ${current?.icon || "fa-box-open"} mr-2`} /> {current?.name || "Tất cả Sản phẩm"}
          </h1>
          <p className="text-muted-foreground mt-2">{current?.description || "Toàn bộ sản phẩm chất lượng cao tại Thanh Food"}</p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-10 py-10 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-white rounded-2xl shadow-soft p-2 h-fit sticky top-32">
          <div className="bg-gradient-brand text-white px-4 py-3 rounded-xl font-display font-bold text-sm flex items-center gap-2 mb-2">
            <i className="fa-solid fa-bars-staggered" /> Danh mục
          </div>
          <Link to="/danh-muc" className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${!slug ? "bg-[hsl(var(--green-pale))] text-[hsl(var(--green-dark))]" : "hover:bg-muted"}`}>
            <i className="fa-solid fa-border-all" /> Tất cả
          </Link>
          {cats?.map((c: any) => (
            <Link key={c.id} to={`/danh-muc/${c.slug}`} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${slug === c.slug ? "bg-[hsl(var(--green-pale))] text-[hsl(var(--green-dark))]" : "hover:bg-muted"}`}>
              <i className={`fa-solid ${c.icon || "fa-tag"}`} /> {c.name}
            </Link>
          ))}
        </aside>

        {/* Grid */}
        <div>
          <div className="flex items-center justify-between mb-5 text-sm">
            <span className="text-muted-foreground">Đang hiển thị <strong className="text-[hsl(var(--green-dark))]">{data?.items.length ?? 0}</strong> / {data?.count ?? 0} sản phẩm</span>
          </div>
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Đang tải...</div>
          ) : data?.items.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {data.items.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl">
              <i className="fa-solid fa-box-open text-5xl text-muted-foreground mb-3" />
              <h3 className="font-display text-xl font-bold">Chưa có sản phẩm</h3>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50">‹</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`px-4 py-2 rounded-lg font-bold ${page === i + 1 ? "bg-gradient-brand text-white" : "bg-white border"}`}>{i + 1}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50">›</button>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

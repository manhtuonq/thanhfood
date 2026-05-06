import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const PAGE_SIZE = 10;

export default function AdminProducts() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-products", page, q],
    queryFn: async () => {
      let query = supabase.from("products")
        .select("*, category:categories(name)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (q) query = query.ilike("name", `%${q}%`);
      const res = await query;
      return { items: res.data || [], count: res.count || 0 };
    },
  });

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  const toggleVisible = async (id: string, val: boolean) => {
    await supabase.from("products").update({ is_visible: val }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const del = async (id: string) => {
    if (!confirm("Xoá sản phẩm?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Đã xoá"); qc.invalidateQueries({ queryKey: ["admin-products"] }); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-extrabold">Sản phẩm</h1>
        <Link to="/admin/products/new" className="bg-gradient-brand text-white px-5 py-2.5 rounded-lg font-bold hover:shadow-glow transition">
          <i className="fa-solid fa-plus mr-2" /> Thêm sản phẩm
        </Link>
      </div>
      <input value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} placeholder="Tìm theo tên..." className="w-full max-w-md mb-4 border-2 rounded-lg px-4 py-2.5" />
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--green-pale))]">
            <tr>
              <th className="text-left p-3">Ảnh</th>
              <th className="text-left p-3">Tên</th>
              <th className="text-left p-3">Danh mục</th>
              <th className="text-left p-3">Giá</th>
              <th className="text-left p-3">Hiển thị</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((p: any) => (
              <tr key={p.id} className="border-t hover:bg-muted/30">
                <td className="p-3"><img src={p.cover_image || "/placeholder.svg"} className="w-12 h-12 object-cover rounded-lg" /></td>
                <td className="p-3 font-semibold">{p.name}<div className="text-[11px] text-muted-foreground font-mono">{p.slug}</div></td>
                <td className="p-3">{p.category?.name || "-"}</td>
                <td className="p-3">{p.price}</td>
                <td className="p-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={p.is_visible} onChange={(e) => toggleVisible(p.id, e.target.checked)} />
                    <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-[hsl(var(--green-mid))] relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <Link to={`/admin/products/${p.id}`} className="text-[hsl(var(--green-mid))] mr-3 hover:underline">Sửa</Link>
                  <button onClick={() => del(p.id)} className="text-destructive hover:underline">Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-white border rounded disabled:opacity-50">‹</button>
          <span className="px-4 py-1.5">Trang {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-white border rounded disabled:opacity-50">›</button>
        </div>
      )}
    </div>
  );
}

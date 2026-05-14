import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const PIE = ["hsl(var(--green-mid))", "hsl(var(--teal-mid))", "hsl(var(--yellow-accent))", "hsl(var(--red-accent))", "#888"];

export default function AdminDashboard() {
  const qc = useQueryClient();
  const [rev, setRev] = useState({ amount: "", date: new Date().toISOString().slice(0, 10), note: "" });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const since = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
      const [prods, cats, revs, visits] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("revenues").select("amount,date,note,id").order("date", { ascending: true }),
        supabase.from("page_visits").select("device,browser,os,visitor_id,created_at,path").gte("created_at", since),
      ]);

      const totalRev = (revs.data || []).reduce((s, r: any) => s + Number(r.amount), 0);
      const byDay: Record<string, number> = {};
      (revs.data || []).forEach((r: any) => { byDay[r.date] = (byDay[r.date] || 0) + Number(r.amount); });
      const revChart = Object.entries(byDay).map(([date, amount]) => ({ date, amount }));

      const visitsByDay: Record<string, number> = {};
      const uniqByDay: Record<string, Set<string>> = {};
      const devCount: Record<string, number> = {};
      const browserCount: Record<string, number> = {};
      const osCount: Record<string, number> = {};
      const allVisitors = new Set<string>();
      (visits.data || []).forEach((v: any) => {
        const d = (v.created_at || "").slice(0, 10);
        visitsByDay[d] = (visitsByDay[d] || 0) + 1;
        if (!uniqByDay[d]) uniqByDay[d] = new Set();
        if (v.visitor_id) { uniqByDay[d].add(v.visitor_id); allVisitors.add(v.visitor_id); }
        devCount[v.device || "Khác"] = (devCount[v.device || "Khác"] || 0) + 1;
        browserCount[v.browser || "Khác"] = (browserCount[v.browser || "Khác"] || 0) + 1;
        osCount[v.os || "Khác"] = (osCount[v.os || "Khác"] || 0) + 1;
      });
      const visitChart = Object.keys(visitsByDay).sort().map((d) => ({
        date: d, views: visitsByDay[d], unique: uniqByDay[d]?.size || 0,
      }));
      const toPie = (m: Record<string, number>) => Object.entries(m).map(([name, value]) => ({ name, value }));

      return {
        products: prods.count ?? 0,
        categories: cats.count ?? 0,
        totalRev,
        revChart,
        recentRev: (revs.data || []).slice(-5).reverse(),
        visits30: (visits.data || []).length,
        uniqueVisitors: allVisitors.size,
        visitChart,
        devices: toPie(devCount),
        browsers: toPie(browserCount),
        os: toPie(osCount),
      };
    },
  });

  const addRev = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rev.amount) return;
    const { error } = await supabase.from("revenues").insert({
      amount: Number(rev.amount), date: rev.date, note: rev.note || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Đã thêm doanh thu");
    setRev({ amount: "", date: new Date().toISOString().slice(0, 10), note: "" });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold mb-6">Tổng quan</h1>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Stat icon="fa-box-open" label="Sản phẩm" value={stats?.products ?? 0} color="green" to="/admin/products" />
        <Stat icon="fa-tags" label="Danh mục" value={stats?.categories ?? 0} color="teal" to="/admin/categories" />
        <Stat icon="fa-money-bill-trend-up" label="Tổng doanh thu" value={(stats?.totalRev ?? 0).toLocaleString("vi-VN") + "đ"} color="yellow" to="/admin/revenues" />
        <Stat icon="fa-eye" label="Lượt xem 30N" value={stats?.visits30 ?? 0} color="red" />
        <Stat icon="fa-users" label="Khách duy nhất" value={stats?.uniqueVisitors ?? 0} color="green" />
      </div>

      {/* Revenue chart + add */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-bold"><i className="fa-solid fa-chart-line text-[hsl(var(--green-mid))] mr-2" />Doanh thu theo ngày</h3>
            <Link to="/admin/revenues" className="text-sm text-[hsl(var(--green-mid))] font-bold hover:underline">Quản lý chi tiết →</Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={stats?.revChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--green-pale))" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v: any) => Number(v).toLocaleString("vi-VN") + "đ"} />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--green-mid))" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <form onSubmit={addRev} className="bg-white rounded-2xl p-6 shadow-soft space-y-3 h-fit">
          <h3 className="font-display text-lg font-bold"><i className="fa-solid fa-plus-circle text-[hsl(var(--green-mid))] mr-2" />Thêm doanh thu</h3>
          <div>
            <label className="text-xs font-bold block mb-1">Số tiền (VND)</label>
            <input type="number" required value={rev.amount} onChange={(e) => setRev({ ...rev, amount: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" placeholder="1000000" />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Ngày</label>
            <input type="date" value={rev.date} onChange={(e) => setRev({ ...rev, date: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Ghi chú</label>
            <input value={rev.note} onChange={(e) => setRev({ ...rev, note: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" placeholder="Đơn #123..." />
          </div>
          <button className="w-full bg-gradient-brand text-white rounded-lg py-2.5 font-bold hover:shadow-glow">Lưu</button>
          {!!stats?.recentRev?.length && (
            <div className="pt-3 border-t">
              <div className="text-xs font-bold mb-2 text-muted-foreground">Gần đây</div>
              <ul className="space-y-1.5 text-xs">
                {stats.recentRev.map((r: any) => (
                  <li key={r.id} className="flex justify-between"><span className="text-muted-foreground">{r.date}</span><strong>{Number(r.amount).toLocaleString("vi-VN")}đ</strong></li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>

      {/* Visitors line + breakdowns */}
      <div className="bg-white rounded-2xl p-6 shadow-soft mb-6">
        <h3 className="font-display text-xl font-bold mb-4"><i className="fa-solid fa-chart-area text-[hsl(var(--teal-mid))] mr-2" />Lượt truy cập 30 ngày qua</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={stats?.visitChart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--green-pale))" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" name="Lượt xem" dataKey="views" stroke="hsl(var(--green-mid))" strokeWidth={3} dot={{ r: 3 }} />
              <Line type="monotone" name="Khách duy nhất" dataKey="unique" stroke="hsl(var(--yellow-accent))" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Pie3 title="Thiết bị truy cập" icon="fa-mobile-screen" data={stats?.devices || []} />
        <Pie3 title="Trình duyệt" icon="fa-globe" data={stats?.browsers || []} />
        <Pie3 title="Hệ điều hành" icon="fa-desktop" data={stats?.os || []} />
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color, to }: { icon: string; label: string; value: any; color: string; to?: string }) {
  const colors: Record<string, string> = {
    green: "bg-gradient-brand",
    teal: "bg-[hsl(var(--teal-mid))]",
    yellow: "bg-[hsl(var(--yellow-accent))]",
    red: "bg-[hsl(var(--red-accent))]",
  };
  const inner = (
    <div className="bg-white rounded-2xl p-5 shadow-soft flex items-center gap-3 hover:shadow-card transition">
      <div className={`w-12 h-12 rounded-xl ${colors[color]} text-white grid place-items-center text-lg`}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground font-semibold uppercase truncate">{label}</div>
        <div className="font-display text-xl font-extrabold truncate">{value}</div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function Pie3({ title, icon, data }: { title: string; icon: string; data: { name: string; value: number }[] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">
      <h3 className="font-display font-bold mb-3"><i className={`fa-solid ${icon} text-[hsl(var(--teal-mid))] mr-2`} />{title}</h3>
      <div className="h-56">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={75} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

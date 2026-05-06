import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [prods, cats, revs] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("revenues").select("amount,date").order("date", { ascending: true }),
      ]);
      const total = (revs.data || []).reduce((s, r: any) => s + Number(r.amount), 0);
      const byDay: Record<string, number> = {};
      (revs.data || []).forEach((r: any) => { byDay[r.date] = (byDay[r.date] || 0) + Number(r.amount); });
      const chart = Object.entries(byDay).map(([date, amount]) => ({ date, amount }));
      return { products: prods.count ?? 0, categories: cats.count ?? 0, total, chart };
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold mb-6">Tổng quan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Stat icon="fa-box-open" label="Sản phẩm" value={stats?.products ?? 0} color="green" />
        <Stat icon="fa-tags" label="Danh mục" value={stats?.categories ?? 0} color="teal" />
        <Stat icon="fa-money-bill-trend-up" label="Tổng doanh thu" value={(stats?.total ?? 0).toLocaleString("vi-VN") + "đ"} color="yellow" />
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <h3 className="font-display text-xl font-bold mb-4">Doanh thu theo ngày</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={stats?.chart || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="hsl(var(--green-mid))" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: string; label: string; value: any; color: string }) {
  const colors: Record<string, string> = {
    green: "bg-gradient-brand",
    teal: "bg-[hsl(var(--teal-mid))]",
    yellow: "bg-[hsl(var(--yellow-accent))]",
  };
  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl ${colors[color]} text-white grid place-items-center text-xl`}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div>
        <div className="text-xs text-muted-foreground font-semibold uppercase">{label}</div>
        <div className="font-display text-2xl font-extrabold">{value}</div>
      </div>
    </div>
  );
}

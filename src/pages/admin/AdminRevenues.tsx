import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminRevenues() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), amount: "", note: "" });

  const { data } = useQuery({
    queryKey: ["revenues"],
    queryFn: async () => (await supabase.from("revenues").select("*").order("date", { ascending: false })).data || [],
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("revenues").insert({ date: form.date, amount: Number(form.amount), note: form.note });
    if (error) { toast.error(error.message); return; }
    toast.success("Đã thêm");
    setForm({ date: new Date().toISOString().slice(0, 10), amount: "", note: "" });
    qc.invalidateQueries({ queryKey: ["revenues"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const del = async (id: string) => {
    if (!confirm("Xoá ghi nhận?")) return;
    await supabase.from("revenues").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["revenues"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const total = (data || []).reduce((s, r: any) => s + Number(r.amount), 0);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold mb-6">Doanh thu</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="p-4 bg-[hsl(var(--green-pale))] font-bold flex items-center justify-between">
            <span>Tổng cộng</span>
            <span className="text-[hsl(var(--green-dark))] text-xl font-extrabold">{total.toLocaleString("vi-VN")}đ</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr><th className="text-left p-3">Ngày</th><th className="text-left p-3">Số tiền</th><th className="text-left p-3">Ghi chú</th><th></th></tr>
            </thead>
            <tbody>
              {data?.map((r: any) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.date}</td>
                  <td className="p-3 font-bold text-[hsl(var(--green-dark))]">{Number(r.amount).toLocaleString("vi-VN")}đ</td>
                  <td className="p-3 text-muted-foreground">{r.note}</td>
                  <td className="p-3 text-right"><button onClick={() => del(r.id)} className="text-destructive hover:underline">Xoá</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-soft p-5 h-fit space-y-3">
          <h3 className="font-display font-bold text-lg">Ghi nhận doanh thu</h3>
          <label className="block"><span className="text-sm font-semibold block mb-1">Ngày</span><input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" /></label>
          <label className="block"><span className="text-sm font-semibold block mb-1">Số tiền (VND)</span><input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" /></label>
          <label className="block"><span className="text-sm font-semibold block mb-1">Ghi chú</span><textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} className="w-full border-2 rounded-lg px-3 py-2" /></label>
          <button className="w-full bg-gradient-brand text-white rounded-lg py-2.5 font-bold">Thêm ghi nhận</button>
        </form>
      </div>
    </div>
  );
}

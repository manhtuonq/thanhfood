import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { slugify } from "@/lib/seo";

export default function AdminCategories() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ id: "", name: "", slug: "", icon: "fa-tag", description: "", sort_order: 0 });

  const { data: cats } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data || [],
  });

  const reset = () => setForm({ id: "", name: "", slug: "", icon: "fa-tag", description: "", sort_order: 0 });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, slug: form.slug || slugify(form.name), icon: form.icon, description: form.description, sort_order: Number(form.sort_order) };
    const { error } = form.id
      ? await supabase.from("categories").update(payload).eq("id", form.id)
      : await supabase.from("categories").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Đã lưu danh mục");
    reset();
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const del = async (id: string) => {
    if (!confirm("Xoá danh mục này?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Đã xoá");
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold mb-6">Danh mục</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--green-pale))]">
              <tr><th className="text-left p-3">Tên</th><th className="text-left p-3">Slug</th><th className="text-left p-3">Icon</th><th className="text-left p-3">STT</th><th></th></tr>
            </thead>
            <tbody>
              {cats?.map((c: any) => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-semibold">{c.name}</td>
                  <td className="p-3 text-muted-foreground">{c.slug}</td>
                  <td className="p-3"><i className={`fa-solid ${c.icon}`} /></td>
                  <td className="p-3">{c.sort_order}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => setForm(c)} className="text-[hsl(var(--green-mid))] mr-3 hover:underline">Sửa</button>
                    <button onClick={() => del(c.id)} className="text-destructive hover:underline">Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-soft p-5 h-fit space-y-3">
          <h3 className="font-display font-bold text-lg">{form.id ? "Sửa" : "Thêm"} danh mục</h3>
          <Field label="Tên"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })} required className="w-full border-2 rounded-lg px-3 py-2" /></Field>
          <Field label="Slug"><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 font-mono text-sm" /></Field>
          <Field label="Icon (FontAwesome)"><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="fa-fish" className="w-full border-2 rounded-lg px-3 py-2 font-mono text-sm" /></Field>
          <Field label="Mô tả"><textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2" rows={2} /></Field>
          <Field label="Thứ tự"><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="w-full border-2 rounded-lg px-3 py-2" /></Field>
          <div className="flex gap-2">
            <button className="flex-1 bg-gradient-brand text-white rounded-lg py-2.5 font-bold">{form.id ? "Cập nhật" : "Thêm"}</button>
            {form.id && <button type="button" onClick={reset} className="px-4 border rounded-lg">Huỷ</button>}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-semibold block mb-1">{label}</span>{children}</label>;
}

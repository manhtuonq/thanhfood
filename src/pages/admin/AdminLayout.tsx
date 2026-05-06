import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.jpg";

const items = [
  { to: "/admin", icon: "fa-gauge", label: "Dashboard", end: true },
  { to: "/admin/products", icon: "fa-box-open", label: "Sản phẩm" },
  { to: "/admin/categories", icon: "fa-tags", label: "Danh mục" },
  { to: "/admin/revenues", icon: "fa-chart-line", label: "Doanh thu" },
  { to: "/admin/settings", icon: "fa-gear", label: "Cài đặt" },
];

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) nav("/admin/login", { replace: true });
  }, [user, loading, nav]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Đang tải...</div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center text-center p-6">
        <div>
          <p className="text-destructive font-bold mb-3">Tài khoản không có quyền quản trị.</p>
          <button onClick={async () => { await supabase.auth.signOut(); nav("/admin/login"); }} className="px-4 py-2 rounded-lg bg-gradient-brand text-white font-bold">Đăng xuất</button>
        </div>
      </div>
    );
  }

  const logout = async () => {
    await supabase.auth.signOut();
    nav("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-[hsl(var(--cream))]">
      <aside className="w-64 bg-white shadow-soft flex flex-col">
        <div className="p-5 border-b flex items-center gap-3">
          <img src={logo} alt="" className="h-10" />
          <div>
            <div className="font-display font-extrabold text-[hsl(var(--green-dark))]">Thanh Food</div>
            <div className="text-[11px] text-muted-foreground">Quản trị</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition ${isActive ? "bg-gradient-brand text-white shadow-glow" : "hover:bg-[hsl(var(--green-pale))] text-foreground"}`
            }>
              <i className={`fa-solid ${i.icon} w-4`} /> {i.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="m-3 px-4 py-2.5 rounded-lg text-sm font-bold border hover:bg-destructive hover:text-white transition flex items-center gap-2">
          <i className="fa-solid fa-right-from-bracket" /> Đăng xuất
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

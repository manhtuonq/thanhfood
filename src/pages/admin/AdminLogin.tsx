import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";

const ADMIN_EMAIL = "thanhfood@admin.local";
const ADMIN_USERNAME = "thanhfood";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (user && isAdmin) nav("/admin", { replace: true });
  }, [user, isAdmin, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const email = username.trim().toLowerCase() === ADMIN_USERNAME ? ADMIN_EMAIL : username.trim();
    let { error } = await supabase.auth.signInWithPassword({ email, password });
    // Nếu lần đầu chưa có tài khoản admin → tự khởi tạo rồi đăng nhập lại
    if (error) {
      try {
        await supabase.functions.invoke("bootstrap-admin");
        const retry = await supabase.auth.signInWithPassword({ email, password });
        error = retry.error;
      } catch {}
    }
    setLoading(false);
    if (error) { toast.error("Sai tài khoản hoặc mật khẩu"); return; }
    nav("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-pale p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <img src={logo} alt="Thanh Food" className="h-16 mx-auto mb-3" />
          <h1 className="font-display text-2xl font-extrabold text-[hsl(var(--green-dark))]">Quản trị Thanh Food</h1>
          <p className="text-sm text-muted-foreground mt-1">Đăng nhập để quản lý website</p>
        </div>
        <label className="block text-sm font-bold mb-1">Tài khoản</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border-2 rounded-lg px-3 py-2.5 mb-4 focus:outline-none focus:border-[hsl(var(--green-mid))]" placeholder="thanhfood" required />
        <label className="block text-sm font-bold mb-1">Mật khẩu</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-2 rounded-lg px-3 py-2.5 mb-6 focus:outline-none focus:border-[hsl(var(--green-mid))]" required />
        <button disabled={loading} className="w-full bg-gradient-brand text-white rounded-lg py-3 font-bold hover:shadow-glow transition disabled:opacity-50">
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}

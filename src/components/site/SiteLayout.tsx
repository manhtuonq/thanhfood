import { useSettings } from "@/hooks/useSettings";
import logoFallback from "@/assets/logo.jpg";
import { Link } from "react-router-dom";

function Topbar() {
  const { data } = useSettings();
  const owner = data?.owner ?? {};
  return (
    <div className="bg-gradient-topbar text-white text-[13px] py-2.5">
      <div className="max-w-[1400px] mx-auto px-10 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2 opacity-95">
          <i className="fa-solid fa-location-dot" /> {owner.address}
        </div>
        <div className="flex items-center gap-4 opacity-90">
          <span><i className="fa-solid fa-envelope mr-1" /> {owner.email}</span>
          <span className="opacity-50">|</span>
          <a href="#" className="hover:text-[hsl(var(--yellow-accent))]"><i className="fa-solid fa-store mr-1" /> Hệ thống cửa hàng</a>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const { data } = useSettings();
  const branding = data?.branding ?? {};
  const owner = data?.owner ?? {};
  const logo = branding.logo_url || logoFallback;
  return (
    <header className="bg-white sticky top-0 z-50 shadow-soft border-b-[3px] border-[hsl(var(--green-light))]">
      <div className="max-w-[1400px] mx-auto px-10 flex items-center gap-7 h-[90px]">
        <Link to="/" className="shrink-0"><img src={logo} alt="Thanh Food" className="h-[72px] object-contain" /></Link>
        <div className="flex-1 relative">
          <input
            className="w-full py-3.5 pl-5 pr-32 rounded-full border-2 border-[hsl(var(--green-pale))] bg-[hsl(var(--green-pale))] text-sm focus:outline-none focus:border-[hsl(var(--green-mid))] focus:bg-white transition"
            placeholder="🔍  Tìm kiếm sản phẩm: tôm, cua, cá viên..."
          />
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-brand text-white rounded-full px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:shadow-glow transition">
            <i className="fa-solid fa-magnifying-glass" /> Tìm kiếm
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--red-accent))] text-white grid place-items-center"><i className="fa-regular fa-clock" /></div>
            <div className="text-[11px] leading-tight">
              <div className="text-muted-foreground">Thời gian</div>
              <div className="font-extrabold text-sm">8h – 21h</div>
            </div>
          </div>
          <a href={`tel:${(owner.phone||'').replace(/\s/g,'')}`} className="bg-gradient-brand text-white rounded-full px-5 py-3 font-extrabold text-sm flex items-center gap-2 hover:shadow-glow transition">
            <i className="fa-solid fa-phone" /> {owner.phone}
          </a>
        </div>
      </div>
    </header>
  );
}

function Navbar() {
  return (
    <nav className="bg-gradient-brand">
      <div className="max-w-[1400px] mx-auto px-10 flex items-center gap-1 h-12 overflow-x-auto">
        <NavItem to="/" icon="fa-house" label="Trang chủ" />
        <NavItem to="/gioi-thieu" icon="fa-circle-info" label="Giới thiệu" />
        <NavItem to="/danh-muc/hai-san" icon="fa-fish" label="Hải sản" />
        <NavItem to="/danh-muc/thit-dong-lanh" icon="fa-drumstick-bite" label="Thịt đông lạnh" />
        <NavItem to="/danh-muc/xuc-xich" icon="fa-hotdog" label="Xúc xích & Chả" />
        <NavItem to="/danh-muc/pho-mai" icon="fa-cheese" label="Phô mai" />
        <NavItem to="/danh-muc" icon="fa-box-open" label="Tất cả sản phẩm" />
        <div className="ml-auto text-white font-extrabold text-sm flex items-center gap-2 px-3 whitespace-nowrap">
          <i className="fa-solid fa-headset" /> Hotline: 0908 881 122
        </div>
      </div>
    </nav>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <Link to={to} className="text-white/95 px-4 py-3 text-[14px] font-bold flex items-center gap-2 whitespace-nowrap hover:bg-white/15 rounded-md transition">
      <i className={`fa-solid ${icon}`} /> {label}
    </Link>
  );
}

function FloatBar() {
  const { data } = useSettings();
  const s = data?.socials ?? {};
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {s.zalo && <a href={s.zalo} target="_blank" rel="noopener" className="w-[52px] h-[52px] rounded-full bg-[#0068FF] text-white grid place-items-center text-xl shadow-card hover:scale-110 transition"><i className="fa-solid fa-comment-dots" /></a>}
      {s.messenger && <a href={s.messenger} target="_blank" rel="noopener" className="w-[52px] h-[52px] rounded-full bg-[#00B2FF] text-white grid place-items-center text-xl shadow-card hover:scale-110 transition"><i className="fa-brands fa-facebook-messenger" /></a>}
      {s.tiktok && <a href={s.tiktok} target="_blank" rel="noopener" className="w-[52px] h-[52px] rounded-full bg-black text-white grid place-items-center text-xl shadow-card hover:scale-110 transition"><i className="fa-brands fa-tiktok" /></a>}
    </div>
  );
}

function Footer() {
  const { data } = useSettings();
  const owner = data?.owner ?? {};
  const f = data?.footer ?? {};
  const s = data?.socials ?? {};
  const branding = data?.branding ?? {};
  const logo = branding.logo_url || logoFallback;
  return (
    <footer className="bg-gradient-footer text-white">
      <div className="py-16 px-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1.5fr] gap-12 mb-12">
          <div>
            <img src={logo} alt="Logo" className="h-14 mb-4 brightness-0 invert" />
            <p className="text-sm opacity-75 leading-relaxed mb-5">{f.about}</p>
            <div className="flex gap-2.5">
              {s.facebook && <SocialBtn href={s.facebook} icon="fa-facebook-f" />}
              {s.tiktok && <SocialBtn href={s.tiktok} icon="fa-tiktok" />}
              {s.instagram && <SocialBtn href={s.instagram} icon="fa-instagram" />}
              {s.youtube && <SocialBtn href={s.youtube} icon="fa-youtube" />}
            </div>
          </div>
          <FooterCol title="Về Chúng Tôi" links={[
            { l: "Trang chủ", h: "/" }, { l: "Giới thiệu", h: "/gioi-thieu" },
            { l: "Sản phẩm", h: "/danh-muc" }, { l: "Liên hệ", h: "#" },
          ]} />
          <FooterCol title="Chính Sách" links={[
            { l: "Chính sách đổi trả", h: "#" }, { l: "Chính sách giao hàng", h: "#" },
            { l: "Bảo mật thông tin", h: "#" },
          ]} />
          <div>
            <h4 className="font-display text-[17px] font-bold mb-4 text-[hsl(var(--yellow-accent))]">Liên Hệ</h4>
            <ul className="space-y-3 text-sm opacity-75">
              <li className="flex gap-2.5"><i className="fa-solid fa-location-dot text-[hsl(var(--green-light))] mt-0.5" /> {owner.address}</li>
              <li className="flex gap-2.5"><i className="fa-solid fa-phone text-[hsl(var(--green-light))] mt-0.5" /> {owner.phone}</li>
              <li className="flex gap-2.5"><i className="fa-solid fa-envelope text-[hsl(var(--green-light))] mt-0.5" /> {owner.email}</li>
              <li className="flex gap-2.5"><i className="fa-regular fa-clock text-[hsl(var(--green-light))] mt-0.5" /> {owner.working_hours}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto border-t border-white/10 pt-6 text-center text-sm opacity-60">
          {f.copyright}
        </div>
      </div>
    </footer>
  );
}

function SocialBtn({ href, icon }: { href: string; icon: string }) {
  return <a href={href} target="_blank" rel="noopener" className="w-9 h-9 rounded-full bg-white/15 border border-white/20 grid place-items-center hover:bg-[hsl(var(--green-mid))] transition"><i className={`fa-brands ${icon}`} /></a>;
}

function FooterCol({ title, links }: { title: string; links: { l: string; h: string }[] }) {
  return (
    <div>
      <h4 className="font-display text-[17px] font-bold mb-4 text-[hsl(var(--yellow-accent))]">{title}</h4>
      <ul className="space-y-2.5 text-sm">
        {links.map((x) => (
          <li key={x.l}><Link to={x.h} className="opacity-75 hover:opacity-100 hover:text-[hsl(var(--green-light))] flex items-center gap-2 transition"><i className="fa-solid fa-chevron-right text-[10px] text-[hsl(var(--green-light))]" /> {x.l}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />
      <Header />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatBar />
    </div>
  );
}

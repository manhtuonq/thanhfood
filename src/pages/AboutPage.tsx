import SiteLayout from "@/components/site/SiteLayout";
import { useEffect } from "react";
import { setSEO } from "@/lib/seo";
import { useSettings } from "@/hooks/useSettings";

export default function AboutPage() {
  const { data } = useSettings();
  const owner = data?.owner ?? {};
  useEffect(() => {
    setSEO({
      title: "Giới thiệu - Thanh Food Phan Thiết",
      description: "Thanh Food Phan Thiết - Hơn 10 năm kinh nghiệm cung cấp thực phẩm đông lạnh chất lượng cao tại Bình Thuận",
    });
  }, []);
  return (
    <SiteLayout>
      <section className="bg-gradient-pale py-16">
        <div className="max-w-[1400px] mx-auto px-10 text-center">
          <h1 className="font-display text-5xl font-extrabold text-[hsl(var(--green-dark))]">Về Thanh Food Phan Thiết</h1>
          <p className="text-muted-foreground text-lg mt-3 max-w-2xl mx-auto">Thực phẩm đông lạnh tươi ngon - Cam kết chất lượng - Giao nhanh 2 giờ</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-[1100px] mx-auto px-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[hsl(var(--green-pale))] text-[hsl(var(--green-dark))] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase mb-3">
              <i className="fa-solid fa-store" /> Câu chuyện của chúng tôi
            </div>
            <h2 className="font-display text-3xl font-extrabold mb-4">Hơn 10 năm đồng hành cùng gia đình Việt</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Thanh Food Phan Thiết được thành lập với sứ mệnh mang đến thực phẩm đông lạnh chất lượng cao, an toàn vệ sinh cho mọi gia đình tại Bình Thuận và các tỉnh lân cận.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Với hệ thống kho lạnh đạt chuẩn, đội ngũ giao hàng nhanh chóng, chúng tôi tự hào là đối tác tin cậy của hàng nghìn khách hàng và quán ăn tại Phan Thiết.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["fa-award","Chất lượng cao","Kiểm tra nghiêm ngặt"],
              ["fa-snowflake","Bảo quản chuẩn","-18°C nguyên chuỗi"],
              ["fa-truck-fast","Giao 2 giờ","Tận nơi nhanh chóng"],
              ["fa-headset","Hỗ trợ 24/7","Tư vấn tận tình"],
            ].map(([ic, t, d]) => (
              <div key={t} className="bg-gradient-pale rounded-2xl p-6 text-center shadow-soft">
                <i className={`fa-solid ${ic} text-4xl text-[hsl(var(--green-mid))] mb-2 block`} />
                <h4 className="font-display font-bold">{t}</h4>
                <p className="text-xs text-muted-foreground mt-1">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 bg-gradient-trust text-white">
        <div className="max-w-[1100px] mx-auto px-10 text-center">
          <h3 className="font-display text-2xl font-bold mb-4">Liên hệ với chúng tôi</h3>
          <p className="opacity-90"><i className="fa-solid fa-location-dot mr-2" /> {owner.address}</p>
          <p className="opacity-90 mt-1"><i className="fa-solid fa-phone mr-2" /> {owner.phone} • {owner.email}</p>
        </div>
      </section>
    </SiteLayout>
  );
}

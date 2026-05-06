import { Link } from "react-router-dom";
import productPlaceholder from "@/assets/product-placeholder.jpg";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  cover_image: string | null;
  origin: string | null;
  weight: string | null;
  storage: string | null;
  price: string | null;
  is_hot: boolean;
  sold: number;
  category?: { name: string; slug: string } | null;
};

export function ProductCard({ p }: { p: ProductRow }) {
  return (
    <Link to={`/san-pham/${p.slug}`} className="bg-white rounded-2xl overflow-hidden shadow-soft border border-[hsl(var(--green-pale))] hover:shadow-card hover:-translate-y-1.5 transition group flex flex-col">
      <div className="relative overflow-hidden aspect-[4/3] bg-[hsl(var(--green-pale))]">
        <img src={p.cover_image || productPlaceholder} alt={p.name} width={800} height={600} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" loading="lazy" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=productPlaceholder}}/>
        {p.is_hot && (
          <div className="absolute top-3 right-3 bg-gradient-to-br from-[hsl(var(--red-accent))] to-red-700 text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
            <i className="fa-solid fa-fire mr-1" /> Bán chạy
          </div>
        )}
        {p.origin && (
          <div className="absolute bottom-3 left-3 bg-white/90 text-[hsl(var(--green-dark))] text-[11px] font-bold px-3 py-1 rounded-full">
            <i className="fa-solid fa-map-pin mr-1" /> {p.origin}
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        {p.category && (
          <div className="text-[11px] text-[hsl(var(--teal-mid))] font-bold mb-1.5"><i className="fa-solid fa-tag mr-1" /> {p.category.name}</div>
        )}
        <h3 className="font-display text-base font-bold mb-2 line-clamp-2">{p.name}</h3>
        <div className="flex gap-3 text-[11px] text-muted-foreground mb-2">
          {p.weight && <span><i className="fa-solid fa-weight-hanging text-[hsl(var(--teal-mid))] mr-1" /> {p.weight}</span>}
          {p.storage && <span><i className="fa-solid fa-snowflake text-[hsl(var(--teal-mid))] mr-1" /> {p.storage}</span>}
        </div>
        <div className="text-lg font-extrabold text-[hsl(var(--green-dark))] mb-3">{p.price}</div>
        <div className="mt-auto flex gap-2">
          <button className="flex-1 bg-gradient-brand text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:shadow-glow transition">
            <i className="fa-solid fa-eye" /> Chi tiết
          </button>
        </div>
      </div>
    </Link>
  );
}

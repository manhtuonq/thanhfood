import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function getVisitorId() {
  try {
    let id = localStorage.getItem("visitor_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("visitor_id", id);
    }
    return id;
  } catch { return "anon"; }
}

function parseUA(ua: string) {
  const lower = ua.toLowerCase();
  const device = /mobile|iphone|android.*mobile/.test(lower) ? "Mobile"
    : /ipad|tablet/.test(lower) ? "Tablet" : "Desktop";
  const browser = /edg\//.test(lower) ? "Edge"
    : /chrome\//.test(lower) ? "Chrome"
    : /firefox\//.test(lower) ? "Firefox"
    : /safari\//.test(lower) ? "Safari" : "Khác";
  const os = /windows/.test(lower) ? "Windows"
    : /mac os/.test(lower) ? "macOS"
    : /android/.test(lower) ? "Android"
    : /iphone|ipad|ios/.test(lower) ? "iOS"
    : /linux/.test(lower) ? "Linux" : "Khác";
  return { device, browser, os };
}

export function useTrackVisit() {
  const loc = useLocation();
  useEffect(() => {
    if (loc.pathname.startsWith("/admin")) return;
    const ua = navigator.userAgent;
    const { device, browser, os } = parseUA(ua);
    supabase.from("page_visits").insert({
      path: loc.pathname,
      referrer: document.referrer || null,
      user_agent: ua,
      device, browser, os,
      visitor_id: getVisitorId(),
    }).then(() => {});
  }, [loc.pathname]);
}

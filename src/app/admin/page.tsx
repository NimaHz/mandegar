import { siteConfig } from "@/config/site";

export default function AdminPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-4 card p-8 text-center shadow-card">
        <span className="rounded-full bg-accent px-3 py-1 text-label font-bold text-on-accent">
          به‌زودی
        </span>
        <h1 className="font-display text-3xl font-black text-ink">پنل مدیریت</h1>
        <p className="text-sm leading-7 text-body">
          داشبورد مدیریت {siteConfig.name.fa} در حال ساخت است.
        </p>
      </div>
    </main>
  );
}

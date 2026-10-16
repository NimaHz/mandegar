import type { Locale } from "@/i18n/config";
import type { PluralForms } from "@/i18n/plural";
import type { PostKind } from "@/types/content";

interface KindCopy {
  label: string;
  plural: string;
}

export interface BlogContent {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  metaDescription: string;
  filterLabel: string;
  allKinds: string;
  kinds: Record<PostKind, KindCopy>;
  count: PluralForms;
  resultsTitle: string;
  featuredTitle: string;
  featuredBadge: string;
  readArticle: string;
  readingTime: string;
  published: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction: string;
  pageTitle: string;
  by: string;
  takeawaysHeading: string;
  toc: string;
  tocShow: string;
  tocHide: string;
  shareTitle: string;
  shareCopy: string;
  shareCopied: string;
  shareFailed: string;
  shareNative: string;
  aboutAuthor: string;
  authorArticles: string;
  relatedProducts: string;
  relatedProductsDescription: string;
  viewProduct: string;
  relatedPosts: string;
  allPosts: string;
  authorEyebrow: string;
  authorPosts: string;
  authorPostCount: PluralForms;
  authorLinks: string;
  authorMetaDescription: string;
  loadingPost: string;
}

export const blogContent: Record<Locale, BlogContent> = {
  fa: {
    eyebrow: "از کارگاه تا خانه",
    title: "مجله",
    titleAccent: "ماندگار",
    description:
      "راهنمای خرید، نکته‌های نگهداری و تازه‌های ماندگار؛ نوشته مهندسان و سرویس‌کارانی که هر روز با همین دستگاه‌ها سروکار دارند.",
    metaDescription:
      "راهنمای خرید کولر، بخاری و آبگرمکن، نکته‌های ایمنی و نگهداری و تازه‌ترین خبرهای ماندگار در مجله ماندگار.",
    filterLabel: "نوع مطلب",
    allKinds: "همه مطالب",
    kinds: {
      guide: { label: "راهنما", plural: "راهنماها" },
      news: { label: "خبر", plural: "اخبار" },
      tips: { label: "نکته", plural: "نکته‌ها" },
    },
    count: { one: "{count} مطلب", other: "{count} مطلب" },
    resultsTitle: "فهرست مطالب مجله",
    featuredTitle: "مطلب برگزیده",
    featuredBadge: "تازه‌ترین",
    readArticle: "خواندن مطلب",
    readingTime: "{count} دقیقه مطالعه",
    published: "تاریخ انتشار",
    emptyTitle: "هنوز مطلبی در این بخش منتشر نشده",
    emptyDescription: "به‌زودی مطالب تازه‌ای این‌جا می‌گذاریم. فعلاً بقیه بخش‌های مجله را ببین.",
    emptyAction: "همه مطالب مجله",
    pageTitle: "صفحه {page}",
    by: "نوشته",
    takeawaysHeading: "نکات کلیدی",
    toc: "در این مطلب",
    tocShow: "نمایش فهرست",
    tocHide: "بستن فهرست",
    shareTitle: "این مطلب به کارت آمد؟ برای کسی که لازمش دارد بفرست.",
    shareCopy: "کپی لینک",
    shareCopied: "لینک کپی شد",
    shareFailed: "کپی نشد، دوباره امتحان کن",
    shareNative: "اشتراک‌گذاری",
    aboutAuthor: "درباره نویسنده",
    authorArticles: "همه مطالب {name}",
    relatedProducts: "محصولات این مطلب",
    relatedProductsDescription: "مدل‌هایی که در این مطلب به آن‌ها اشاره شده است.",
    viewProduct: "مشاهده مشخصات {name}",
    relatedPosts: "مطالب دیگر مجله",
    allPosts: "همه مطالب",
    authorEyebrow: "نویسنده مجله ماندگار",
    authorPosts: "مطالب {name}",
    authorPostCount: { one: "{count} مطلب منتشرشده", other: "{count} مطلب منتشرشده" },
    authorLinks: "{name} در وب",
    authorMetaDescription: "{name}، {role}. مطالب و راهنماهای {name} را در مجله ماندگار بخوانید.",
    loadingPost: "در حال بارگذاری مطلب",
  },
  en: {
    eyebrow: "From the workshop to your home",
    title: "Mandegar",
    titleAccent: "Journal",
    description:
      "Buying guides, care tips and news from Mandegar, written by the engineers and technicians who work with these appliances every day.",
    metaDescription:
      "Buying guides for coolers, heaters and water heaters, safety and care tips, and the latest Mandegar news in the Mandegar Journal.",
    filterLabel: "Article type",
    allKinds: "All articles",
    kinds: {
      guide: { label: "Guide", plural: "Guides" },
      news: { label: "News", plural: "News" },
      tips: { label: "Tips", plural: "Tips" },
    },
    count: { one: "{count} article", other: "{count} articles" },
    resultsTitle: "Journal articles",
    featuredTitle: "Featured article",
    featuredBadge: "Latest",
    readArticle: "Read article",
    readingTime: "{count} min read",
    published: "Published",
    emptyTitle: "Nothing published here yet",
    emptyDescription:
      "New articles are on the way. In the meantime, browse the rest of the journal.",
    emptyAction: "All journal articles",
    pageTitle: "Page {page}",
    by: "By",
    takeawaysHeading: "Key takeaways",
    toc: "In this article",
    tocShow: "Show contents",
    tocHide: "Hide contents",
    shareTitle: "Found this useful? Send it to someone who needs it.",
    shareCopy: "Copy link",
    shareCopied: "Link copied",
    shareFailed: "Couldn't copy, try again",
    shareNative: "Share",
    aboutAuthor: "About the author",
    authorArticles: "All articles by {name}",
    relatedProducts: "Products in this article",
    relatedProductsDescription: "The models this article refers to.",
    viewProduct: "View {name} specs",
    relatedPosts: "More from the journal",
    allPosts: "All articles",
    authorEyebrow: "Mandegar Journal author",
    authorPosts: "Articles by {name}",
    authorPostCount: { one: "{count} published article", other: "{count} published articles" },
    authorLinks: "{name} on the web",
    authorMetaDescription:
      "{name}, {role}. Read guides and articles by {name} in the Mandegar Journal.",
    loadingPost: "Loading article",
  },
};

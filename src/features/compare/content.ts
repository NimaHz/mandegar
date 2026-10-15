import type { PluralForms } from "@/features/catalog/plural";
import type { Locale } from "@/i18n/config";

export interface CompareContent {
  toggle: {
    add: string;
    added: string;
    label: string;
    fullTitle: string;
    fullDescription: string;
    fullAction: string;
  };
  tray: {
    label: string;
    title: PluralForms;
    hint: string;
    compare: string;
    clear: string;
    remove: string;
    emptySlot: string;
  };
  page: {
    eyebrow: string;
    title: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    tableCaption: string;
    modelColumn: string;
    remove: string;
    highlight: string;
    highlightHint: string;
    overview: string;
    brand: string;
    category: string;
    energy: string;
    warranty: string;
    releaseYear: string;
    empty: string;
    viewModel: string;
    addMore: string;
    addMoreHint: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyAction: string;
    restoring: string;
    steps: string[];
  };
}

export const compareContent: Record<Locale, CompareContent> = {
  fa: {
    toggle: {
      add: "مقایسه",
      added: "در مقایسه",
      label: "مقایسه {name}",
      fullTitle: "فهرست مقایسه پر است",
      fullDescription:
        "حداکثر {count} مدل را می‌شود کنار هم دید. یکی را بردار یا همین حالا مقایسه کن.",
      fullAction: "مقایسه",
    },
    tray: {
      label: "مدل‌های انتخاب‌شده برای مقایسه",
      title: { one: "{count} مدل انتخاب شده", other: "مقایسه {count} مدل" },
      hint: "تا {count} مدل را کنار هم ببین",
      compare: "مقایسه کن",
      clear: "پاک کردن",
      remove: "حذف {name}",
      emptySlot: "جای خالی",
    },
    page: {
      eyebrow: "مقایسه مدل‌ها",
      title: "مشخصات را کنار هم ببین",
      description:
        "هوادهی، مصرف انرژی، ابعاد و گارانتی هر مدل را ردیف‌به‌ردیف مقایسه کن تا انتخاب مناسب خانه‌ات را پیدا کنی.",
      metaTitle: "مقایسه مدل‌ها",
      metaDescription: "مقایسه مشخصات فنی، رده انرژی و گارانتی مدل‌های ماندگار در یک جدول.",
      tableCaption: "مقایسه مشخصات فنی مدل‌های انتخاب‌شده",
      modelColumn: "مدل",
      remove: "حذف {name} از مقایسه",
      highlight: "نمایش تفاوت‌ها",
      highlightHint: "ردیف‌هایی که مقدارشان فرق دارد پررنگ می‌شوند",
      overview: "نگاه کلی",
      brand: "برند",
      category: "دسته",
      energy: "رده انرژی",
      warranty: "گارانتی",
      releaseYear: "سال عرضه",
      empty: "ندارد",
      viewModel: "مشاهده مدل",
      addMore: "مدل دیگری اضافه کن",
      addMoreHint: "از صفحه محصولات، دکمه مقایسه را روی هر مدل بزن.",
      emptyTitle: "هنوز مدلی برای مقایسه انتخاب نکرده‌ای",
      emptyDescription:
        "روی کارت هر محصول دکمه «مقایسه» را بزن تا حداکثر سه مدل را این‌جا کنار هم ببینی.",
      emptyAction: "دیدن محصولات",
      restoring: "در حال بازیابی فهرست مقایسه",
      steps: [
        "به صفحه محصولات یا یک دسته برو",
        "روی مدل‌های دلخواه «مقایسه» را بزن",
        "از نوار پایین صفحه، مقایسه را باز کن",
      ],
    },
  },
  en: {
    toggle: {
      add: "Compare",
      added: "Added",
      label: "Compare {name}",
      fullTitle: "Your compare list is full",
      fullDescription: "You can compare up to {count} models. Remove one, or compare them now.",
      fullAction: "Compare",
    },
    tray: {
      label: "Models selected for comparison",
      title: { one: "{count} model selected", other: "Compare {count} models" },
      hint: "See up to {count} models side by side",
      compare: "Compare",
      clear: "Clear",
      remove: "Remove {name}",
      emptySlot: "Empty slot",
    },
    page: {
      eyebrow: "Compare models",
      title: "See the specs side by side",
      description:
        "Compare airflow, energy use, dimensions and warranty row by row, and find the right fit for your home.",
      metaTitle: "Compare models",
      metaDescription:
        "Compare the specs, energy class and warranty of Mandegar models in one table.",
      tableCaption: "Technical comparison of the selected models",
      modelColumn: "Model",
      remove: "Remove {name} from compare",
      highlight: "Highlight differences",
      highlightHint: "Rows with different values stand out",
      overview: "At a glance",
      brand: "Brand",
      category: "Category",
      energy: "Energy class",
      warranty: "Warranty",
      releaseYear: "Release year",
      empty: "None",
      viewModel: "View model",
      addMore: "Add another model",
      addMoreHint: "On the products page, tap Compare on any model.",
      emptyTitle: "No models to compare yet",
      emptyDescription:
        "Tap “Compare” on any product card to see up to three models side by side here.",
      emptyAction: "Browse products",
      restoring: "Restoring your compare list",
      steps: [
        "Open the products page or a category",
        "Tap “Compare” on the models you like",
        "Open the comparison from the bar at the bottom",
      ],
    },
  },
};

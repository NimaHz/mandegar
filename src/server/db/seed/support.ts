import { createTrackingCode } from "@/lib/tracking-code";
import { hashPassword } from "@/server/auth/password";
import { getDb } from "@/server/db/client";
import { ticketMessages, tickets, users } from "@/server/db/schema";
import { randomToken, sha256 } from "@/server/lib/crypto";
import { ticketDeadlines } from "@/server/lib/sla";
import type { TicketPriority, TicketStatus, TicketType } from "@/types/support";

import type { IdMap } from "./catalog";
import { seedId } from "./helpers";

export const seedOwner = async () => {
  const email = process.env.SEED_OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_OWNER_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error("SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD (12+ characters) are required");
  }
  await getDb()
    .insert(users)
    .values({
      name: "Mandegar Owner",
      email,
      passwordHash: await hashPassword(password),
      role: "owner",
      active: true,
    })
    .onConflictDoNothing({ target: users.email });
  const owner = await getDb().query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
  });
  if (!owner) throw new Error("Owner user could not be created");
  return owner;
};

interface TicketSeed {
  key: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  product: string;
  daysAgo: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  subject: string;
  description: string;
  messages: {
    author: "staff" | "customer" | "system";
    internal: boolean;
    body: string;
    hoursLater: number;
  }[];
}

const ticketSeeds: TicketSeed[] = [
  {
    key: "cooler-pump",
    type: "warranty-repair",
    status: "scheduled",
    priority: "normal",
    product: "mc-4500",
    daysAgo: 3,
    name: "مریم رضایی",
    phone: "09120000001",
    province: "23",
    city: "تهران",
    subject: "پمپ کولر کار نمی‌کند",
    description:
      "کولر MC-4500 را دو ماه پیش نصب کرده‌ایم. از دیروز پمپ آب کار نمی‌کند و پوشال‌ها خشک می‌مانند. موتور سالم است.",
    messages: [
      {
        author: "staff",
        internal: false,
        body: "سلام، درخواست شما بررسی شد. سرویس‌کار مرکز خدمات مرکزی فردا بین ساعت ۱۰ تا ۱۲ با شما هماهنگ می‌کند و پمپ را در قالب گارانتی تعویض می‌کند.",
        hoursLater: 5,
      },
      {
        author: "staff",
        internal: true,
        body: "پمپ کشویی مدل ۱۴۰۴ در انبار مرکزی موجود است. به سرویس‌کار منطقه ۶ ارجاع شد.",
        hoursLater: 6,
      },
      { author: "customer", internal: false, body: "ممنون، فردا در منزل هستیم.", hoursLater: 8 },
    ],
  },
  {
    key: "water-heater-pilot",
    type: "technical",
    status: "awaiting-customer",
    priority: "normal",
    product: "mwh-150",
    daysAgo: 6,
    name: "علی محمدی",
    phone: "09350000002",
    province: "10",
    city: "اصفهان",
    subject: "خاموش شدن شعله پیلوت آبگرمکن",
    description:
      "شعله پیلوت آبگرمکن MWH-150 چند بار در روز خاموش می‌شود. دودکش را بررسی کرده‌ام و مشکلی ندارد.",
    messages: [
      {
        author: "staff",
        internal: false,
        body: "لطفاً بفرمایید آیا خاموشی بیشتر هنگام وزش باد اتفاق می‌افتد؟ اگر امکانش هست از کلاهک دودکش روی بام عکس بفرستید.",
        hoursLater: 20,
      },
    ],
  },
  {
    key: "heater-part",
    type: "spare-parts",
    status: "resolved",
    priority: "low",
    product: "mgh-9000",
    daysAgo: 21,
    name: "زهرا کاظمی",
    phone: "09190000003",
    province: "09",
    city: "مشهد",
    subject: "خرید شیشه جلوی بخاری",
    description: "شیشه جلوی بخاری MGH-9000 ترک برداشته است. قطعه جایگزین را از کجا تهیه کنم؟",
    messages: [
      {
        author: "staff",
        internal: false,
        body: "قطعه مورد نظر در مرکز خدمات ماندگار مشهد موجود است. با در دست داشتن کد رهگیری به نشانی بلوار وکیل‌آباد مراجعه کنید.",
        hoursLater: 4,
      },
      { author: "customer", internal: false, body: "قطعه را تحویل گرفتم، ممنون.", hoursLater: 50 },
      { author: "system", internal: false, body: "status:resolved", hoursLater: 52 },
    ],
  },
];

export const seedTickets = async (productIds: IdMap, ownerId: string) => {
  const now = Date.now();
  const created: { trackingCode: string; phone: string }[] = [];
  for (const seed of ticketSeeds) {
    const createdAt = new Date(now - seed.daysAgo * 86_400_000);
    const deadlines = ticketDeadlines(seed.type, createdAt);
    const firstStaff = seed.messages.find(
      (message) => message.author === "staff" && !message.internal,
    );
    const [row] = await getDb()
      .insert(tickets)
      .values({
        id: seedId(`ticket:${seed.key}`),
        trackingCode: createTrackingCode(),
        accessTokenHash: sha256(randomToken()),
        type: seed.type,
        status: seed.status,
        priority: seed.priority,
        name: seed.name,
        phone: seed.phone,
        province: seed.province,
        city: seed.city,
        address: "نشانی نمونه برای محیط توسعه",
        productId: productIds.get(seed.product) ?? null,
        subject: seed.subject,
        description: seed.description,
        assigneeId: ownerId,
        ...deadlines,
        firstRespondedAt: firstStaff
          ? new Date(createdAt.getTime() + firstStaff.hoursLater * 3_600_000)
          : null,
        resolvedAt:
          seed.status === "resolved" ? new Date(createdAt.getTime() + 52 * 3_600_000) : null,
        createdAt,
      })
      .onConflictDoNothing({ target: tickets.id })
      .returning({ trackingCode: tickets.trackingCode, phone: tickets.phone });
    if (row) created.push(row);
    await getDb()
      .insert(ticketMessages)
      .values([
        {
          id: seedId(`ticket:${seed.key}:message:0`),
          ticketId: seedId(`ticket:${seed.key}`),
          authorType: "customer" as const,
          body: seed.description,
          createdAt,
        },
        ...seed.messages.map((message, index) => ({
          id: seedId(`ticket:${seed.key}:message:${index + 1}`),
          ticketId: seedId(`ticket:${seed.key}`),
          authorType: message.author,
          authorId: message.author === "staff" ? ownerId : null,
          body: message.body,
          internal: message.internal,
          createdAt: new Date(createdAt.getTime() + message.hoursLater * 3_600_000),
        })),
      ])
      .onConflictDoNothing({ target: ticketMessages.id });
  }
  return created;
};

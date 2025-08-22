import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionType: varchar("subscription_type").default("free").notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  readingStreak: integer("reading_streak").default(0).notNull(),
  totalMinutesRead: integer("total_minutes_read").default(0).notNull(),
  summariesCompleted: integer("summaries_completed").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories for organizing books
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  iconName: varchar("icon_name", { length: 50 }),
  color: varchar("color", { length: 7 }),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Authors table
export const authors = pgTable("authors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  bio: text("bio"),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Books table
export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 300 }).notNull(),
  subtitle: text("subtitle"),
  authorId: varchar("author_id").references(() => authors.id),
  categoryId: varchar("category_id").references(() => categories.id),
  coverImageUrl: varchar("cover_image_url"),
  description: text("description"),
  publishedYear: integer("published_year"),
  isbn: varchar("isbn", { length: 20 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  ratingsCount: integer("ratings_count").default(0),
  isPopular: boolean("is_popular").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Book summaries
export const summaries = pgTable("summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  content: text("content").notNull(),
  inThisSummary: text("in_this_summary"), // New field for "In This Summary" section
  keyTakeaways: jsonb("key_takeaways").$type<string[]>(),
  bigIdeas: jsonb("big_ideas").$type<Array<{
    id: string;
    title: string;
    content: string;
  }>>(),
  aboutAuthor: text("about_author"), // New field for "About Author" section
  readingTimeMinutes: integer("reading_time_minutes").notNull(),
  audioUrl: varchar("audio_url"),
  audioDurationMinutes: integer("audio_duration_minutes"),
  // OPTION 1: Complex JSON timing (current)
  textTimings: jsonb("text_timings").$type<Array<{
    textSegment: string;
    startTime: number; // seconds
    endTime: number;   // seconds
  }>>(),
  // OPTION 2: Simple chapter markers (much easier!)
  chapterMarkers: jsonb("chapter_markers").$type<Array<{
    title: string;
    startTime: number; // just one timestamp per section
    content: string;
  }>>(),
  // OPTION 3: No sync data - just auto-scroll based on time estimation
  useAutoScroll: boolean("use_auto_scroll").default(true),
  summaryType: varchar("summary_type").notNull().default("opening"), // "opening", "main", "closing"
  sequenceNumber: integer("sequence_number").default(1), // For main summaries, can be 1-10
  isPublished: boolean("is_published").default(false),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User reading sessions
export const readingSessions = pgTable("reading_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  summaryId: varchar("summary_id").references(() => summaries.id).notNull(),
  progressPercent: integer("progress_percent").default(0),
  currentPosition: integer("current_position").default(0),
  isCompleted: boolean("is_completed").default(false),
  timeSpentMinutes: integer("time_spent_minutes").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// User bookmarks
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  summaryId: varchar("summary_id").references(() => summaries.id).notNull(),
  position: integer("position").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User notes
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  summaryId: varchar("summary_id").references(() => summaries.id).notNull(),
  content: text("content").notNull(),
  position: integer("position"),
  isPrivate: boolean("is_private").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User subscriptions history
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'free_trial', 'monthly', 'yearly'
  status: varchar("status").notNull(), // 'active', 'cancelled', 'expired'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("IDR"),
  paymentId: varchar("payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  readingSessions: many(readingSessions),
  bookmarks: many(bookmarks),
  notes: many(notes),
  subscriptions: many(subscriptions),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  books: many(books),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  books: many(books),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  author: one(authors, {
    fields: [books.authorId],
    references: [authors.id],
  }),
  category: one(categories, {
    fields: [books.categoryId],
    references: [categories.id],
  }),
  summaries: many(summaries),
}));

export const summariesRelations = relations(summaries, ({ one, many }) => ({
  book: one(books, {
    fields: [summaries.bookId],
    references: [books.id],
  }),
  readingSessions: many(readingSessions),
  bookmarks: many(bookmarks),
  notes: many(notes),
}));

export const readingSessionsRelations = relations(readingSessions, ({ one }) => ({
  user: one(users, {
    fields: [readingSessions.userId],
    references: [users.id],
  }),
  summary: one(summaries, {
    fields: [readingSessions.summaryId],
    references: [summaries.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  summary: one(summaries, {
    fields: [bookmarks.summaryId],
    references: [summaries.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  summary: one(summaries, {
    fields: [notes.summaryId],
    references: [summaries.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertAuthorSchema = createInsertSchema(authors).omit({
  id: true,
  createdAt: true,
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSummarySchema = createInsertSchema(summaries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReadingSessionSchema = createInsertSchema(readingSessions).omit({
  id: true,
  startedAt: true,
  lastAccessedAt: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Author = typeof authors.$inferSelect;
export type Book = typeof books.$inferSelect;
export type Summary = typeof summaries.$inferSelect;
export type ReadingSession = typeof readingSessions.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertAuthor = z.infer<typeof insertAuthorSchema>;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type InsertReadingSession = z.infer<typeof insertReadingSessionSchema>;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Extended types for API responses
export type BookWithDetails = Book & {
  author: Author | null;
  category: Category | null;
  summaries: Summary[];
};

export type SummaryWithBook = Summary & {
  book: BookWithDetails;
};

export type ReadingSessionWithSummary = ReadingSession & {
  summary: SummaryWithBook;
};

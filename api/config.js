// Public settings the browser needs to talk to the database. The anon key is safe to expose:
// row-level security in supabase/schema.sql decides what each user can read and write.
export default function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  res.status(200).json({ url: process.env.SUPABASE_URL || '', anonKey: process.env.SUPABASE_ANON_KEY || '', voice: !!process.env.OPENAI_API_KEY, plan: true });
}

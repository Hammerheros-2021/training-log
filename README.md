# Training Log: setting it up for a trial

This is the standalone version of the training app. Each person signs up with their own email and password, answers a short questionnaire, and gets their own 16-week plan and nutrition targets. Everything they log is private to their account.

It runs on three services, all with free tiers except the AI:

| Service | What it does | Cost for a small trial |
|---|---|---|
| **Supabase** | Logins and the database | Free |
| **Vercel** | Hosts the app and its web address | Free (Hobby plan, non-commercial) |
| **Anthropic** | The AI behind dictation, photo reading, food estimates, meal plans and the coach overview | Pay as you go. Set a monthly limit. |
| **OpenAI** | Turns hold-to-talk voice recordings into text | Pay as you go, a small amount per minute of talking. Set a monthly limit. |

Allow about 45 minutes the first time. You need a laptop for setup; after that, everything works on phones.

---

## 1. Database and logins (Supabase)

1. Go to **supabase.com** and sign up (GitHub or email).
2. Click **New project**. Name it `training-log`, choose a strong database password (save it somewhere), pick the **West EU (Ireland)** region, then **Create**.
3. When it's ready, open **SQL Editor** in the left menu, click **New query**, paste in everything from `supabase/schema.sql`, and click **Run**. You should see "Success".
4. Open **Authentication → Sign In / Providers → Email**. For an easy trial, switch **Confirm email** off, then save. (Leave it on if you want people to confirm their email first.)
5. Open **Project Settings → API Keys** (or **Data API**). Keep this tab open: you'll copy the **Project URL** and the **anon public** key in step 4. Newer projects call it the **Publishable key**; either works.

## 2. The AI key (Anthropic)

1. Go to **console.anthropic.com** and sign up.
2. Under **Billing**, add credit (€10–20 is plenty for a trial) and set a **monthly spend limit**.
3. Under **API keys**, create a key and copy it. You only see it once.

## 2b. The voice key (OpenAI)

This powers the **Hold to talk** button, which works the same on iPhone and Android. Without it, the app falls back to the phone's own speech recognition, which works on Android but is unreliable on iPhone.

1. Go to **platform.openai.com** and sign up.
2. Under **Billing**, add a small amount of credit (€5–10) and set a **monthly limit**.
3. Under **API keys**, create a key and copy it.

## 3. Put the code on GitHub

1. Sign up at **github.com** if you don't have an account.
2. Click **New repository**. Name it `training-log` and set it to **Private**, then create it.
3. Click **uploading an existing file** and drag in **everything from this folder**: `index.html`, `app.js`, `manifest.json`, `icon.svg`, `package.json`, `vercel.json`, `README.md` and the `api` and `supabase` folders. Click **Commit changes**.

## 4. Put it online (Vercel)

1. Go to **vercel.com** and sign up with your GitHub account.
2. Click **Add New → Project** and import `training-log`. Leave the framework as **Other**.
3. Open **Environment Variables** and add these:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | Project URL from Supabase |
   | `SUPABASE_ANON_KEY` | anon public (or Publishable) key from Supabase |
   | `ANTHROPIC_API_KEY` | the key from Anthropic |
   | `OWNER_EMAIL` | the email you'll sign up with |
   | `OPENAI_API_KEY` | the key from OpenAI (for hold-to-talk) |
   | `ANTHROPIC_MODEL` | `claude-sonnet-5-5` (optional) |

4. Click **Deploy**. When it finishes you get an address like `training-log-xxxx.vercel.app`.
5. Back in Supabase, go to **Authentication → URL Configuration**, set **Site URL** to that address, and save. Password-reset emails then link back to the app.

## 5. Your own account

1. Open the address on your phone and tap **Create account**.
2. On the last sign-up step you'll see an **Owner shortcut**: tap **Load my original plan** to get the Road to February plan and your nutrition guide, instead of building a new one.
3. Make yourself the admin so you can read testers' feedback. In Supabase **SQL Editor**, run this with your own email:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```

4. On iPhone, tap **Share → Add to Home Screen** (on Android, **⋮ → Add to Home screen**) so it opens like an app.

## 6. Invite friends

Send them the address. They create an account, answer the questions, and Claude builds their plan.

They send feedback from the round **profile button** on the Dashboard (top right). You read all of it in the same place.

Before they sign up, tell them two things:
- You can see the database as its administrator, so their logs aren't hidden from you there.
- Their AI use runs on your Anthropic account.

## Notes

- **Dictation:** every voice box has a **Hold to talk** button. Hold it and talk, or tap once to start and again to stop (up to 3 minutes). The first time, the phone asks permission to use the microphone; tap **Allow**. The recording is turned into text and isn't stored.
- **Photos** (meals, class boards) are sent to Claude to read and aren't stored.
- **Changing the app:** edit the files on GitHub and Vercel redeploys automatically within a minute.
- **If something fails,** the Vercel dashboard's **Logs** tab shows errors from the AI function.

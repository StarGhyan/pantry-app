# Pantry

A nutrition planner: track foods, build recipes from them, and plan your week.
Works on phone and desktop, photos use your camera, and everything is saved
to a real database so it stays in sync across devices.

## What you need

- A free [Supabase](https://supabase.com) account (database + photo storage)
- Your existing GitHub and Vercel accounts

Total setup time: about 10 minutes, once.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → sign in → **New project**.
2. Name it anything (e.g. `pantry`), pick a database password (save it
   somewhere, you won't need it day-to-day), pick the region closest to you.
3. Wait ~2 minutes for it to finish provisioning.

## 2. Run the database schema

1. In your new Supabase project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase_schema.sql` from this project, copy the whole file, paste
   it into the editor, and click **Run**.
4. You should see "Success. No rows returned." This creates the tables and
   seeds the 9 default categories (Meat, Fish & seafood, Protein, Vegetables,
   Dairy, Grains, Fruit, Seasoning, Oils).

## 3. Create the photo storage bucket

1. In Supabase, open **Storage** in the left sidebar.
2. Click **New bucket**.
3. Name it exactly `pantry-images` (the code expects this name).
4. Toggle **Public bucket** to ON (this lets photos load directly without
   extra auth — fine for a personal app; don't store anything sensitive).
5. Click **Create bucket**.

## 4. Get your API keys

1. In Supabase, open **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.

## 5. Run it locally first (recommended, optional)

```bash
npm install
cp .env.local.example .env.local
```

Open `.env.local` and paste in your Project URL and anon key from step 4.

```bash
npm run dev
```

Open `http://localhost:3000` — you should see the pantry with no foods yet.
Add one to confirm the database connection works before deploying.

## 6. Push to GitHub

```bash
git init
git add .
git commit -m "Pantry app"
gh repo create pantry-app --private --source=. --push
```

(If you don't have the `gh` CLI, create an empty repo on github.com instead,
then `git remote add origin <your-repo-url>` and `git push -u origin main`.)

## 7. Deploy on Vercel

```bash
npx vercel
```

Follow the prompts (link to your Vercel account, accept the defaults). When
it asks about environment variables, or once the project exists on
vercel.com, go to **Project Settings → Environment Variables** and add:

- `NEXT_PUBLIC_SUPABASE_URL` → your Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your anon public key

Then redeploy (`npx vercel --prod`, or just push to GitHub again if you
connected the repo through the Vercel dashboard — it auto-deploys on push).

## 8. Add it to your phone's home screen

Open the Vercel URL on your phone in Safari (iOS) or Chrome (Android):

- **iPhone**: tap the Share icon → **Add to Home Screen**
- **Android**: tap the **⋮** menu → **Add to Home screen** / **Install app**

It'll now open full-screen like a normal app, and the data is the same
database your PC uses — no more mismatched versions between devices.

## Notes

- Photos use `capture="environment"` so phones open the camera directly;
  desktops fall back to a normal file picker.
- There's no login system — anyone with your Supabase URL and anon key
  could read or write your data. That's an acceptable tradeoff for a single
  person's personal pantry tracker, but don't reuse this schema for
  anything involving other people's data without adding real authentication
  (Supabase Auth is the natural next step if you ever want that).
- All styling is plain inline styles, in `app/page.js` — no Tailwind, no
  CSS framework, so it's easy to keep editing further.

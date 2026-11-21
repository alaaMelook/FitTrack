# FitTrack

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

Apply `supabase/migrations/202611210001_nutrition_workouts_measurements.sql` in Supabase SQL Editor before testing the new modules.

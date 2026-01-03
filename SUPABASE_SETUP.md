# Update Your Database URL for Supabase

## 1. Get Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Click on the **Settings** icon (gear) in the left sidebar
3. Click on **Database**
4. Find the **Connection string** section
5. Copy the **URI** (it starts with `postgresql://postgres:`)

It should look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## 2. Update Your Local .env File

Replace the DATABASE_URL in your `.env` file with the Supabase connection string:

```bash
# Old (remove this)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bountyboard

# New (add your Supabase URL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## 3. Test the Connection

After updating the .env file, run:

```bash
# Create tables in Supabase
npm run db:push

# If successful, populate with test data
npm run seed
```

## 4. Add to Vercel Environment Variables

1. Go to: https://vercel.com/mbark223/bountyboard/settings/environment-variables
2. Add a new variable:
   - Name: `DATABASE_URL`
   - Value: [Your Supabase connection string]
   - Environment: Production, Preview, Development
3. Click "Save"

## 5. Redeploy

Push any small change to trigger a new deployment:

```bash
git add .
git commit -m "Configure Supabase database"
git push origin main
```

Your app will be live at your Vercel URL once the deployment completes!
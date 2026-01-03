# Updating Your Database URL

## Format:
```
postgres://postgres:[YOUR-PASSWORD]@db.eqkmnwshqaebilojmrjt.supabase.co:6543/postgres
```

## Steps:

1. **Get your database password**:
   - It's the password you see in the "Database Settings" page
   - Or the one you used when you first set up your Supabase project
   - You can reset it if needed using "Reset database password"

2. **Replace [YOUR-PASSWORD]** with your actual password:
   ```
   postgres://postgres:your-actual-password-here@db.eqkmnwshqaebilojmrjt.supabase.co:6543/postgres
   ```

3. **In Vercel**:
   - Go to your project settings
   - Navigate to Environment Variables
   - Update `DATABASE_URL` with the complete connection string (including password)
   - Deploy your changes

## Important:
- Don't commit this URL with the password to your code
- Always use environment variables
- The password is required for the connection to work

## Example (not real password):
```
postgres://postgres:my$ecureP@ssw0rd123@db.eqkmnwshqaebilojmrjt.supabase.co:6543/postgres
```

Note: If your password contains special characters like @, #, or $, you may need to URL-encode them.
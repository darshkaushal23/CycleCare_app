# Saheli Circle setup

1. In Supabase → Authentication → Providers, enable **Anonymous sign-ins**.
2. Copy .env.example to .env.local and enter the project's public publishable key (never a service-role key).
3. Run `npm install` and `npm run dev`.
4. Visit **Community** from CycleCare navigation.
5. New users choose a teen/adult space; submissions remain pending until moderation.

## Moderator setup
The first moderator must be assigned manually by an authorized project administrator in Supabase SQL editor. After the anonymous user has joined, look up their user UUID in public.circle_members and run:
```sql
insert into public.circle_staff(user_id,is_doctor) values ('REPLACE_WITH_TRUSTED_USER_UUID',false);
```
Only assign is_doctor=true after verifying professional credentials. Never put staff permissions in frontend code.

## Important limitations
- Age is self-declared, not verified.
- Address redaction is heuristic; moderators must review submissions carefully.
- Anonymous session deletion can make posts inaccessible to their author.
- No real clinician has verified any community answer.
- No public launch before moderation workflow and RLS are tested with multiple accounts.
- Ten fictional discussion prompts are available as sample content in the source; they are not real users.

Only community content is uploaded. Cycle records remain in local IndexedDB.

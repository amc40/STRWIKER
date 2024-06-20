# STRWIKER

Tech:

- Typescript
- NextJS for website + backend logic ([server actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) and [route handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers))
- Prisma for DB schema management / ORM
- Supabase for hosting the database + realtime functionality
- Devcontainer for local development
- Eslint and prettier for linting / formatting
- Github actions for pipeline
- Vercel for deploying the site
- Terraform (currently only used for Vercel project)

## Zero 2 Hero

1. Create [`.env`](./.env) file by copying [`.env.example`](./.env.example)
   1. Fill in `NEXT_PUBLIC_SUPABASE_ANON_KEY` by running `supabase status` and copying the value of `anon key` (supabase should already have started during devcontainer setup)
1. Push the schema to the local database and seed it by running `npx prisma db push && npx prisma db seed`
1. Run the application using `npm run dev`
1. If you want to inspect the supabase project (e.g. DB table contents) you can do so at http://127.0.0.1:54323

## TODO

- [ ] Use terraform to create github repo with sensible configuration
- [ ] Add e2e testing (using playwright?)
- [ ] Fix drag-drop offset from cursor on mobile due to drag and drop inside
- [ ] Add skip turn button for players not on the table
- [ ] Add an easy way to start a game with the same players
- [ ] Fix formatting of end of game tables on mobile
- [ ] Show changes in player rankings based on ELO at end of the game
- [ ] Add stat for how much you increase a partner's performance
- [ ] Add magic link auth / login
- [ ] Add easy flow for joining game as blue or red team using QR / NFC
- [ ] Improve error handling by showing a message to the user, rather than just logging to the console
- [ ] Provision supabase using terraform

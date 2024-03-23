# NextJS Boilerplate

A template for Next JS projects.

It uses:

- Prisma for schema management
- Devcontainer for development
- Eslint and prettier for linting
- Azure for oauth authentication
- Github actions
- Vercel for deploying the site

## Manual Setup Steps

1. Create workspace in [Terraform Cloud](https://app.terraform.io/) and link to repository
1. Create [`.env`](./.env) file
   1. Generate planetscale login
   1. Fill in `DATABASE_URL`
   1. Generate `NEXTAUTH_SECRET` and fill in
   1. Fill in Azure Environment variables
1. Configure Vercel project environment variables
   1. Generate new planetscale login
   1. Fill in `DATABASE_URL`
   1. Generate `NEXTAUTH_SECRET` and fill in
   1. Set `NEXTAUTH_URL` to the one allocated by Vercel
1. If running terraform locally create [`.tfvars`](terraform/terraform.tfvars) file providing values for variables from [`variables.tf`](terraform/variables.tf)
1. Add the Github environment variables listed on this project (see [here](https://github.com/amc40/NextJS-Boilerplate/settings/secrets/actions)) to the forked repo

## TODO

- [ ] Fix issue with duplicate player being added
- [ ] Integrate prisma workflow with planetscale (shouldn't be using prod data in preview deployments)
- [ ] Use terraform to create github repo with sensible configuration
- [ ] Add e2e testing (using playwright?)
- [ ] Fix drag-drop offset from cursor on mobile due to drag and drop inside swiper
- [ ] Add skip turn button
- [ ] Add an easy way to start a game with the same players
- [ ] Show number of goals scored at end of game
- [ ] Show changes in player rankings based on ELO at end of the game
- [ ] Add stat for how much you increase a partner's performance
- [ ] Add magic link auth / login
- [ ] Add easy flow for joining game as blue or red team using QR / NFC
- [ ] Improve error handling by showing a message to the user, rather than just logging to the console

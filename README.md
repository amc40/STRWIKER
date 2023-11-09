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

- [x] Determine why there is a server error when deploying to vercel
- [ ] Integrate prisma workflow with planetscale
- [ ] Add github auth provider
- [ ] Integrate prisma workflow with planetscale (shouldn't be using prod data in preview deployments)
- [ ] Use terraform to create github repo with sensible configuration
- [ ] Use terraform to create Azure App Registration and similar in GitHub
- [ ] Figure out how to allow authentication for preview deployments (shouldn't use wildcards for oath redirects) (can this be added on deployment with terraform??)
- [ ] Add e2e testing (using playwright?)
- [ ] Set up monitoring / alerting (new relic)
- [ ] Traffic mirroring?

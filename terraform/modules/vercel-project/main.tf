terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.3"
    }
  }
}

resource "vercel_project" "vercel_project_with_github" {
  name      = lower(var.github_repository_name)
  framework = "nextjs"
  git_repository = {
    type = "github"
    repo = "amc40/${var.github_repository_name}"
  }
  serverless_function_region = "lhr1"
}

# Supabase environment variables
resource "vercel_project_environment_variable" "postgres_prisma_url" {
  count      = var.postgres_prisma_url != null ? 1 : 0
  project_id = vercel_project.vercel_project_with_github.id
  key        = "POSTGRES_PRISMA_URL"
  value      = var.postgres_prisma_url
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "postgres_url_non_pooling" {
  count      = var.postgres_url_non_pooling != null ? 1 : 0
  project_id = vercel_project.vercel_project_with_github.id
  key        = "POSTGRES_URL_NON_POOLING"
  value      = var.postgres_url_non_pooling
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "supabase_url" {
  count      = var.supabase_url != null ? 1 : 0
  project_id = vercel_project.vercel_project_with_github.id
  key        = "NEXT_PUBLIC_SUPABASE_URL"
  value      = var.supabase_url
  target     = ["production", "preview"]
}

resource "vercel_project_environment_variable" "supabase_anon_key" {
  count      = var.supabase_anon_key != null ? 1 : 0
  project_id = vercel_project.vercel_project_with_github.id
  key        = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  value      = var.supabase_anon_key
  target     = ["production", "preview"]
  sensitive  = true
}


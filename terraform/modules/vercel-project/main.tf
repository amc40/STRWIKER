terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
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

# Production environment variables (point to production Supabase)
resource "vercel_project_environment_variable" "postgres_prisma_url" {
  project_id = vercel_project.vercel_project_with_github.id
  key        = "POSTGRES_PRISMA_URL"
  value      = var.postgres_prisma_url
  target     = ["production"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "postgres_url_non_pooling" {
  project_id = vercel_project.vercel_project_with_github.id
  key        = "POSTGRES_URL_NON_POOLING"
  value      = var.postgres_url_non_pooling
  target     = ["production"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "supabase_url" {
  project_id = vercel_project.vercel_project_with_github.id
  key        = "NEXT_PUBLIC_SUPABASE_URL"
  value      = var.supabase_url
  target     = ["production"]
}

resource "vercel_project_environment_variable" "supabase_anon_key" {
  project_id = vercel_project.vercel_project_with_github.id
  key        = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  value      = var.supabase_anon_key
  target     = ["production"]
  sensitive  = true
}

# Preview environment variables (point to staging Supabase)
resource "vercel_project_environment_variable" "staging_postgres_prisma_url" {
  project_id = vercel_project.vercel_project_with_github.id
  key        = "POSTGRES_PRISMA_URL"
  value      = var.staging_postgres_prisma_url
  target     = ["preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "staging_postgres_url_non_pooling" {
  project_id = vercel_project.vercel_project_with_github.id
  key        = "POSTGRES_URL_NON_POOLING"
  value      = var.staging_postgres_url_non_pooling
  target     = ["preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "staging_supabase_url" {
  project_id = vercel_project.vercel_project_with_github.id
  key        = "NEXT_PUBLIC_SUPABASE_URL"
  value      = var.staging_supabase_url
  target     = ["preview"]
}

resource "vercel_project_environment_variable" "staging_supabase_anon_key" {
  project_id = vercel_project.vercel_project_with_github.id
  key        = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  value      = var.staging_supabase_anon_key
  target     = ["preview"]
  sensitive  = true
}

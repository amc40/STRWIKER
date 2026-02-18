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

# Supabase environment variables — one resource per env var, iterated over target environments
resource "vercel_project_environment_variable" "postgres_prisma_url" {
  for_each   = var.env_config
  project_id = vercel_project.vercel_project_with_github.id
  key        = "POSTGRES_PRISMA_URL"
  value      = each.value.postgres_prisma_url
  target     = [each.key]
  sensitive  = true
}

resource "vercel_project_environment_variable" "postgres_url_non_pooling" {
  for_each   = var.env_config
  project_id = vercel_project.vercel_project_with_github.id
  key        = "POSTGRES_URL_NON_POOLING"
  value      = each.value.postgres_url_non_pooling
  target     = [each.key]
  sensitive  = true
}

resource "vercel_project_environment_variable" "supabase_url" {
  for_each   = var.env_config
  project_id = vercel_project.vercel_project_with_github.id
  key        = "NEXT_PUBLIC_SUPABASE_URL"
  value      = each.value.supabase_url
  target     = [each.key]
}

resource "vercel_project_environment_variable" "supabase_anon_key" {
  for_each   = var.env_config
  project_id = vercel_project.vercel_project_with_github.id
  key        = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  value      = each.value.supabase_anon_key
  target     = [each.key]
  sensitive  = true
}

# State migration: move the pre-existing (unkeyed) production resources
# into the new for_each-keyed resources.
moved {
  from = vercel_project_environment_variable.postgres_prisma_url
  to   = vercel_project_environment_variable.postgres_prisma_url["production"]
}

moved {
  from = vercel_project_environment_variable.postgres_url_non_pooling
  to   = vercel_project_environment_variable.postgres_url_non_pooling["production"]
}

moved {
  from = vercel_project_environment_variable.supabase_url
  to   = vercel_project_environment_variable.supabase_url["production"]
}

moved {
  from = vercel_project_environment_variable.supabase_anon_key
  to   = vercel_project_environment_variable.supabase_anon_key["production"]
}

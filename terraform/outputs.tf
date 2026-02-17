# Vercel outputs
output "vercel_project_name" {
  description = "Vercel project name"
  value       = module.vercel_project_custom.project_name
}

output "vercel_project_id" {
  description = "Vercel project ID"
  value       = module.vercel_project_custom.project_id
}

# Supabase production outputs
output "supabase_project_id" {
  description = "Supabase project ID"
  value       = module.supabase_project.project_id
}

output "supabase_api_url" {
  description = "Supabase API URL (NEXT_PUBLIC_SUPABASE_URL)"
  value       = module.supabase_project.api_url
}

# Environment variables output (sensitive)
output "environment_variables" {
  description = "Environment variables to add to .env file"
  value = {
    POSTGRES_PRISMA_URL           = module.supabase_project.postgres_prisma_url
    POSTGRES_URL_NON_POOLING      = module.supabase_project.postgres_url_non_pooling
    NEXT_PUBLIC_SUPABASE_URL      = module.supabase_project.api_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY = module.supabase_project.anon_key
  }
  sensitive = true
}

# Supabase staging outputs
output "supabase_staging_project_id" {
  description = "Supabase staging project ID"
  value       = module.supabase_staging_project.project_id
}

output "supabase_staging_api_url" {
  description = "Supabase staging API URL"
  value       = module.supabase_staging_project.api_url
}

output "staging_environment_variables" {
  description = "Staging environment variables (for GitHub Actions secrets)"
  value = {
    POSTGRES_PRISMA_URL           = module.supabase_staging_project.postgres_prisma_url
    POSTGRES_URL_NON_POOLING      = module.supabase_staging_project.postgres_url_non_pooling
    NEXT_PUBLIC_SUPABASE_URL      = module.supabase_staging_project.api_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY = module.supabase_staging_project.anon_key
  }
  sensitive = true
}

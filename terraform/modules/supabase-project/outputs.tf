output "project_id" {
  description = "Supabase project ID (ref)"
  value       = supabase_project.main.id
}

output "project_name" {
  description = "Supabase project name"
  value       = supabase_project.main.name
}

output "database_host" {
  description = "Database host"
  value       = "aws-0-${var.region}.pooler.supabase.com"
}

output "database_name" {
  description = "Database name"
  value       = "postgres"
}

output "database_user" {
  description = "Database user"
  value       = "postgres.${supabase_project.main.id}"
}

output "database_password" {
  description = "Database password"
  value       = var.database_password
  sensitive   = true
}

output "database_port" {
  description = "Database port"
  value       = "6543"
}

output "api_url" {
  description = "Supabase API URL (for NEXT_PUBLIC_SUPABASE_URL)"
  value       = "https://${supabase_project.main.id}.supabase.co"
}

output "anon_key" {
  description = "Supabase anonymous key (for NEXT_PUBLIC_SUPABASE_ANON_KEY)"
  value       = data.supabase_apikeys.main.anon_key
  sensitive   = true
}

output "service_role_key" {
  description = "Supabase service role key (admin access - keep secret)"
  value       = data.supabase_apikeys.main.service_role_key
  sensitive   = true
}

# Convenience outputs for Prisma connection strings
output "postgres_prisma_url" {
  description = "PostgreSQL connection string for Prisma (pooled)"
  value       = "postgresql://postgres.${supabase_project.main.id}:${var.database_password}@aws-1-${var.region}.pooler.supabase.com:6543/postgres?pgbouncer=true"
  sensitive   = true
}

output "postgres_url_non_pooling" {
  description = "PostgreSQL connection string for Prisma migrations (direct)"
  value       = "postgresql://postgres.${supabase_project.main.id}:${var.database_password}@aws-1-${var.region}.pooler.supabase.com:5432/postgres"
  sensitive   = true
}

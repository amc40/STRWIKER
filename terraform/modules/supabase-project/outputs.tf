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
  value       = supabase_project.main.database.host
}

output "database_name" {
  description = "Database name"
  value       = supabase_project.main.database.name
}

output "database_user" {
  description = "Database user"
  value       = supabase_project.main.database.user
}

output "database_password" {
  description = "Database password"
  value       = var.database_password
  sensitive   = true
}

output "database_port" {
  description = "Database port"
  value       = supabase_project.main.database.port
}

output "api_url" {
  description = "Supabase API URL (for NEXT_PUBLIC_SUPABASE_URL)"
  value       = supabase_project.main.api_url
}

output "anon_key" {
  description = "Supabase anonymous key (for NEXT_PUBLIC_SUPABASE_ANON_KEY)"
  value       = supabase_project.main.anon_key
  sensitive   = true
}

output "service_role_key" {
  description = "Supabase service role key (admin access - keep secret)"
  value       = supabase_project.main.service_role_key
  sensitive   = true
}

# Convenience outputs for Prisma connection strings
output "postgres_prisma_url" {
  description = "PostgreSQL connection string for Prisma (pooled)"
  value       = "postgresql://${supabase_project.main.database.user}:${var.database_password}@${supabase_project.main.database.host}:${supabase_project.main.database.port}/${supabase_project.main.database.name}?pgbouncer=true"
  sensitive   = true
}

output "postgres_url_non_pooling" {
  description = "PostgreSQL connection string for Prisma migrations (direct)"
  value       = "postgresql://${supabase_project.main.database.user}:${var.database_password}@${supabase_project.main.database.host}:${supabase_project.main.database.port}/${supabase_project.main.database.name}"
  sensitive   = true
}

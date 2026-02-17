variable "github_repository_name" {
  description = "The name of the GitHub repository"
  type        = string
  nullable    = false
}

variable "postgres_prisma_url" {
  description = "PostgreSQL connection string for Prisma (pooled)"
  type        = string
  sensitive   = true
  default     = null
}

variable "postgres_url_non_pooling" {
  description = "PostgreSQL connection string for migrations (direct)"
  type        = string
  sensitive   = true
  default     = null
}

variable "supabase_url" {
  description = "Supabase API URL"
  type        = string
  default     = null
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
  default     = null
}

# Staging environment variables (for preview deployments)
variable "staging_postgres_prisma_url" {
  description = "PostgreSQL connection string for Prisma (pooled) - staging"
  type        = string
  sensitive   = true
  default     = null
}

variable "staging_postgres_url_non_pooling" {
  description = "PostgreSQL connection string for migrations (direct) - staging"
  type        = string
  sensitive   = true
  default     = null
}

variable "staging_supabase_url" {
  description = "Supabase API URL - staging"
  type        = string
  default     = null
}

variable "staging_supabase_anon_key" {
  description = "Supabase anonymous key - staging"
  type        = string
  sensitive   = true
  default     = null
}

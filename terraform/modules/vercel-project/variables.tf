variable "github_repository_name" {
  description = "The name of the GitHub repository"
  type        = string
  nullable    = false
}

variable "env_config" {
  description = "Supabase connection config per Vercel target environment (e.g. production, preview)"
  type = map(object({
    postgres_prisma_url      = string
    postgres_url_non_pooling = string
    supabase_url             = string
    supabase_anon_key        = string
  }))
}

variable "vercel_api_token" {
  description = "Full-Access Vercel API token obtained from https://vercel.com/account/tokens."
  type        = string
  sensitive   = true
  nullable    = false
}

variable "github_owner" {
  description = "The GitHub organization or user that owns the repository"
  type        = string
  nullable    = false
}

variable "github_repository_name" {
  description = "The name of the GitHub repository"
  type        = string
  nullable    = false
}

variable "github_token" {
  description = "GitHub Personal Access Token with repo and admin:repo_hook permissions"
  type        = string
  sensitive   = true
  nullable    = false
}

variable "supabase_access_token" {
  description = "Supabase access token obtained from https://supabase.com/dashboard/account/tokens"
  type        = string
  sensitive   = true
  nullable    = false
}

variable "supabase_organization_id" {
  description = "Supabase organization ID from https://supabase.com/dashboard/org/_/general"
  type        = string
  nullable    = false
}

variable "supabase_database_password" {
  description = "PostgreSQL database password (min 8 characters)"
  type        = string
  sensitive   = true
  nullable    = false
}

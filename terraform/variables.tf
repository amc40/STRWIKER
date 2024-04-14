variable "vercel_api_token" {
  description = "Full-Access Vercel API token obtained from https://vercel.com/account/tokens."
  type        = string
  sensitive   = true
  nullable    = false
}

variable "supabase_access_token" {
  description = "Supabase access token obtained from https://supabase.com/dashboard/account/tokens."
  type        = string
  sensitive   = true
  nullable    = false
}

variable "supabase_organisation_id" {
  description = "Supabase organization slug. Can be found under 'Organizations' at https://supabase.com/dashboard"
  type        = string
  nullable    = false
}

variable "github_repository_name" {
  description = "The name of the GitHub repository"
  type        = string
  nullable    = false
}

variable "database_user" {
  description = "The user that will be used to access the database."
  type        = string
  nullable    = false
}

variable "database_password" {
  description = "The password that will be used to access the database."
  type        = string
  sensitive   = true
  nullable    = false
}

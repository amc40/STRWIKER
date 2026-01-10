variable "organization_id" {
  description = "Supabase organization ID (found at https://supabase.com/dashboard/org/_/general)"
  type        = string
  nullable    = false
}

variable "project_name" {
  description = "Name for the Supabase project"
  type        = string
  nullable    = false
}

variable "database_password" {
  description = "PostgreSQL database password (min 8 characters)"
  type        = string
  sensitive   = true
  nullable    = false

  validation {
    condition     = length(var.database_password) >= 8
    error_message = "Database password must be at least 8 characters long."
  }
}

variable "region" {
  description = "AWS region for the Supabase project (e.g., eu-west-2 for UK South)"
  type        = string
  nullable    = false

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]$", var.region))
    error_message = "Region must be a valid AWS region code (e.g., eu-west-2)."
  }
}

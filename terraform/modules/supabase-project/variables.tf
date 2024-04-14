variable "project_name" {
  description = "The name of the Supabase project"
  type        = string
  nullable    = false
}

variable "supabase_organisation_id" {
  description = "Supabase organization slug. Can be found under 'Organizations' at https://supabase.com/dashboard"
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

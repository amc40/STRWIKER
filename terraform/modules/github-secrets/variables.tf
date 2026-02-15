variable "repository_name" {
  description = "The name of the GitHub repository (format: owner/repo)"
  type        = string
  nullable    = false
}

variable "environment_name" {
  description = "The name of the GitHub Actions environment"
  type        = string
  default     = "production"
  nullable    = false
}

variable "postgres_prisma_url" {
  description = "PostgreSQL connection string for Prisma (pooled)"
  type        = string
  sensitive   = true
  nullable    = false
}

variable "postgres_url_non_pooling" {
  description = "PostgreSQL connection string for Prisma migrations (direct)"
  type        = string
  sensitive   = true
  nullable    = false
}

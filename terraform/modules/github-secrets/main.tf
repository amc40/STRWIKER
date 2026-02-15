resource "github_actions_environment_secret" "database_url" {
  repository      = var.repository_name
  environment     = var.environment_name
  secret_name     = "DATABASE_URL"
  plaintext_value = var.postgres_prisma_url
}

resource "github_actions_environment_secret" "direct_url" {
  repository      = var.repository_name
  environment     = var.environment_name
  secret_name     = "DIRECT_URL"
  plaintext_value = var.postgres_url_non_pooling
}

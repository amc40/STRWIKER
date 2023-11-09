terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.3"
    }
  }
}

resource "vercel_project" "vercel_project_with_github" {
  name      = lower(var.github_repository_name)
  framework = "nextjs"
  git_repository = {
    type = "github"
    repo = "amc40/${var.github_repository_name}"
  }
  serverless_function_region = "lhr1"
}


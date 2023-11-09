terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.3"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
}

module "vercel_project_custom" {
  source                 = "./modules/vercel-project"
  github_repository_name = var.github_repository_name
}


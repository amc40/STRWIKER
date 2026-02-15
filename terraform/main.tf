terraform {
  cloud {
    organization = "amc40-hobby-projects"

    workspaces {
      name = "STRWIKER"
    }
  }

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
}

provider "supabase" {
  access_token = var.supabase_access_token
}

provider "github" {
  token = var.github_token
  owner = var.github_owner
}

module "supabase_project" {
  source            = "./modules/supabase-project"
  organization_id   = var.supabase_organization_id
  project_name      = "strwiker"
  database_password = var.supabase_database_password
  region            = "eu-west-2"
}

module "vercel_project_custom" {
  source                   = "./modules/vercel-project"
  github_repository_name   = var.github_repository_name
  postgres_prisma_url      = module.supabase_project.postgres_prisma_url
  postgres_url_non_pooling = module.supabase_project.postgres_url_non_pooling
  supabase_url             = module.supabase_project.api_url
  supabase_anon_key        = module.supabase_project.anon_key
}

module "github_secrets" {
  source                   = "./modules/github-secrets"
  repository_name          = "${var.github_owner}/${var.github_repository_name}"
  environment_name         = "production"
  postgres_prisma_url      = module.supabase_project.postgres_prisma_url
  postgres_url_non_pooling = module.supabase_project.postgres_url_non_pooling
}


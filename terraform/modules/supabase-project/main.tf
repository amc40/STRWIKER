resource "supabase_project" "production" {
  organization_id   = var.supabase_organisation_id
  name              = var.project_name
  database_password = var.database_password
  region            = "us-west-2"

  lifecycle {
    ignore_changes = [database_password]
  }
}

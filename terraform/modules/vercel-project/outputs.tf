output "project_name" {
  description = "Vercel project name"
  value       = vercel_project.vercel_project_with_github.name
}

output "project_id" {
  description = "Vercel project ID"
  value       = vercel_project.vercel_project_with_github.id
}

resource "google_artifact_registry_repository" "api" {
  location      = var.region
  repository_id = var.container_repo
  description   = "default repository"
  format        = "DOCKER"
}

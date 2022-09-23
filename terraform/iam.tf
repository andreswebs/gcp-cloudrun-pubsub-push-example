locals {
  db_service_account  = google_service_account.db_cloud_run.email
  api_service_account = google_service_account.api_cloud_run.email
}

locals {

  members = {
    db  = "serviceAccount:${local.db_service_account}"
    api = "serviceAccount:${local.api_service_account}"
  }

}

resource "google_project_iam_member" "log_writers" {
  for_each = local.members
  project  = var.project
  role     = "roles/logging.logWriter"
  member   = each.value
}

resource "google_project_iam_member" "metric_writers" {
  for_each = local.members
  project  = var.project
  role     = "roles/monitoring.metricWriter"
  member   = each.value
}

resource "google_project_iam_member" "tracers" {
  for_each = local.members
  project  = var.project
  role     = "roles/cloudtrace.agent"
  member   = each.value
}

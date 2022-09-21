data "google_project" "project" {}

resource "google_service_account" "db_cloud_run" {
  account_id   = "db-cloud-run"
  display_name = "db"
}

resource "google_cloud_run_service" "db" {
  name     = "db"
  location = var.region
  template {
    spec {
      service_account_name = google_service_account.db_cloud_run_invoker.email

      containers {
        image = var.container_image_db

        env {
          name  = "MONGO_USERNAME"
          value = var.mongodb_username
        }

        env {
          name  = "MONGO_PASSWORD"
          value = var.mongodb_password
        }

        env {
          name  = "MONGO_HOST"
          value = var.mongodb_host
        }

        env {
          name  = "MONGO_DATABASE"
          value = var.mongodb_host
        }

        env {
          name  = "MONGO_PROTO"
          value = var.mongodb_proto
        }

      }
    }
  }
  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_service_account" "db_cloud_run_invoker" {
  account_id   = "cloud-run-pubsub-invoker"
  display_name = "Cloud Run Pub/Sub Invoker"
}


resource "google_secret_manager_secret_iam_member" "mongodb_password_db_cloud_run_invoker" {
  secret_id = google_secret_manager_secret.mongodb_password.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.db_cloud_run_invoker.email}"
}

resource "google_project_iam_binding" "db_cloud_run_invoker" {
  project = var.project
  role    = "roles/iam.serviceAccountTokenCreator"
  members = ["serviceAccount:${google_service_account.db_cloud_run_invoker.email}"]
}

resource "google_cloud_run_service_iam_binding" "db_cloud_run_invoker" {
  location = google_cloud_run_service.db.location
  project  = google_cloud_run_service.db.project
  service  = google_cloud_run_service.db.name
  role     = "roles/run.invoker"
  members  = ["serviceAccount:${google_service_account.db_cloud_run_invoker.email}"]
}

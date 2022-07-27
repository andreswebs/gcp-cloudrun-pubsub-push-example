data "google_project" "project" {}

resource "mongodbatlas_project" "this" {
  org_id = var.mongodb_atlas_org_id
  name   = var.mongodb_atlas_project_name
}

resource "random_password" "mongodb_user" {
  length           = 32
  numeric          = true
  min_numeric      = 1
  upper            = true
  min_upper        = 1
  lower            = true
  min_lower        = 1
  special          = true
  min_special      = 0
  override_special = "_-"
}

resource "google_service_account" "db_cloud_run" {
  account_id   = "db-cloud-run"
  display_name = "db"
}

resource "google_secret_manager_secret" "mongodb_password" {
  secret_id = var.mongodb_password_secret
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "mongodb_password" {
  secret      = google_secret_manager_secret.mongodb_password.id
  secret_data = random_password.mongodb_user.result
}

locals {
  mongodb_database_name = "app"
  mongodb_username      = "app"
}

resource "mongodbatlas_database_user" "mongodb_user" {
  username           = local.mongodb_username
  password           = google_secret_manager_secret_version.mongodb_password.secret_data
  project_id         = mongodbatlas_project.this.id
  auth_database_name = "admin"
  roles {
    role_name     = "readWrite"
    database_name = local.mongodb_database_name
  }
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
          name = "MONGO_PASSWORD"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.mongodb_password.secret_id
              key  = var.mongodb_password_secret_version
            }
          }
        }

        env {
          name  = "MONGO_HOST"
          value = var.mongodb_atlas_host
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

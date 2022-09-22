resource "google_service_account" "db_cloud_run" {
  account_id   = "db-cloud-run"
  display_name = "db"
}

data "google_secret_manager_secret" "mongodb_password" {
  secret_id = var.mongodb_password_secret
}

data "google_secret_manager_secret" "mongodb_tls_ca_crt" {
  secret_id = var.mongodb_tls_ca_crt_secret
}

data "google_secret_manager_secret" "mongodb_tls_crt" {
  secret_id = var.mongodb_tls_crt_secret
}

data "google_secret_manager_secret" "mongodb_tls_key" {
  secret_id = var.mongodb_tls_key_secret
}

resource "google_cloud_run_service" "db" {
  name     = "db"
  location = var.region
  template {

    metadata {
      annotations = merge(
        {
          "autoscaling.knative.dev/maxScale" = "5"
        },
        local.serverless_connector_annotations
      )
    }

    spec {
      service_account_name = google_service_account.db_cloud_run_invoker.email

      containers {
        image = var.container_image_db

        env {
          name  = "MONGO_USERNAME"
          value = var.mongodb_username
        }

        env {
          name = "MONGO_PASSWORD"
          value_from {
            secret_key_ref {
              name = data.google_secret_manager_secret.mongodb_password.secret_id
              key  = var.mongodb_password_secret_version
            }
          }
        }

        env {
          name  = "MONGO_HOST"
          value = var.mongodb_host
        }

        env {
          name  = "MONGO_DATABASE"
          value = var.mongodb_database
        }

        env {
          name  = "MONGO_PROTO"
          value = var.mongodb_proto
        }

        volume_mounts {
          name       = "mongo-tls-crt"
          mount_path = "/etc/mongodb-tls/tls.crt"
        }

        volume_mounts {
          name       = "mongo-tls-key"
          mount_path = "/etc/mongodb-tls/tls.key"
        }

        volume_mounts {
          name       = "mongo-tls-ca-crt"
          mount_path = "/etc/mongodb-tls/ca.crt"
        }

      }

      volumes {
        name = "mongo-tls-crt"
        secret {
          secret_name  = data.google_secret_manager_secret.mongodb_tls_crt.secret_id
          default_mode = 0640
          items {
            key  = "latest"
            path = "tls.crt"
          }
        }
      }

      volumes {
        name = "mongo-tls-key"
        secret {
          secret_name  = data.google_secret_manager_secret.mongodb_tls_key.secret_id
          default_mode = 0640
          items {
            key  = "latest"
            path = "tls.key"
          }
        }
      }

      volumes {
        name = "mongo-tls-ca-crt"
        secret {
          secret_name  = data.google_secret_manager_secret.mongodb_tls_ca_crt.secret_id
          default_mode = 0640
          items {
            key  = "latest"
            path = "ca.crt"
          }
        }
      }

    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true
}

resource "google_service_account" "db_cloud_run_invoker" {
  account_id   = "cloud-run-pubsub-invoker"
  display_name = "Cloud Run Pub/Sub Invoker"
}

resource "google_secret_manager_secret_iam_member" "mongodb_password_db_cloud_run_invoker" {
  secret_id = data.google_secret_manager_secret.mongodb_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.db_cloud_run_invoker.email}"
}

resource "google_secret_manager_secret_iam_member" "mongodb_tls_ca_crt_db_cloud_run_invoker" {
  secret_id = data.google_secret_manager_secret.mongodb_tls_ca_crt.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.db_cloud_run_invoker.email}"
}

resource "google_secret_manager_secret_iam_member" "mongodb_tls_crt_db_cloud_run_invoker" {
  secret_id = data.google_secret_manager_secret.mongodb_tls_crt.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.db_cloud_run_invoker.email}"
}

resource "google_secret_manager_secret_iam_member" "mongodb_tls_key_db_cloud_run_invoker" {
  secret_id = data.google_secret_manager_secret.mongodb_tls_key.secret_id
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

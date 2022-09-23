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

data "google_secret_manager_secret" "mongodb_tls_key" {
  secret_id = var.mongodb_tls_key_secret
}

data "google_secret_manager_secret" "mongodb_tls_key_password" {
  secret_id = var.mongodb_tls_key_password_secret
}

resource "google_secret_manager_secret_iam_member" "mongodb_password_db_cloud_run" {
  secret_id = data.google_secret_manager_secret.mongodb_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.db_cloud_run.email}"
}

resource "google_secret_manager_secret_iam_member" "mongodb_tls_ca_crt_db_cloud_run" {
  secret_id = data.google_secret_manager_secret.mongodb_tls_ca_crt.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.db_cloud_run.email}"
}

resource "google_secret_manager_secret_iam_member" "mongodb_tls_key_db_cloud_run" {
  secret_id = data.google_secret_manager_secret.mongodb_tls_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.db_cloud_run.email}"
}

resource "google_secret_manager_secret_iam_member" "mongodb_tls_key_password_db_cloud_run" {
  secret_id = data.google_secret_manager_secret.mongodb_tls_key_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.db_cloud_run.email}"
}

locals {
  mongodb_volume_suffix_ca  = "ca"
  mongodb_volume_suffix_pem = "pem"
  mongodb_file_ca_crt       = "ca.crt"
  mongodb_file_tls_pem      = "tls.pem"

  mongob_tls_ca_crt = "${var.mongodb_tls_dir}/${local.mongodb_volume_suffix_ca}/${local.mongodb_file_ca_crt}"
  mongodb_tls_key   = "${var.mongodb_tls_dir}/${local.mongodb_volume_suffix_pem}/${local.mongodb_file_tls_pem}"
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
      service_account_name = google_service_account.db_cloud_run.email

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
          name  = "MONGO_REPLICA_SET"
          value = var.mongodb_replica_set
        }

        env {
          name  = "MONGO_DATABASE"
          value = var.mongodb_database
        }

        env {
          name  = "MONGO_PROTO"
          value = var.mongodb_proto
        }

        env {
          name  = "MONGO_TLS_CA_CRT"
          value = local.mongob_tls_ca_crt
        }

        env {
          name  = "MONGO_TLS_KEY"
          value = local.mongodb_tls_key
        }

        env {
          name = "MONGO_TLS_KEY_PASSWORD"
          value_from {
            secret_key_ref {
              name = data.google_secret_manager_secret.mongodb_tls_key_password.secret_id
              key  = var.mongodb_tls_key_password_secret_version
            }
          }
        }

        ## NOTE: secrets can't be mounted on the same dir
        ## https://cloud.google.com/run/docs/configuring/secrets#disallowed_paths_and_limitations
        volume_mounts {
          name       = "mongo-tls-pem"
          mount_path = "${var.mongodb_tls_dir}/${local.mongodb_volume_suffix_pem}"
        }

        volume_mounts {
          name       = "mongo-tls-ca"
          mount_path = "${var.mongodb_tls_dir}/${local.mongodb_volume_suffix_ca}"
        }

      }

      volumes {
        name = "mongo-tls-pem"
        secret {
          secret_name = data.google_secret_manager_secret.mongodb_tls_key.secret_id
          # default_mode = 0640
          items {
            key  = "latest"
            path = local.mongodb_file_tls_pem
          }
        }
      }

      volumes {
        name = "mongo-tls-ca"
        secret {
          secret_name = data.google_secret_manager_secret.mongodb_tls_ca_crt.secret_id
          # default_mode = 0640
          items {
            key  = "latest"
            path = local.mongodb_file_ca_crt
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

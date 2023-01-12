resource "google_service_account" "api_cloud_run" {
  account_id   = "api-cloud-run"
  display_name = "api"
}

resource "google_pubsub_topic_iam_member" "api_publisher" {
  project = google_pubsub_topic.api_events.project
  topic   = google_pubsub_topic.api_events.name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.api_cloud_run.email}"
}

resource "google_cloud_run_service" "api" {
  provider = google-beta
  name     = "api"
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
      service_account_name = google_service_account.api_cloud_run.email

      containers {
        image = var.container_image_api

        liveness_probe {
          http_get {
            path = "/health"
          }
        }

        env {
          name  = "TOPIC_NAME"
          value = google_pubsub_topic.api_events.name
        }

      }
    }
  }
  traffic {
    percent         = 100
    latest_revision = true
  }
}


// allow unauthorized access to the api service
resource "google_cloud_run_service_iam_member" "api_all_users" {
  location = google_cloud_run_service.api.location
  project  = google_cloud_run_service.api.project
  service  = google_cloud_run_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

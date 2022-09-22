data "google_project" "project" {}

resource "google_pubsub_topic" "api_events" {
  name = var.topic_name
  labels = {
    service = "api"
  }
}

resource "google_pubsub_subscription" "api_events_db" {
  name  = var.topic_name
  topic = google_pubsub_topic.api_events.name
}

resource "google_pubsub_subscription" "api_events_db_push" {
  name  = "${var.topic_name}-push"
  topic = google_pubsub_topic.api_events.name
  push_config {
    push_endpoint = google_cloud_run_service.db.status[0].url
    oidc_token {
      service_account_email = google_service_account.db_cloud_run_invoker.email
    }
    attributes = {
      x-goog-version = "v1"
    }
  }
}

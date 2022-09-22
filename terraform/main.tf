data "google_project" "project" {}

locals {

  serverless_connector_egress = var.serverless_connector_name != null && var.serverless_connector_name != "" ? "all-traffic" : null

  serverless_connector_annotations = {
    "run.googleapis.com/vpc-access-connector" = var.serverless_connector_name
    "run.googleapis.com/vpc-access-egress"    = local.serverless_connector_egress
  }
  
}

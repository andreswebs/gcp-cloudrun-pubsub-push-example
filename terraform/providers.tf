terraform {
  required_providers {

    google = {
      source  = "hashicorp/google"
      version = "~> 4.29.0"
    }

    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "~> 1.4.3"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.3.2"
    }

  }
}

provider "google" {
  credentials = file(var.credentials_file)

  project = var.project
  region  = var.region
  zone    = var.zone
}

data "google_secret_manager_secret_version" "mongod_atlas_key" {
  secret = var.mongodb_atlas_secret
}

provider "mongodbatlas" {
  private_key = data.google_secret_manager_secret_version.mongod_atlas_key.secret_data
  public_key  = var.mongodb_atlas_pubkey
}

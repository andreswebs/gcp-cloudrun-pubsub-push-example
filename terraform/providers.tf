terraform {
  required_providers {

    google = {
      source  = "hashicorp/google"
      version = "~> 4.29.0"
    }

    # mongodbatlas = {
    #   source  = "mongodb/mongodbatlas"
    #   version = "~> 1.4.3"
    # }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.3.2"
    }

  }
}

provider "google" {
  project = var.project
  region  = var.region
  zone    = var.zone
}


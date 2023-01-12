terraform {
  required_version = "~> 1.3"

  required_providers {

    google = {
      source  = "hashicorp/google"
      version = "~> 4.48"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.48"
    }

    # mongodbatlas = {
    #   source  = "mongodb/mongodbatlas"
    #   version = "~> 1.4.3"
    # }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.4"
    }

  }
}

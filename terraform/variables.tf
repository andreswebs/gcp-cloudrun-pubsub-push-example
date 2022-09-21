variable "project" {
  type        = string
  description = "GCP project ID"
}

variable "region" {
  type        = string
  description = "Compute region"
  default     = "europe-west4"
}

variable "zone" {
  type        = string
  description = "Compute zone"
  default     = "europe-west4-a"
}

variable "container_repo" {
  type        = string
  description = "Name of container repository"
  default     = "default"
}

variable "container_image_db" {
  type        = string
  description = "Container image tag"
}

variable "container_image_api" {
  type        = string
  description = "Container image tag"
}

variable "mongodb_username" {
  type        = string
  default     = "app"
  description = "MongoDB username"
}

variable "mongodb_password" {
  type        = string
  description = "MongoDB password"
  sensitive   = true
}

variable "mongodb_host" {
  type        = string
  description = "MongoDB host"
}

variable "mongodb_database" {
  type        = string
  default     = "app"
  description = "MongoDB database name"
}

variable "mongodb_proto" {
  type        = string
  default     = "mongodb"
  description = "MongoDB Protocol"

  validation {
    condition     = can(regex("^mongodb", var.mongodb_proto))
    error_message = "Must begin with `mongodb`."
  }

}

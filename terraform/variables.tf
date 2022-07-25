variable "project" {
  type        = string
  description = "GCP project ID"
}

variable "credentials_file" {
  type        = string
  description = "GCP credentials file"
  default     = "~/.config/gcloud/application_default_credentials.json"
}

variable "region" {
  type        = string
  description = "Compute region"
  default     = "us-central1"
}

variable "zone" {
  type        = string
  description = "Compute zone"
  default     = "us-central1-c"
}

variable "vm_type" {
  type        = string
  description = "VM type"
  default     = "n1-standard-1"
}

variable "ssh_whitelist" {
  type        = list(string)
  description = "List of IP addresses allowed to SSH"
  default     = []
}

variable "container_repo" {
  type        = string
  description = "Name of container repository"
  default     = "default"
}

variable "mongodb_atlas_secret" {
  type        = string
  description = "Name of secret in GCP storing the MongoDB Atlas private access key"
  default     = "mongodb-atlas-key"
}

variable "mongodb_atlas_pubkey" {
  type        = string
  description = "MongoDB Atlas public access key"
}

variable "mongodb_atlas_project_name" {
  type        = string
  description = "MongoDB Atlas project name"
  default     = "data"
}

variable "mongodb_atlas_org_id" {
  type        = string
  description = "MongoDB Cloud organization ID"
}

variable "mongodb_atlas_host" {
  type        = string
  description = "MongoDB Atlas hostname"
}

variable "mongodb_password_secret" {
  type        = string
  description = "Name of secret in GCP that will be created to store the generated MongoDB password"
  default     = "mongodb-password"
}

variable "container_image_db" {
  type        = string
  description = "Container image tag"
}

variable "container_image_api" {
  type        = string
  description = "Container image tag"
}

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

variable "mongodb_atlas_password_secret" {
  type        = string
  description = "Name of secret in GCP that will be created to store the generated MongoDB password"
  default     = "mongodb-password"
}

variable "mongodb_atlas_password_secret_version" {
  type        = string
  description = "MongoDB password secret version"
  default     = "1"
}

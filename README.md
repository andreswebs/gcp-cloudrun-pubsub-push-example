# Serverless GCP Pub/Sub Example

This is an example serverless application running on GCP Cloud Run and using
MongoDB Atlas as a database.

The infrastructure is defined in the [terraform/](terraform) directory.

The applications are in the [app/](app) directory.

The application container images can be built using provided the
[scripts/](scripts).

## Pre-requisites

1. Generate API credentials to access MongoDB Cloud (in 'Access Manager',
   'Organization Access', 'Create API Key')

2. Store the private key in GCP Secret Manager. Default secret name:
   `mongodb-atlas-key`

3. Save the public key in the TF_VAR (or `terraform.tfvars`):
   `mongodb_atlas_pubkey`

Note: the MongoDB Atlas API key will be written in plaintext to the TF state
file.

## Configuration

The following TF_VARs are required:

- `project`: GCP project ID
- `mongodb_atlas_org_id`: MongoDB Atlas organization ID
- `mongodb_atlas_host`: The hostname of the MongoDB Atlas cluster
- `mongodb_atlas_pubkey` The MongoDB cloud API access public key
- `container_image_api`:
- `container_image_db`

Note: This project does not create a MongoDB Atlas cluster. It must be created
manually in the Atlas console. This is because it is not possible to create a
free-tier cluster with the `mongodbatlas` Terraform provider.


## Authors

**Andre Silva** - [@andreswebs](https://github.com/andreswebs)

## License

This project is licensed under the [Unlicense](UNLICENSE.md).

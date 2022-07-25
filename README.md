# Serverless GCP Pub/Sub Example

## Pre-requisites

1. Generate API credentials to access MongoDB Cloud (in 'Access Manager',
   'Organization Access', 'Create API Key')

2. Store the private key in GCP Secret Manager. Default secret name:
   `mongodb-atlas-key`

3. Save the public key in the TF_VAR (or `terraform.tfvars`): `mongodb_atlas_pubkey` 

Note: the MongoDB Atlas API key will be written in plaintext to the TF state
file.

## Configuration

The following TF_VARs are required:

- `project`
- `mongodb_atlas_org_id`
- `mongodb_atlas_secret`
- `mongodb_atlas_pubkey`

## Authors

**Andre Silva** - [@andreswebs](https://github.com/andreswebs)

## License

This project is licensed under the [Unlicense](UNLICENSE.md).

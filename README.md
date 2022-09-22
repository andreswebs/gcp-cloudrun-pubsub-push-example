# Serverless GCP Pub/Sub Example

This is an example serverless application running on GCP Cloud Run and using
MongoDB Atlas as a database:

![GCP Cloud Run PubSub Example](docs/diagrams/gcp-cloud-run-pubsub-example.png "example")

The application consists of a publisher (`app: API`) and a subscriber
(`app: DB`), which publish and read from a GCP Pub/Sub topic (`api-events`). The
`app` components are containers in GCP Cloud Run. The DB application stores data
received from the topic into MongoDB.

The infrastructure is defined in the [terraform/](terraform) directory.

The applications are TypeScripts in the [app/](app) directory.

The application container images can be built using the provided
[scripts/](scripts).

## Build

The build script requires a few environment variables to be set:

```sh
export CLOUDSDK_CORE_PROJECT="<gcp project id>"
export CONTAINER_REPO="<name of GCP container repository, e.g. 'default'>"
```

Build API:

```sh
cd apps/api
../../scripts/gcloud-build.sh api
```

Build DB:

```sh
cd apps/db
../../scripts/gcloud-build.sh db
```

Use the built image tags to populate the relevant Terraform variables (see
below).

## Configuration

The following TF_VARs are required:

- `project`: GCP project ID
- `container_image_api`: container image tag for the API application (in GCP
  Artifact Registry)
- `container_image_db`: container image tag for the DB application (in GCP
  Artifact Registry)

## TODO:

- HTTP load balancer
- Serverless VPC Access connector (for static outbound IP)
- Cloud Run static outbound IP address whitelist in Atlas

## Authors

**Andre Silva** - [@andreswebs](https://github.com/andreswebs)

## License

This project is licensed under the [Unlicense](UNLICENSE.md).

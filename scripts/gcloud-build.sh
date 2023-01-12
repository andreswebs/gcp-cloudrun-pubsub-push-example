#! /usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

CONTAINER_REGISTRY="${CONTAINER_REGISTRY:-europe-docker.pkg.dev}"
CONTAINER_REPO="${CONTAINER_REPO:-default}"

IMAGE_NAME="${1}"
IMAGE_VERSION="${2:-latest}"

IMAGE="${CONTAINER_REGISTRY}/${CLOUDSDK_CORE_PROJECT}/${CONTAINER_REPO}/${IMAGE_NAME}:${IMAGE_VERSION}"

gcloud builds submit --tag "${IMAGE}"

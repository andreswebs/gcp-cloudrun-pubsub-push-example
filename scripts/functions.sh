#!/usr/bin/env bash
function docker_run_gcloud {
  docker run \
    -v "$HOME/.config/gcloud:/gcp/config:ro" \
    -v /gcp/config/logs \
    --env CLOUDSDK_CONFIG="/gcp/config" \
    --env GOOGLE_APPLICATION_CREDENTIALS="/gcp/config/application_default_credentials.json" \
    --env GCLOUD_PROJECT \
    "${@}"
}

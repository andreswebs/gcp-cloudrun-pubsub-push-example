#!/usr/bin/env bash
function docker_run_gcloud {
  docker run \
    --volume "$HOME/.config/gcloud:/gcp/config:ro" \
    --volume /gcp/config/logs \
    --env CLOUDSDK_CORE_PROJECT \
    --env CLOUDSDK_CONFIG="/gcp/config" \
    --env GOOGLE_APPLICATION_CREDENTIALS="/gcp/config/application_default_credentials.json" \
    "${@}"
}

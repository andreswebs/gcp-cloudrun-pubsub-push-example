#!/usr/bin/env bash

# shellcheck disable=SC1090,SC2005

set -o errexit
set -o pipefail
set -o nounset

_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

IMAGE_NAME="${1}"
IMAGE_VERSION="${2:-latest}"

IMAGE_TAG="$("${_SCRIPT_DIR}/config.sh" "${IMAGE_NAME}" "${IMAGE_VERSION}")"

gcloud run deploy \
  --image "${IMAGE_TAG}" \
  --platform managed
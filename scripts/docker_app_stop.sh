#!/bin/bash

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "${script_dir}"

if command -v dos2unix &> /dev/null; then
  echo "converting *.sh files from CRLF to LF"
  dos2unix *.sh &> /dev/null
fi

ENV=../deploy/.env
[ ! -f ${ENV} ] || export $(grep -E '^BRANCH|^PURPOSE' ${ENV} | xargs)  &> /dev/null


pushd "../deploy"
echo "STOPPING SEPARATED DEV DB CONTAINER ${BRANCH:-}${PURPOSE:-}"
docker stop fastparking${BRANCH:-}${PURPOSE:-}-code-1
docker stop fastparking${BRANCH:-}${PURPOSE:-}-api-1
docker stop fastparking${BRANCH:-}${PURPOSE:-}-pg-1
docker-compose  --file docker-compose-project.yml --env-file .env down
popd
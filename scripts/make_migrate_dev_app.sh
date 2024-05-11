#!/bin/bash

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "${script_dir}"

if command -v dos2unix &> /dev/null; then
  echo "converting *.sh files from CRLF to LF"
  dos2unix *.sh &> /dev/null
fi

# # simulate poetry shell
# pushd "../FRONTEND"
# pyact=$(poetry env info -p)
# source ${pyact}/bin/activate
# popd

echo PYTHONPATH=${PYTHONPATH}
pushd "../FRONTEND/fastparking"
echo -e "\nStarting Django makemigrations..."
poetry run python manage.py makemigrations
popd
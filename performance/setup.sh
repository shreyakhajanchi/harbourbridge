#!/bin/sh
type mysql >/dev/null 2>&1 && echo "MySQL present." || echo "MySQL not present."
export MYSQLHOST=localhost
export MYSQLUSER=root
export MYSQLPORT=3306
export MYSQLPWD=
go test ./performance -run TestIntegration_MYSQL_LoadSampleData
gcloud auth application-default login
gcloud spanner instances create test-instance --config=regional-us-central1 \
    --description="My Instance" --nodes=1
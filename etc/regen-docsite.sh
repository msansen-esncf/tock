#!/usr/bin/env bash

cp nlp/api/doc/src/main/doc/*.* docs/api/
cp bot/connector-web/web-connector.html docs/api/
cp bot/connector-web/Swagger_TOCKWebConnector.yaml docs/api/

rm -rf docs/fr/*
rm -rf docs/fr-dark/*
rm -rf docs/en/*
rm -rf docs/en-dark/*

mkdocs build -d ../../docs/fr/ -f docs-mk/fr/mkdocs.yml
mkdocs build -d ../../docs/fr-dark/ -f docs-mk/fr/mkdocs-dark.yml
mkdocs build -d ../../docs/en/ -f docs-mk/en/mkdocs.yml
mkdocs build -d ../../docs/en-dark/ -f docs-mk/en/mkdocs-dark.yml
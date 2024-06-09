
install-graph:
    npm i -g @jamietanna/renovate-graph

download_deps organization: install-graph
    renovate-graph --token $GITHUB_TOKEN --autodiscover --autodiscover-filter '{{organization}}/*'

set dotenv-load

@_list:
    just --list --unsorted

install:
    npm install
    npm ci

run-m *args:
    npm {{args}}

# Perform all verifications (compile, test, lint, etc.)
verify: install build lint test


build:
    just run-m run build

test:
    just backend verify

run: install
    npm run tauri dev


lint:
    just run-m run lint
    just run-m run format-check


fmt: fmt-b
    npm run format

fmt-b:
    just backend fmt

backend *args:
    cd src-tauri && just {{args}}


install-dev:
  npm add prettier



release *args: verify
    test $GITHUB_TOKEN
    test $CARGO_REGISTRY_TOKEN
    cd src-tauri && cargo release {{args}}
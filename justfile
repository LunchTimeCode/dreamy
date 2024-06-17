
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
verify: install lint test

build:
    just run-m run build

test:
    just backend verify

run: install
    npm run tauri dev


lint:
    just run-m run lint


fmt: fmt-b
    npm run format

fmt-b:
    just backend fmt

backend *args:
    cd src-tauri && just {{args}}


install-dev:
  npm add prettier
  cargo install cargo-hack cargo-watch cargo-deny hurl cargo-machete
  cargo install cargo-features-manager



release *args: verify
    test $GITHUB_TOKEN
    test $CARGO_REGISTRY_TOKEN
    cd src-tauri && cargo release {{args}}


prune:
    cargo machete
    cargo features prune

update-all:
    npm install -g npm-check-updates
    ncu -u

re token org repo:
    curl -L \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer {{token}}" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/{{org}}/{{repo}}/dependency-graph/compare/main

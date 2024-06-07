

run: install
    npm run tauri dev

install:
    npm install

install-graph:
    npm i -g @jamietanna/renovate-graph

download_deps organization:
    renovate-graph --token $GITHUB_TOKEN --autodiscover --autodiscover-filter '{{organization}}/*'

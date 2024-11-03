SHELL = /bin/bash
.SHELLFLAGS = -o pipefail -c

.PHONY: help
help: ## Print info about all commands
	@echo "Helper Commands:"
	@echo
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[01;32m%-20s\033[0m %s\n", $$1, $$2}'
	@echo

.PHONY: build
build: ## build
	pnpm run build

.PHONY: identify
identify: ## identify people in videos
	node lib/identify-people.js

.PHONY: bind-videos
bind: ## bind videos
	node lib/bind-videos.js

extract-urza:
	node lib/yt-extract.js pp-prague:ancap playlist PLmwDL0lIJTxCc0yL4i9M2aNQ4a5wRzjb7 '{"people":["urza"], "lang": "cs"}'
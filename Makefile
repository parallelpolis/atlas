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
	node lib/yt-extract.js pp-prague:ancap playlist PLmwDL0lIJTxCc0yL4i9M2aNQ4a5wRzjb7 '{"people":["urza"], "lang": "cs", "project": "ankap-serie"}'

extract-ksp:
	node lib/yt-extract.js svobodny-pristav:ksp20 playlist PLmwDL0lIJTxCexaPXOeLubdilZ7qT0SHa '{"lang": "cs", "project": "konference-sp", "event": "ksp20"}'
	node lib/yt-extract.js svobodny-pristav:ksp21 playlist PLmwDL0lIJTxDbyaF8OSIHIUKT3nUfPn8d '{"lang": "cs", "project": "konference-sp", "event": "ksp21"}'
	node lib/yt-extract.js svobodny-pristav:ksp22 playlist PLmwDL0lIJTxAKDGKwJWMwXG3QLWm65xHl '{"lang": "cs", "project": "konference-sp", "event": "ksp22"}'
	node lib/yt-extract.js svobodny-pristav:ksp23 playlist PLmwDL0lIJTxAiv4UON_5YAKB0-UWp-osA '{"lang": "cs", "project": "konference-sp", "event": "ksp23"}'
	node lib/yt-extract.js svobodny-pristav:ksp24 playlist PLmwDL0lIJTxBfzH_IglHxH60OmmswxoNx '{"lang": "cs", "project": "konference-sp", "event": "ksp24"}'

extract-dod:
#node lib/yt-extract.js dod:ethberlin24-keynotes playlist PLjOcf_IVqERmocijf0P3_JTt04xgFa1YZ '{"project": "ethberlin", "event": "ethberlin4"}'
	node lib/yt-extract.js dod:protocol-berg-2023-main-stage playlist PLjOcf_IVqERn-nzPYZ54Idhfb7jWWlO03 '{"project": "protocol-berg", "event": "protocol-berg-2023"}'
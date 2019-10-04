build:
	npm run build:parser
	npm run build:parser:tiny

test: build
	npx mocha

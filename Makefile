serve:
	npm run build
	serve dist

deploy-local:
	jprq http 3000

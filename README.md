# Docker build

To build a docker image use the following command, it utilises buildx with linux/amd64 target

```bash
docker buildx build --push --platform linux/amd64 --tag klingeau/open-api-json-visualiser:latest .
```

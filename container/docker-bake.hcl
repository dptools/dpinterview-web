// docker-bake.hcl
target "docker-metadata-action" {}

target "dashboard" {
  inherits = ["docker-metadata-action"]
  context     = "."
  description = "Builds a containerised version of the dashboard"
  contexts = {
    nodejs_lts = "docker-image://node:24-alpine"
  }
  dockerfile = "container/Dockerfile"
  tags = [
    "ghcr.io/dptools/dashboard:latest", // pseudo container name
  ]
}


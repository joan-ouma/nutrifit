# Frontend Makefile
IMAGE_NAME = nutri-frontend
CONTAINER_NAME = frontend-container

.PHONY: build run stop logs

# Build the Docker image
build:
	docker build -t $(IMAGE_NAME) .

# Run the container
# CHOKIDAR_USEPOLLING is needed for hot-reloading to work in Docker
run:
	docker run -d -p 3000:3000 --name $(CONTAINER_NAME) \
	-e CHOKIDAR_USEPOLLING=true \
	-v $(PWD)/src:/app/src \
	$(IMAGE_NAME)

# Stop and remove container
stop:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

# View logs
logs:
	docker logs -f $(CONTAINER_NAME)
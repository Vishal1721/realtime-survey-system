# Realtime Survey System

A microservices-based real-time survey system built with Kafka, Redis, WebSockets, and Node.js.

## Architecture

- **Response Service** — accepts poll submissions via REST, publishes to Kafka
- **Aggregation Service** — consumes Kafka events, counts votes in Redis
- **Dashboard Service** — subscribes to Redis pub/sub, pushes live updates via WebSocket
- **Notification Service** — independently consumes Kafka events for downstream alerting
- **Nginx** — reverse proxy with rate limiting (5 req/s per IP, burst 10)

## Prerequisites

- Docker and Docker Compose
- k6 (for load testing) — https://k6.io/docs/get-started/installation/

## Run the project

```bash

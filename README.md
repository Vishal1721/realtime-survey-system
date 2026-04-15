# Realtime Survey System

## Run project
docker-compose up

## Services
- Response Service: POST /api/submit
- Dashboard: ws://localhost:4000

## Load test
k6 run load-test.js
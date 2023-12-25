# README - GraphRQ integration tests

This directory contains integration tests for GraphRQ. These tests are run against a live GraphRQ server.

## Running the tests

### docker based tests for ci

```bash
docker-compose -f docker-compose.dev.yml up --build --abort-on-container-exit
```

### Test locally during development

1. Initiate local Neo4j database
2. Run GraphRQ server: `npm run start`
3. Run tests: `npm run test`

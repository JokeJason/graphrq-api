# graphrq-api

GraphQL backend for GraphRQ (A holistic Agile requirement management and tracking tool utilizing the power of graph databases)

## Getting Started

Pre-requisites:

1. Install neo4j database
2. Install APOC plugin for neo4j following [documentation](https://neo4j.com/labs/apoc/4.0/installation/#docker) as [it's required by GraphQL](https://neo4j.com/docs/graphql-manual/current/introduction/#introduction-requirements)
3. Start a graph database

Run the project:

1. Switch node version to by `nvm use`
2. Add `.env` file to the root of the project with the following content:
   1. `DB_URI=bolt://localhost:7687`
   2. `DB_USER=neo4j`
   3. `DB_PASSWORD=xxx`, where `xxx` is the password you set for neo4j database
3. Build: `npm run build`
4. Start: `npm run start`
5. Run integration test: `npm run test`

Run docker based integration test:

1. Start docker testing `docker-compose -f docker-compose.dev.yaml up`
2. Clean up docker testing `docker-compose -f docker-compose.dev.yaml down`

## Available Scripts

- `clean` - remove coverage data, Jest cache and transpiled files,
- `prebuild` - lint source files and tests before building,
- `build` - transpile TypeScript to ES6,
- `build:watch` - interactive watch mode to automatically transpile source files,
- `lint` - lint source files and tests,
- `prettier` - reformat files,
- `test` - run tests,
- `test:watch` - interactive watch mode to automatically re-run tests

## Built From node-typescript-boilerplate

This backend is bootstraped from [node-typescript-boilerplate](https://github.com/JokeJason?tab=repositories), a minimalistic project template to jump start a Node.js back-end application in TypeScript. ESLint, Jest and type definitions included.
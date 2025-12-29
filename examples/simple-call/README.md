# Velos-TS Simple Project

This is a simple project demonstrating the usage of Velos-TS, a TypeScript code generator for OpenAPI specifications. The project includes a sample OpenAPI spec and configuration for generating TypeScript repositories.

## Project Structure

- `api-docs.json`: Sample OpenAPI specification file.
- `velos.config.yaml`: Configuration file for Velos-TS.
- `src/generated/repositories/`: Directory where the generated TypeScript repositories will be placed.
- `src/api-spec.ts`: TypeScript types generated from the OpenAPI spec.
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration file.
- `README.md`: Project documentation.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Velos-TS**:
   ```bash
   npx velos-ts init
   ```

    update your `velos.config.yaml` as needed, for example to include specific endpoint patterns:

    ```yml
    *
    includePatterns:
    - /api/v1/product**
    - /api/v1/auth**
    *
    ```

    Only the product and auth related endpoints will be generated.

3. **Generate Repositories**:
   ```bash
   npx velos-ts generate
   ```

4. **Generate TypeScript Types**:
   ```bash
   npx openapi-typescript api-docs.json --output src/api-spec.ts
   ```

## Run the Project

To run the project, use the following command:
```bash
npx tsx src/project.ts
```

This will execute the main project file and demonstrate the usage of the generated repositories, and the automatic API calls.
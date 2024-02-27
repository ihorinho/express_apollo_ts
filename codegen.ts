
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: './schema.graphql',
  generates: {
    "src/generated/resolvers-types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        useIndexSignature: true,
        // contextType: "../index#MyContext"
      }
    },
    // "src/generated/mongodb-types.ts": {
    //   plugins: ["typescript-mongodb"],
    // },
  }
};

export default config;

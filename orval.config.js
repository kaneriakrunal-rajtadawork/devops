
// orval.config.js
module.exports = {
  kanbanOpenApiPaths: {
    input: {
      target: './src/config/kanbanOpenApi.config.json', // Specify the path to your JSON file
    },
    output: {
      mode: 'tags-split',
      schemas: './src/types',
      client: 'react-query',
      target: './src/api-client/',
      prettier: true,
      override: {
        // mutator: {
        //   path: './src/api-client/axios-instance.js',
        //   name: 'customInstance',
        // },
        query: {
          useQuery: true,
          useMutation: true,
          options: {
            staleTime: 10000,
            refetchOnWindowFocus: false,
          },
        },
        operations: {
          'GitHub Integration': {
            query: {
              options: {
                staleTime: 0,
              },
            },
          },
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
};
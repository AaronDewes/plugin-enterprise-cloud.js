const { writeFileSync } = require("fs");
const path = require("path");

const graphql = require("github-openapi-graphql-query");

if (!process.env.VERSION) {
  throw new Error("VERSION environment variable must be set");
}

const QUERY = `
query ($version: String!, $ignoreChangesBefore: String!) {
  endpoints(version: $version, ignoreChangesBefore: $ignoreChangesBefore, filter: { isGithubCloudOnly: true }) {
    scope(format: CAMELCASE)
    id(format: CAMELCASE)
    method
    url
    isDeprecated
    documentationUrl
    previews(required: true) {
      name
    }
    headers {
      name
      value
    }
    parameters {
      name
      in
      type
      required
      enum
      allowNull
      mapToData
      validation
      alias
      deprecated
    }
    responses {
      code
      examples {
        data
      }
    }
    renamed {
      before {
        scope(format: CAMELCASE)
        id(format: CAMELCASE)
      }
      after {
        scope(format: CAMELCASE)
        id(format: CAMELCASE)
      }
      date
      note
    }
  }
}`;

main();

async function main() {
  const result = await graphql(QUERY, {
    url: "https://github-openapi-graphql-server.vercel.app/api/graphql",
    version: process.env.VERSION,
    ignoreChangesBefore: "2021-06-27",
  });

  writeFileSync(
    path.resolve(__dirname, "generated", "endpoints.json"),
    JSON.stringify(result.data.endpoints, null, 2) + "\n"
  );
}

const CONSTANTS = {
  pollInterval: 10000, // How many ms between regular polls for updates?
  parts: ["tenor", "lead", "bari", "bass", "guest"], // What are the voice parts as found in the database?
  partsTramp: ["tenor", "lead", "bari", "bass"], // What are the voice parts required to claim Tramp?
  urlGraphQL: "/graphql" // What is the URL for making GraphQL queries?
};

export default CONSTANTS;
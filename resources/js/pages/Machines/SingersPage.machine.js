import { assign, fromPromise, setup } from "xstate";
import CONSTANTS from "../../app.constants";

const getSingers = async () => {
  const sortSingers = (left, right) => {
    return left.family_name.localeCompare(right.family_name) ||
      (left.preferred_name ?? left.given_name).localeCompare(right.preferred_name ?? right.given_name);
  };
  const bodyText = `query {
    singers {
      family_name
      given_name
      id
      preferred_name
    }
  }`;
  const optionsFetch = {
    body: JSON.stringify({ query: bodyText }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  return (await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.singers.sort(sortSingers);
};

const machineDefinition = setup({
  actors: {
    getSingers: fromPromise(getSingers)
  }
}).createMachine({
  context: { singers: [], show: { singers: false } },
  initial: "loading",
  states: {
    loading: {
      invoke: {
        id: "getSingers",
        src: "getSingers",
        onDone: {
          actions: assign({ singers: ({ event }) => (event.output) }),
          target: "ready"
        }
      }
    },
    ready: {
      entry: [assign({ show: { singers: true } })],
      type: "final"
    }
  }
});

export default machineDefinition;
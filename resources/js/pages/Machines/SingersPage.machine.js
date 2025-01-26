import { assign, fromPromise, setup } from "xstate";
import CONSTANTS from "../../app.constants";

const getSingers = async () => {
  const sortSingers = (left, right) => {
    const partLeft = left.is_guest_singer ? CONSTANTS.partGuest : left.voice_part;
    const partRight = right.is_guest_singer ? CONSTANTS.partGuest : right.voice_part;
    return (CONSTANTS.parts.indexOf(partLeft) - CONSTANTS.parts.indexOf(partRight)) ||
      left.family_name.localeCompare(right.family_name) ||
      (left.preferred_name ?? left.given_name).localeCompare(right.preferred_name ?? right.given_name);
  };
  const bodyText = `query {
    singers {
      family_name
      given_name
      id
      is_guest_singer
      preferred_name
      voice_part
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
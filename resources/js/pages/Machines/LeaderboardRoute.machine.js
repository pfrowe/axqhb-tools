import { assign, fromPromise, setup } from "xstate";
import CONSTANTS from "../../app.constants";

const getRallies = async () => {
  const query = `query {
    rallies {
      id
      name
      start_date
      stop_date
    }
  }`;
  const optionsFetch = {
    body: JSON.stringify({ query }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  return (await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.rallies;
};

const machineDefinition = setup({ actors: { getRallies: fromPromise(getRallies) } })
  .createMachine({
    context: {
      rallies: [],
      show: { rallies: false }
    },
    initial: "loading",
    states: {
      loading: {
        invoke: {
          id: "getRallies",
          src: "getRallies",
          onDone: {
            actions: [assign({ rallies: ({ event }) => (event.output) })],
            target: "ready"
          }
        }
      },
      ready: {
        entry: [assign({ show: {rallies: true } })],
        type: "final"
      }
    }
  });

export default machineDefinition;
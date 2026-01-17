import { assign, fromPromise, setup } from "xstate";
import CONSTANTS from "../../app.constants";

const getRally = async ({ input: { id } }) => {
  const query = `query($id: ID) {
    rally(id: $id) {
      image_url
      name
      start_date
      stop_date
      singers {
        is_guest_singer
        unique_id
        voice_part
        singer {
          family_name
          given_name
          preferred_name
        }
      }
    }
  }`;
  const variables = { id };
  const optionsFetch = {
    body: JSON.stringify({ query, variables }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  return (await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.rally;
};

const machineDefinition = setup({ actors: { getRally: fromPromise(getRally) } })
.createMachine({
  context: {
    id: -1,
    rally: {},
    show: { form: false }
  },
  initial: "init",
  states: {
    init: {
      on: {
        INIT: [
          {
            actions: [assign(({ event: { id } }) => ({ id }))],
            guard: ({ event: { id } }) => (id > 0),
            target: "loading"
          },
          {
            actions: [assign(({ event: { id } }) => ({ id }))],
            guard: ({ event: { id } }) => (id === 0),
            target: "ready"
          }
        ]
      }
    },
    loading: {
      invoke: {
        id: "getRally",
        input: ({ context: { id } }) => ({ id }),
        src: "getRally",
        onDone: {
          actions: [assign({ rally: ({ event }) => (event.output) })],
          target: "ready"
        }
      }
    },
    ready: {
      entry: [assign({ show: { form: true } })]
    }
  }
});

export default machineDefinition;
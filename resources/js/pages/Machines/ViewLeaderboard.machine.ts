import { assign, fromPromise, setup } from "xstate";
import CONSTANTS from "../../app.constants";

const getSingers = async ({ input: { id } }) => {
  const query = `query($id: ID) {
    rally(id: $id) {
      name
      singers {
        id
        is_guest_singer
        unique_id
        voice_part
        singer {
          family_name
          given_name
          preferred_name
        }
        stickers_received {
          created_at
          id
          recipient {
            id
          }
          sender {
            id
          }
          status
        }
        stickers_sent {
          created_at
          id
          recipient {
            id
          }
          sender {
            id
          }
          status
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

const machineDefinition = setup({ actors: { getSingers: fromPromise(getSingers) } })
  .createMachine({
    context: {
      id: -1,
      rally: { name: "", singers: [] },
      show: { rally: false }
    },
    initial: "init",
    states: {
      init: {
        on: {
          INIT: {
            actions: [assign(({ event: { id } }) => ({ id }))],
            target: "loading"
          }
        }
      },
      loading: {
        invoke: {
          id: "getSingers",
          input: ({ context: { id } }) => ({ id }),
          src: "getSingers",
          onDone: {
            actions: [assign({ rally: ({ context, event }) => ({ ...context.rally, ...event.output }) })],
            target: "ready"
          }
        }
      },
      ready: {
        after: { 10000: "loading" },
        entry: [assign(() => ({ show: { rally: true } }))]
      }
    }
  });

export default machineDefinition;
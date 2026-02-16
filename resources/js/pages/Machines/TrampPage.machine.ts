import { assign, fromPromise, setup } from "xstate";
import CONSTANTS from "../../app.constants";

const getCard = async ({ input: { unique_id }}) => {
  const query = `query ($unique_id: String) {
    card(unique_id: $unique_id) {
      id
      is_guest_singer
      rally_id
      voice_part
      singer {
        family_name
        given_name
        id
        preferred_name
      }
      stickers_received {
        id
        recipient {
          unique_id
        }
        sender {
          unique_id
        }
        status
        updated_at
      }
      stickers_sent {
        id
        recipient {
          unique_id
        }
        sender {
          unique_id
        }
        status
        updated_at
      }
      unique_id
    }
  }`;
  const variables = { unique_id };
  const optionsFetch = {
    body: JSON.stringify({ query, variables }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  const urlFetch = CONSTANTS.urlGraphQL;
  return (await (await fetch(urlFetch, optionsFetch)).json()).data.card;
};

const getSingers = async ({ input: { rally_id, unique_id } }) => {
  const filterNotThisSinger = (unique_id) => ({ unique_id: idTest }) => (idTest !== unique_id);
  const sortSingers = (left, right) => {
    const nameLeft = left.singer.preferred_name ?? left.singer.given_name;
    const nameRight = right.singer.preferred_name ?? right.singer.given_name;
    const partLeft = left.singer.is_guest_singer ? CONSTANTS.partGuest : left.singer.voice_part;
    const partRight = right.singer.is_guest_singer ? CONSTANTS.partGuest : right.singer.voice_part;
    return (CONSTANTS.parts.indexOf(partLeft) - CONSTANTS.parts.indexOf(partRight)) ||
      left.singer.family_name.localeCompare(right.singer.family_name) ||
      (nameLeft).localeCompare(nameRight);
  };
  const query = `query($rally: ID) {
    rally(id: $rally) {
      singers {
        id
        is_guest_singer
        unique_id
        voice_part
        singer {
          family_name
          given_name
          id
          preferred_name
        }
      }
    }
  }`;
  const variables = { rally: rally_id }
  const optionsFetch = {
    body: JSON.stringify({ query, variables }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  return (await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.rally.singers
    .filter(filterNotThisSinger(unique_id))
    .sort(sortSingers);
};

const machineDefinition = setup({
  actors: {
    getCard: fromPromise(getCard),
    getSingers: fromPromise(getSingers)
  }
}).createMachine({
  context: {
    data: {
      card: {},
      singers: []
    },
    show: { card: false },
    unique_id: ""
  },
  initial: "init",
  states: {
    init: {
      on: {
        INIT: {
          actions: [assign(({ event: { unique_id } }) => ({ unique_id }))],
          target: "loadingCard"
        }
      }
    },
    loadingCard: {
      invoke: {
        id: "getCard",
        input: ({ context: { unique_id } }) => ({ unique_id }),
        src: "getCard",
        onDone: {
          actions: [assign(({ context, event }) => ({ data: { ...context.data, card: event.output } }))],
          target: "loadingSingers"
        }
      }
    },
    loadingSingers: {
      invoke: {
        id: "getSingers",
        input: ({ context }) => (context.data.card),
        src: "getSingers",
        onDone: {
          actions: [assign(({ context, event }) => ({ data: { ...context.data, singers: event.output } }))],
          target: "ready"
        }
      }
    },
    ready: {
      after: { [CONSTANTS.pollInterval]: "loadingCard" },
      entry: [assign({ show: { card: true } })],
      on: {
        REFRESH: "loadingCard"
      }
    }
  }
});

export default machineDefinition;
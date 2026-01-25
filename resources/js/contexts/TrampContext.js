import { createContext } from "react";

const TrampContext = createContext({
  onClick: {
    accept: () => { },
    decline: () => { },
    delete: () => { },
    send: () => { },
  },
  self: null
});

export default TrampContext;
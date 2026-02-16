import { createContext } from "react";
import { IRallySinger, ISticker } from "../helpers/GraphQL";

interface ITrampContext {
  onClick: {
    accept: (sticker: ISticker) => Promise<void>;
    decline: (sticker: ISticker) => Promise<void>;
    delete: (sticker: ISticker) => Promise<void>;
    send: (sticker: ISticker) => Promise<void>;
  };
  self: IRallySinger;
}

const TrampContext = createContext<ITrampContext>({
  onClick: {
    accept: () => Promise.resolve(),
    decline: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    send: () => Promise.resolve(),
  },
  self: null
});

export default TrampContext;
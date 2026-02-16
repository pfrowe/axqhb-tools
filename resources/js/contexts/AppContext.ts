import { createContext } from "react";

interface IAppContext {
  setTitle: (newTitle: string) => void;
}

const AppContext = createContext<IAppContext>({
  setTitle: (newTitle: string): void => { document.title = newTitle; }
});

export default AppContext;
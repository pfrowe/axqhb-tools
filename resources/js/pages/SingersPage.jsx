import { useMachine } from "@xstate/react";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SingersPage as machineDefinition } from "./Machines";
import CONSTANTS from "../app.constants";
import SingerCard from "../components/SingerCard/SingerCard";
import { AppContext } from "../contexts";

const SingersPage = () => {
  const { setTitle } = useContext(AppContext);
  const { t } = useTranslation("singers");
  const [{ context }] = useMachine(machineDefinition);
  useEffect(() => (setTitle(t("title")) && undefined), [setTitle, t]);
  const mapSingerCard = ({ id, ...singer }) =>
    (<SingerCard {...singer} href={`/singer/${id}`} key={`singer--${id}`} />);
  return (<main id="main">
    <h1 style={{ textAlign: "center" }}>{t("title")}</h1>
    <h2 style={{ textAlign: "center" }}>{t("subtitle")}</h2>
    {context.show?.singers
      ? (
        <div
          className="display--flex flex--horizontal flex-align--center"
          style={{ marginTop: "2em", paddingLeft: "1em" }}>
          {context.singers?.map(mapSingerCard)}
        </div>)
      : (<></>)
    }
  </main>);
};
SingersPage.displayName = "SingersPage";

export default SingersPage;
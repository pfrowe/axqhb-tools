import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CONSTANTS from "../app.constants";
import SingerCard from "../components/SingerCard/SingerCard";

const SingersPage = () => {
  const [singers, setSingers] = useState([]);
  const { t } = useTranslation("singers");
  const getSingers = () => {
    const fetchSingers = async () => {
      const sortSingers = (left, right) => {
        const parts = ["tenor", "lead", "bari", "bass", "guest"];
        return (parts.indexOf(left.voice_part) - parts.indexOf(right.voice_part)) ||
          left.family_name.localeCompare(right.family_name) ||
          left.given_name.localeCompare(right.given_name);
      };
      const bodyText = `query {
        singers {
          family_name
          given_name
          id
          unique_id
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
      setSingers((await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.singers.sort(sortSingers));
    };
    fetchSingers();
  };
  useEffect(getSingers, [setSingers]);
  const mapSingerCard = ({ unique_id, voice_part, ...singer }) => {
    const styles = {
      root: {
        backgroundColor: `var(--color-voice-background--${voice_part})`,
        borderColor: `brightness(var(--color-voice-background--${voice_part}), -.5)`,
        borderStyle: "solid",
        borderWidth: "1px"
      }
    }
    return (
      <SingerCard
        {...{ ...singer, styles, voice_part }}
        href={`/card/${unique_id}`}
        key={`singer-card--${unique_id}`} />
    );
  };
  return (<main id="main" style={{ width: "1280px" }}>
    <h1 style={{ textAlign: "center" }}>{t("title")}</h1>
    <h2 style={{ textAlign: "center" }}>{t("subtitle")}</h2>
    <div className="display--flex flex--horizontal flex-align--center" style={{ marginTop: "2em", paddingLeft: "1em" }}>
      {singers.map(mapSingerCard)}
    </div>
  </main>);
};
SingersPage.displayName = "SingersPage";

export default SingersPage;
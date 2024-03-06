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
  const mapSingerCard = ({ is_guest_singer, unique_id, voice_part, ...singer }) => (
    <SingerCard
      {...{ ...singer, is_guest_singer, voice_part }}
      className={is_guest_singer ? CONSTANTS.partGuest : voice_part}
      href={`/card/${unique_id}`}
      key={`singer-card--${unique_id}`} />
  );
  return (<main id="main">
    <h1 style={{ textAlign: "center" }}>{t("title")}</h1>
    <h2 style={{ textAlign: "center" }}>{t("subtitle")}</h2>
    <div className="display--flex flex--horizontal flex-align--center" style={{ marginTop: "2em", paddingLeft: "1em" }}>
      {singers.map(mapSingerCard)}
    </div>
  </main>);
};
SingersPage.displayName = "SingersPage";

export default SingersPage;
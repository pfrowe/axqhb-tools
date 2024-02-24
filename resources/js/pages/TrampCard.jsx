import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CONSTANTS from "../app.constants";
import SingerCard from "../components/SingerCard/SingerCard";
import { useTranslation } from "react-i18next";
import TrampSection from "../components/TrampSection/TrampSection";

const TrampCard = () => {
  const { t } = useTranslation("tramp");
  const routerParams = useParams();
  const [singer, setSinger] = useState({ unique_id: routerParams.unique_id });
  const [singers, setSingers] = useState([]);
  const getSinger = () => {
    const fetchSinger = async () => {
      const bodyText = `query ($unique_id: String) {
        singer(unique_id: $unique_id) {
          family_name
          given_name
          id
          unique_id
          voice_part
          stickers_received {
            sender {
              unique_id
            }
            status
            updated_at
          }
          stickers_sent {
            recipient {
              unique_id
            }
            status
            updated_at
          }
        }
      }`;
      const { unique_id } = routerParams;
      const optionsFetch = {
        body: JSON.stringify({ query: bodyText, variables: { unique_id } }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      setSinger((await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.singer);
    }
    fetchSinger();
  }
  useEffect(getSinger, [routerParams?.unique_id]);
  const getSingers = () => {
    const fetchSingers = async () => {
      const filterNotThisSinger = (unique_id) => ({ unique_id: idTest }) => (idTest !== unique_id);
      const sortSingers = (left, right) => {
        return (CONSTANTS.parts.indexOf(left.voice_part) - CONSTANTS.parts.indexOf(right.voice_part)) ||
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
      setSingers(
        (await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.singers
          .filter(filterNotThisSinger(routerParams.unique_id))
          .sort(sortSingers)
      );
    };
    fetchSingers();
  };
  useEffect(getSingers, [setSingers]);
  const mapSection = (voice_part) =>
    (<TrampSection {...{ singer, singers, voice_part }} key={`section--${voice_part}`} />);
  return (<main id="main">
    <h1 style={{ textAlign: "center" }}>{t("welcome")}</h1>
    <h2 style={{ textAlign: "center" }}>{singer?.given_name} {singer?.family_name}</h2>
    {CONSTANTS.parts.map(mapSection)}
  </main>);
};
TrampCard.displayName = "TrampCard";

export default TrampCard;
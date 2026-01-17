import { CheckboxVisibility, DetailsList, SelectionMode } from "@fluentui/react";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useInterval } from "@react-hooks-library/core";
import { useTranslation } from "react-i18next";
import CONSTANTS from "../app.constants";
import { AppContext } from "../contexts";

const LeaderboardPage = () => {
  const { setTitle } = useContext(AppContext);
  const { t } = useTranslation("leaderboard");
  const [refresh, triggerRefresh] = useState(true);
  const [singers, setSingers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  useEffect(() => (setTitle(t("title")) && undefined), [setTitle, t]);
  const sortScore = useCallback((left, right) => {
    const resultScore = left.score - right.score;
    const latestLeft = new Date([...(left.stickers?.all || [])].pop()?.created_at).valueOf();
    const latestRight = new Date([...(right.stickers?.all || [])].pop()?.created_at).valueOf();
    const resultTime = latestLeft - latestRight;
    return resultScore || resultTime;
  }, []);
  const sortString = useCallback((field) => (left, right) => (left[field].localeCompare(right[field])), []);
  const columnsStatus = useMemo(() => {
    const renderProgressBar = (item) => {
      const getPercentage = (part, whole) => (((part ?? []).length / (whole ?? []).length) * 100);
      const getStopsProgress = () => {
        const superComplete = [...(item.superTramp?.accepted || []), ...(item.superTramp?.pending || [])];
        const trampComplete = [...(item.tramp?.accepted || []), ...(item.tramp?.pending || [])];
        const ultraComplete = [...(item.ultraTramp?.accepted || []), ...(item.ultraTramp?.pending || [])];
        return [
          "var(--color--tramp-progress) 0%",
          ...(
            item.score < 1
              ? [
                "var(--color--tramp-progress) " +
                `${getPercentage(trampComplete, item.ultraTramp?.all)}%`,
                "transparent " +
                `${getPercentage(trampComplete, item.ultraTramp?.all)}%`
              ] : [
                `var(--color--tramp-progress) ${(getPercentage(item.tramp?.all, item.ultraTramp?.all))}%`,
                `var(--color--super-progress) ${(getPercentage(item.tramp?.all, item.ultraTramp?.all))}%`
              ]
          ),
          ...(
            item.score < 2
              ? [
                (item.score < 1 ? "transparent " : "var(--color--super-progress) ") +
                `${getPercentage(superComplete, item.ultraTramp?.all)}%`,
                "transparent " +
                `${getPercentage(superComplete, item.ultraTramp?.all)}%`
              ] : [
                `var(--color--super-progress) ${(getPercentage(item.superTramp?.all, item.ultraTramp?.all))}%`,
                `var(--color--ultra-progress) ${(getPercentage(item.superTramp?.all, item.ultraTramp?.all))}%`
              ]
          ),
          ...(
            item.score < 2
              ? []
              : [
                (item.score < 2 ? "transparent " : `var(--color--ultra-progress) `) +
                `${getPercentage(ultraComplete, item.ultraTramp?.all)}%`,
                `transparent ` +
                `${getPercentage(ultraComplete, item.ultraTramp?.all)}%`
              ])
        ];
      };
      const stopsBackground = [
        "var(--bgcolor--tramp-status) 0%",
        `var(--bgcolor--tramp-status) ${getPercentage(item.tramp?.all, item.ultraTramp?.all)}%`,
        `var(--bgcolor--super-status) ${getPercentage(item.tramp?.all, item.ultraTramp?.all)}%`,
        `var(--bgcolor--super-status) ${getPercentage(item.superTramp?.all, item.ultraTramp?.all)}%`,
        `var(--bgcolor--ultra-status) ${getPercentage(item.superTramp?.all, item.ultraTramp?.all)}%`,
        "var(--bgcolor--ultra-status) 100%"
      ];
      const stopsProgress = getStopsProgress();
      const styleContainer = {
        background: `linear-gradient(90deg, ${stopsBackground.join(", ")})`,
        height: "100%",
        left: 0,
        position: "absolute",
        top: 0,
        width: "100%"
      };
      const styleProgress = {
        background: `linear-gradient(90deg, ${stopsProgress.join(", ")})`,
        height: "100%",
        left: 0,
        position: "absolute",
        top: 0,
        width: `100%`
      };
      return (
        <div style={styleContainer}>
          <div style={styleProgress}>&nbsp;</div>
        </div>
      );
    };
    const renderTrampStatus = (item) => {
      const checkIsComplete = (milestone) => {
        let result = false;
        if ((item[milestone]?.accepted?.length || item[milestone]?.pending?.length) && item[milestone]?.all?.length) {
          result = item[milestone].accepted.length + item[milestone].pending.length >= item[milestone].all.length;
        }
        return result;
      };
      const formatDate = (date) => {
        const formatter = new Intl.DateTimeFormat(
          "en-US",
          { hour: "2-digit", hour12: false, minute: "2-digit", weekday: "short" }
        );
        const { hour, minute, weekday } =
          formatter.formatToParts(date).reduce((result, { type, value }) => ({ ...result, [type]: value }), {});
        return `${weekday}, ${hour}:${minute}`;
      };
      const sortStatus = (left, right) => ((item[left]?.length ?? 0) - (item[right]?.length ?? 0));
      const statusOverall = Object.keys(item.stickers).filter(checkIsComplete).sort(sortStatus).pop();
      const dateLatest = statusOverall ? formatDate(new Date((item.stickers[statusOverall] ?? [])[0]?.created_at)) : "";
      return (statusOverall ? (<>{t(`fields.${statusOverall}`)} {dateLatest}</>) : (<></>));
    };
    return [
      {
        ariaLabel: t("fields.given_name"),
        fieldName: "given_name",
        isPadded: true,
        isSorted: false,
        isSortedDescending: false,
        key: "given_name",
        maxWidth: 8 * 9.6,
        minWidth: 8 * 7.2,
        name: t("fields.given_name"),
        onRender: (item) => (item.preferred_name ?? item.given_name),
        sortedAscendingAriaLabel: t("sorted.string.asc"),
        sortedDescendingAriaLabel: t("sorted.string.desc"),
        sortFuncDefault: sortString("given_name"),
        sortFunc: sortString("given_name")
      },
      {
        ariaLabel: t("fields.family_name"),
        fieldName: "family_name",
        isPadded: true,
        isSorted: false,
        isSortedDescending: false,
        key: "family_name",
        maxWidth: 8 * 9.6,
        minWidth: 8 * 7.2,
        name: t("fields.family_name"),
        sortedAscendingAriaLabel: t("sorted.string.asc"),
        sortedDescendingAriaLabel: t("sorted.string.desc"),
        sortFuncDefault: sortString("family_name"),
        sortFunc: sortString("family_name")
      },
      {
        ariaLabel: t("fields.voice_part"),
        fieldName: "voice_part",
        isPadded: true,
        isSorted: false,
        isSortedDescending: false,
        key: "voice_part",
        maxWidth: 4 * 9.6,
        minWidth: 4 * 7.2,
        name: t("fields.voice_part"),
        sortedAscendingAriaLabel: t("sorted.string.asc"),
        sortedDescendingAriaLabel: t("sorted.string.desc"),
        sortFuncDefault: sortString("voice_part"),
        sortFunc: sortString("voice_part")
      },
      {
        ariaLabel: t("fields.score"),
        fieldName: "score",
        isPadded: true,
        isSorted: true,
        isSortedDescending: true,
        key: "score",
        name: t("fields.score"),
        onRender: renderProgressBar,
        sortedAscendingAriaLabel: t("sorted.score.asc"),
        sortedDescendingAriaLabel: t("sorted.score.desc"),
        sortFuncDefault: sortScore,
        sortFunc: (left, right) => (sortScore(left, right) * -1) // Default sort desc
      },
      {
        ariaLabel: t("fields.status"),
        fieldName: "status",
        isPadded: true,
        isSorted: false,
        isSortedDescending: false,
        key: "status",
        maxWidth: 20 * 9.6,
        minWidth: 20 * 7.2,
        name: t("fields.status"),
        onRender: renderTrampStatus,
        sortedAscendingAriaLabel: t("sorted.number.asc"),
        sortedDescendingAriaLabel: t("sorted.number.desc"),
        sortFuncDefault: sortScore,
        sortFunc: sortScore
      },
    ];
  }, []);
  const updateSort = (prevState, colClicked) => {
    const updateColumn = ({ fieldName, isSorted, isSortedDescending, sortFuncDefault, ...column }) => {
      const newSortedDescending = (fieldName === colClicked.fieldName)
        ? (isSorted && !isSortedDescending)
        : isSortedDescending;
      let result = {
        ...column,
        isSorted: fieldName === colClicked.fieldName,
        isSortedDescending: newSortedDescending,
        fieldName: fieldName,
        sortFunc: (left, right) => (sortFuncDefault(left, right) * (newSortedDescending ? -1 : 1)),
        sortFuncDefault
      };
      return result;
    };
    return prevState.map(updateColumn);
  };
  const [columnsSorted, setColSorted] = useReducer(updateSort, columnsStatus);
  const getSingers = () => {
    const fetchSingers = async () => {
      triggerRefresh(false);
      const bodyText = `query {
        rally(id: $id) {
          singers {
            family_name
            given_name
            id
            is_guest_singer
            preferred_name
            unique_id
            voice_part
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
      const optionsFetch = {
        body: JSON.stringify({ query: bodyText }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      setSingers((await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data?.rally?.singers);
    }
    refresh && fetchSingers();
  };
  useEffect(getSingers, [refresh, setSingers, triggerRefresh]);
  const getSingerHash = () => {
    const reduceHash = (result, { id, ...singer }) => ({ ...result, [id]: { id, ...singer } });
    return (singers ?? []).reduce(reduceHash, {});
  };
  const hashSingers = useMemo(getSingerHash, [singers]);
  const getSingerStatuses = () => {
    const mapStatus = (singer) => {
      const filterByStatus = (statusTest) => ({ status }) => (status === statusTest);
      const filterIntersection = (arrayRight, ...arrays) => (item) =>
        (~arrayRight.indexOf(item) && (arrays.length ? filterIntersection(...arrays)(item) : true));
      const filterNotThisSinger = ({ id: idTest }) => (idTest !== id);
      const filterNotThisVoicePart = ({ voice_part: partTest }) => (partTest !== singer.voice_part);
      const filterSticker = (singersToInclude) => (sticker) =>
        (~singersToInclude.map(mapId).indexOf(mapOtherParty(sticker)));
      const filterTramp = ({ is_guest_singer, voice_part: partTest }) =>
        (~CONSTANTS.partsTramp.indexOf(partTest) && !is_guest_singer);
      const getScore = ({ superTramp, tramp, ultraTramp }) => {
        const accepted = {
          super: superTramp?.accepted || [],
          tramp: tramp?.accepted || [],
          ultra: ultraTramp?.accepted || []
        };
        const count = {
          super: (superTramp?.all || []).length,
          tramp: (tramp?.all || []).length,
          ultra: (ultraTramp?.all || []).length
        };
        const pending = {
          super: superTramp?.pending || [],
          tramp: tramp?.pending || [],
          ultra: ultraTramp?.pending || []
        };
        let result;
        if (count.ultra === 0) {
          result = 0;
        }
        else if ((accepted.tramp.length + pending.tramp.length) < count.tramp) {
          result = (accepted.tramp.length + pending.tramp.length) / count.tramp;
        }
        else if ((accepted.super.length + pending.super.length) < count.super) {
          result = 1 + (accepted.super.length + pending.super.length - count.tramp) / (count.super - count.tramp);
        }
        else {
          result = 2 + (accepted.ultra.length + pending.ultra.length - count.super) / (count.ultra - count.super);
        }
        return result;
      };
      const mapId = ({ id }) => (id);
      const mapOtherParty = ({ recipient, sender }) =>
        ([recipient?.id, sender?.id].filter((idTest) => (idTest !== id))[0]);
      const mapSingerFromId = (id) => (hashSingers[id]);
      const sortByTimestamp = (left, right) =>
        (new Date(right.updated_at).valueOf() - new Date(left.updated_at).valueOf());
      const { id, stickers_received, stickers_sent } = singer;
      const stickers = [...(stickers_received ?? []), ...(stickers_sent ?? [])];
      const stickersAccepted = stickers.filter(filterByStatus("accepted"));
      const stickersPending = stickers.filter(filterByStatus("pending"));
      const singersUltraTramp = singers.filter(filterNotThisSinger);
      const singersSuperTramp = singersUltraTramp.filter(filterTramp);
      const singersTramp = singersSuperTramp.filter(filterNotThisVoicePart);
      const idsAccepted = [...new Set(stickersAccepted.map(mapOtherParty))];
      const idsPending = [...new Set(stickersPending.map(mapOtherParty))];
      const categories = {
        superTramp: {
          accepted: idsAccepted.filter(filterIntersection(singersSuperTramp.map(mapId))).map(mapSingerFromId),
          all: singersSuperTramp,
          pending: idsPending.filter(filterIntersection(singersSuperTramp.map(mapId))).map(mapSingerFromId)
        },
        tramp: {
          accepted: idsAccepted.filter(filterIntersection(singersTramp.map(mapId))).map(mapSingerFromId),
          all: singersTramp,
          pending: idsPending.filter(filterIntersection(singersTramp.map(mapId))).map(mapSingerFromId)
        },
        ultraTramp: {
          accepted: idsAccepted.filter(filterIntersection(singersUltraTramp.map(mapId))).map(mapSingerFromId),
          all: singersUltraTramp,
          pending: idsPending.filter(filterIntersection(singersUltraTramp.map(mapId))).map(mapSingerFromId)
        }
      };
      return {
        ...categories,
        family_name: singer.family_name,
        given_name: singer.given_name,
        is_guest_singer: singer.is_guest_singer,
        preferred_name: singer.preferred_name,
        score: getScore(categories),
        singer,
        stickers: {
          all: [...stickersAccepted, ...stickersPending].sort(sortByTimestamp),
          superTramp: [...stickersAccepted, ...stickersPending]
            .sort(sortByTimestamp)
            .filter(filterSticker(singersSuperTramp)),
          tramp: [...stickersAccepted, ...stickersPending]
            .sort(sortByTimestamp)
            .filter(filterSticker(singersTramp)),
          ultraTramp: [...stickersAccepted, ...stickersPending]
            .sort(sortByTimestamp)
            .filter(filterSticker(singersUltraTramp)),
        },
        voice_part: singer.voice_part
      };
    };
    const colSorted = columnsSorted.filter(({ isSorted }) => (isSorted))[0];
    setStatuses((singers ?? []).map(mapStatus).sort(colSorted?.sortFunc));
  };
  useEffect(getSingerStatuses, [columnsSorted, hashSingers, singers]);
  const onColumnHeaderClick = (_, colClicked) => (setColSorted(colClicked));
  const requestRefresh = useCallback(() => (triggerRefresh(true)), [triggerRefresh]);
  useInterval(requestRefresh, CONSTANTS.pollInterval);
  return (
    <main id="main">
      <h1 style={{ textAlign: "center" }}>{t("title")}</h1>
      <DetailsList
        checkboxVisibility={CheckboxVisibility.hidden}
        columns={columnsSorted}
        compact={false}
        items={statuses}
        onColumnHeaderClick={onColumnHeaderClick}
        selectionMode={SelectionMode.none} />
    </main>
  );
};
LeaderboardPage.displayName = "LeaderboardPage";

export default LeaderboardPage;
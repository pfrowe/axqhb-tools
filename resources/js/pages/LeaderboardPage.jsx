import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import CONSTANTS from "../app.constants";
import { useInterval } from "@react-hooks-library/core";
import { CheckboxVisibility, DetailsList, SelectionMode } from "@fluentui/react";

const LeaderboardPage = () => {
  const { t } = useTranslation("leaderboard");
  const [refresh, triggerRefresh] = useState(true);
  const [singers, setSingers] = useState([]);
  const [statuses, setStatuses] = useState([]);
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
          ...([
            `var(--color--ultra-progress) ` +
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
      const checkIsComplete = (milestone) =>
        (item[milestone]?.all && (item.stickers[milestone]?.length ?? 0) >= (item[milestone].all?.length ?? 0));
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
      const dateLatest = statusOverall ? formatDate(new Date((item.stickers[statusOverall] ?? [])[0]?.updated_at)) : "";
      return (statusOverall ? (<>{t(`fields.${statusOverall}`)} {dateLatest}</>) : (<></>));
    };
    const sortScore = (left, right) => {
      const scoreLeft = left.score;
      const scoreRight = right.score;
      const latestLeft = new Date([...(left.stickers?.all || [])].pop()?.updated_at).valueOf();
      const latestRight = new Date([...(right.stickers?.all || [])].pop()?.updated_at).valueOf();
      return (((scoreLeft - scoreRight) * 1000) + (latestLeft - latestRight)) * (colSorted.isSortedDescending ? -1 : 1);
    };
    return [
      {
        ariaLabel: t("fields.given_name"),
        fieldName: "given_name",
        isPadded: true,
        isSorted: colSorted?.name === "given_name",
        isSortedDescending: (colSorted?.name === "given_name") && colSorted.isSortedDescending,
        key: "given_name",
        maxWidth: 8 * 9.6,
        minWidth: 8 * 7.2,
        name: t("fields.given_name"),
        sortedAscendingAriaLabel: t("sorted.string.asc"),
        sortedDescendingAriaLabel: t("sorted.string.desc"),
        sortFunc: (left, right) => (left.localeCompare(right) * (colSorted.isSortedDescending ? -1 : 1))
      },
      {
        ariaLabel: t("fields.family_name"),
        fieldName: "family_name",
        isPadded: true,
        isSorted: colSorted?.name === "family_name",
        isSortedDescending: (colSorted?.name === "family_name") && colSorted.isSortedDescending,
        key: "family_name",
        maxWidth: 8 * 9.6,
        minWidth: 8 * 7.2,
        name: t("fields.family_name"),
        sortedAscendingAriaLabel: t("sorted.string.asc"),
        sortedDescendingAriaLabel: t("sorted.string.desc"),
        sortFunc: (left, right) => (left.localeCompare(right) * (colSorted.isSortedDescending ? -1 : 1))
      },
      {
        ariaLabel: t("fields.voice_part"),
        fieldName: "voice_part",
        isPadded: true,
        isSorted: colSorted?.name === "voice_part",
        isSortedDescending: (colSorted?.name === "voice_part") && colSorted.isSortedDescending,
        key: "voice_part",
        maxWidth: 4 * 9.6,
        minWidth: 4 * 7.2,
        name: t("fields.voice_part"),
        sortedAscendingAriaLabel: t("sorted.string.asc"),
        sortedDescendingAriaLabel: t("sorted.string.desc"),
        sortFunc: (left, right) => (left.localeCompare(right) * (colSorted.isSortedDescending ? -1 : 1))
      },
      {
        ariaLabel: t("fields.score"),
        fieldName: "score",
        isPadded: true,
        isSorted: colSorted?.name === "score",
        isSortedDescending: (colSorted?.name === "score") && colSorted.isSortedDescending,
        key: "score",
        name: t("fields.score"),
        onRender: renderProgressBar,
        sortedAscendingAriaLabel: t("sorted.score.asc"),
        sortedDescendingAriaLabel: t("sorted.score.desc"),
        sortFunc: sortScore
      },
      {
        ariaLabel: t("fields.status"),
        fieldName: "status",
        isPadded: true,
        isSorted: colSorted?.name === "status",
        isSortedDescending: (colSorted?.name === "status") && colSorted.isSortedDescending,
        key: "status",
        maxWidth: 20 * 9.6,
        minWidth: 20 * 7.2,
        name: t("fields.status"),
        onRender: renderTrampStatus,
        sortedAscendingAriaLabel: t("sorted.number.asc"),
        sortedDescendingAriaLabel: t("sorted.number.desc"),
        sortFunc: sortScore
      },
    ];
  }, [colSorted]);
  const updateSort = useCallback(
    (prevState, colClicked) => {
      const mapSort = (colTest) => (
        (colTest.name === colClicked.name)
          ? ({
            ...colTest,
            isSorted: true,
            isSortedDescending: (prevState.name === colClicked.name) ? false : !prevState.isSortedDescending
          })
          : colTest
      );
      return columnsStatus.map(mapSort).filter(({ isSorted }) => (isSorted)).pop();
    },
    [columnsStatus]
  );
  const [colSorted, setColSorted] = useReducer(updateSort, { name: "score", isSortedDescending: true });
  const getSingers = () => {
    const fetchSingers = async () => {
      triggerRefresh(false);
      const bodyText = `query {
        singers {
          family_name
          given_name
          id
          unique_id
          voice_part
          stickers_received {
            id
            sender {
              id
            }
            status
            updated_at
          }
          stickers_sent {
            id
            recipient {
              id
            }
            status
            updated_at
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
      setSingers((await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data?.singers);
    }
    refresh && fetchSingers();
  };
  useEffect(getSingers, [refresh, setSingers, triggerRefresh]);
  const getSingerStatuses = () => {
    const mapStatus = (singer) => {
      const filterByStatus = (statusTest) => ({ status }) => (status === statusTest);
      const filterHasSticker = (idsWithStickers) => ({ id }) => (~idsWithStickers.indexOf(id));
      const filterNotThisSinger = ({ id: idTest }) => (idTest !== id);
      const filterNotThisVoicePart = ({ voice_part: partTest }) => (partTest !== singer.voice_part);
      const filterSticker = (singersToInclude) => (sticker) =>
        (~singersToInclude.map(mapId).indexOf(mapOtherParty(sticker)));
      const filterTramp = ({ voice_part: partTest }) => (~CONSTANTS.partsTramp.indexOf(partTest));
      const getScore = () => {
        const accepted = {
          super: singer?.superTramp?.accepted || [],
          tramp: singer?.tramp?.accepted || [],
          ultra: singer?.ultraTramp?.accepted || []
        };
        const count = {
          super: (singer?.superTramp?.all || []).length,
          tramp: (singer?.tramp?.all || []).length,
          ultra: (singer?.ultraTramp?.all || []).length
        };
        const pending = {
          super: singer?.superTramp?.pending || [],
          tramp: singer?.tramp?.pending || [],
          ultra: singer?.ultraTramp?.pending || []
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
      const sortByTimestamp = (left, right) =>
        (new Date(right.updated_at).valueOf() - new Date(left.updated_at).valueOf());
      const { id, stickers_received, stickers_sent } = singer;
      const stickers = [...(stickers_received ?? []), ...(stickers_sent ?? [])];
      const stickersAccepted = stickers.filter(filterByStatus("accepted"));
      const stickersPending = stickers.filter(filterByStatus("pending"));
      const singersUltraTramp = singers.filter(filterNotThisSinger);
      const singersSuperTramp = singersUltraTramp.filter(filterTramp);
      const singersTramp = singersSuperTramp.filter(filterNotThisVoicePart);
      const idsAccepted = stickersAccepted.map(mapOtherParty);
      const idsPending = stickersPending.map(mapOtherParty);
      return {
        family_name: singer.family_name,
        given_name: singer.given_name,
        score: getScore(),
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
        superTramp: {
          accepted: singersSuperTramp.filter(filterHasSticker(idsAccepted)),
          all: singersSuperTramp,
          pending: singersSuperTramp.filter(filterHasSticker(idsPending))
        },
        tramp: {
          accepted: singersTramp.filter(filterHasSticker(idsAccepted)),
          all: singersTramp,
          pending: singersTramp.filter(filterHasSticker(idsPending))
        },
        ultraTramp: {
          accepted: singersUltraTramp.filter(filterHasSticker(idsAccepted)),
          all: singersUltraTramp,
          pending: singersUltraTramp.filter(filterHasSticker(idsPending))
        },
        voice_part: singer.voice_part
      };
    };
    setStatuses((singers ?? []).map(mapStatus).sort(colSorted?.sortFunc));
  };
  useEffect(getSingerStatuses, [colSorted, singers]);
  const requestRefresh = useCallback(() => (triggerRefresh(true)), [triggerRefresh]);
  useInterval(requestRefresh, CONSTANTS.pollInterval);
  return (
    <main id="main">
      <h1 style={{ textAlign: "center" }}>{t("title")}</h1>
      <DetailsList
        checkboxVisibility={CheckboxVisibility.hidden}
        columns={columnsStatus}
        compact={false}
        items={statuses}
        onColumnHeaderClick={setColSorted}
        selectionMode={SelectionMode.none} />
    </main>
  );
};
LeaderboardPage.displayName = "LeaderboardPage";

export default LeaderboardPage;
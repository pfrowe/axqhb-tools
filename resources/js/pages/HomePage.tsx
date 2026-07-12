import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardPreview, Image, Text } from "@fluentui/react-components";

interface ICardProps {
  key: string;
  onClickHref: string;
  previewProps: {
    previewImages: string[];
  }
  titleProps: {
    title: string;
  }
}

const HomePage = () => {
  const { t } = useTranslation("app");
  const cards = useMemo<ICardProps[]>(() => ([
    {
      key: "rallies",
      onClickHref: "/rallies",
      previewProps: {
        previewImages: ["/images/main-street.jpg"],
      },
      titleProps: {
        title: t("homepage.cards.title.rallies.name"),
      },
    },
    {
      key: "singers",
      onClickHref: "/singers",
      previewProps: {
        previewImages: ["/images/after-hours.jpg"],
      },
      titleProps: {
        title: t("homepage.cards.title.singers.name"),
      },
    },
    {
      key: "leaderboard",
      onClickHref: "/leaderboard",
      previewProps: {
        previewImages: ["/images/forefront.jpg"],
      },
      titleProps: {
        title: t("homepage.cards.title.leaderboard.name"),
      },
    },
  ]), []);
  const mapCard = (card: ICardProps, index: number) => {
    const key = ("00" + index).slice(-2);
    const onClickHref = () => (window.location.href = card.onClickHref);
    return (<Card key={key} onClick={onClickHref}>
      <CardPreview>
        <Image
          alt={card.titleProps.title}
          srcSet={card.previewProps.previewImages.join(", ")}
        />
      </CardPreview>
      <CardHeader header={<Text size={500}>{card.titleProps.title}</Text>} />
    </Card>);
  };
  return (
    <main className="flex--horizontal flex-justify--center" id="main">
      {cards.map(mapCard)}
    </main>
  );
};
HomePage.displayName = "HomePage";

export default HomePage;

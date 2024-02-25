import { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import PersonaCard from "../components/PersonaCard";

const HomePage = () => {
  const { t } = useTranslation("app");
  const cards = useMemo(() => ([
    {
      key: "power-user",
      onClickHref: "/singers",
      previewProps: {
        previewImages: [
          {
            linkProps: { href: "/singers" },
            name: <Trans i18nKey="app:homepage.cards.preview.singers.name" t={t}>Singers</Trans>,
            previewImageSrc: "/images/after-hours.jpg",
          },
        ],
      },
      titleProps: {
        styles: {
          root: {
            height: "3.5em",
            textAlign: "center"
          },
        },
        title: (
          <Trans i18nKey="app:homepage.cards.title.singers.name" t={t} />),
      },
    },
  ]), []);
  const mapCard = (card, index) => {
    const key = ("00" + index).slice(-2);
    return (<PersonaCard key={key} {...card} />);
  };
  return (
    <main className="flex--horizontal flex-justify--center" id="main">
      {cards.map(mapCard)}
    </main>
  );
};
HomePage.displayName = "HomePage";

export default HomePage;
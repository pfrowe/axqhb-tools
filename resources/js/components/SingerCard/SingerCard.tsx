import { Card, CardHeader, Text } from "@fluentui/react-components";

import styles from "./SingerCard.module.scss";

interface ISingerCardProps {
  family_name: string;
  given_name: string;
  href?: string;
  preferred_name?: string;
  voice_part?: string;
}

const SingerCard = ({ family_name, given_name, href, preferred_name, voice_part }: ISingerCardProps) => {
  const onClick = () => (window.location.href = href ?? "#");
  return (
    <Card
      className={[styles["singer-card"], styles[voice_part ?? ""]].join(" ")}
      onClick={onClick}
      size="small"
    >
      <CardHeader header={<Text size={500}>{`${preferred_name ?? given_name} ${family_name}`}</Text>} />
    </Card>
  );
};
SingerCard.displayName = "SingerCard";

export default SingerCard;

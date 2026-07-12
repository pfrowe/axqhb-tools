import { Card, CardHeader, CardPreview, Image, Text } from "@fluentui/react-components";

import styles from "./RallyCard.module.scss";

interface IRallyCardProps {
  className?: string;
  href: string;
  id: number;
  image_url: string;
  name: string;
}

const RallyCard = ({ href, id, image_url, name, ...props }: IRallyCardProps) => {
  const onClick = () => (window.location.href = href);
  return (
    <Card
      {...props}
      className={`flex-align--center flex-justify--center ${props?.className}`}
      onClick={onClick}
    >
      <CardPreview className={styles.preview}>
        <Image alt={name} src={image_url} />
      </CardPreview>
      <CardHeader header={<Text size={500}>{name}</Text>} />
    </Card>
  );
};
RallyCard.displayName = "RallyCard";

export default RallyCard;

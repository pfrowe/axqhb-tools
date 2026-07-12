import { useMemo } from "react";
import {
  Card, CardHeader, CardHeaderProps, CardPreview, CardPreviewProps, CardProps
} from "@fluentui/react-components";

interface IPersonaCardProps extends CardProps {
  previewProps: CardPreviewProps;
  titleProps: CardHeaderProps;
}

const PersonaCard = ({ previewProps, titleProps, ...props }: IPersonaCardProps) => {
  const propsPreview = useMemo(() => ({
    height: 240,
    width: 320,
    ...previewProps,
  }), [previewProps]);
  return (
    <Card {...props}>
      <CardPreview {...propsPreview} />
      <CardHeader {...titleProps} />
    </Card>
  );
};

PersonaCard.displayTitle = "PersonaCard";

export default PersonaCard;

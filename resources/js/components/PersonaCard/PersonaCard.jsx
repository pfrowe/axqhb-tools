import { useMemo } from "react";
import {
  DocumentCard, DocumentCardPreview, DocumentCardTitle, ImageFit,
} from "@fluentui/react";

const PersonaCard = ({ previewProps, titleProps, ...props }) =>
{
  const propsPreview = useMemo(() => ({
    height: 240,
    imageFit: ImageFit.cover,
    width: 320,
    ...previewProps,
  }), [previewProps]);
  return (
    <DocumentCard {...props}>
      <DocumentCardPreview {...propsPreview} />
      <DocumentCardTitle {...titleProps} />
    </DocumentCard>
  );
};

PersonaCard.displayTitle = "PersonaCard";

export default PersonaCard;

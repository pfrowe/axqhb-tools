import { DocumentCard, DocumentCardImage, DocumentCardTitle } from "@fluentui/react";

const RallyCard = ({ href, id, image_url, name, onClick, ...props }: any) => {
  return (
    <DocumentCard
      {...props}
      className={`flex-align--center flex-justify--center ${props?.className}`}
      onClick={onClick}
      onClickHref={href}>
      <DocumentCardImage imageSrc={image_url} />
      <DocumentCardTitle title={name} />
    </DocumentCard>
  );
};
RallyCard.displayName = "RallyCard";

export default RallyCard;

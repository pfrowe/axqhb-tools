import { DocumentCard, DocumentCardTitle, DocumentCardType } from "@fluentui/react";

const SingerCard = ({ family_name, given_name, href, onClick, preferred_name, ...props }) => {
  return (
    <DocumentCard
      {...props}
      className={`flex-align--center flex-justify--center ${props?.className}`}
      onClick={onClick}
      onClickHref={href}
      type={DocumentCardType.compact}>
      <DocumentCardTitle title={`${preferred_name ?? given_name} ${family_name}`} />
    </DocumentCard>
  );
};
SingerCard.displayName = "SingerCard";

export default SingerCard;
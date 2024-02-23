import { DocumentCard, DocumentCardTitle, DocumentCardType, merge } from "@fluentui/react";

const SingerCard = ({ family_name, given_name, href, onClick, ...props }) => {
  const stylesDefault = {
    root: {
      maxWidth: "25em"
    }
  };
  return (
    <DocumentCard
      className="flex-align--center flex-justify--center"
      {...props}
      onClick={onClick}
      onClickHref={href}
      styles={merge(stylesDefault, props?.styles)}
      type={DocumentCardType.compact}>
      <DocumentCardTitle title={`${given_name} ${family_name}`} />
    </DocumentCard>
  );
};
SingerCard.displayName = "SingerCard";

export default SingerCard;
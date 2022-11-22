import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HoverCard, HoverCardProps } from "@mantine/core";

interface InfoTooltipProps extends HoverCardProps {
  /** Content of the tooltip card. */
  children: React.ReactNode;
  /** Font Awesome icon to override the default tooltip icon. */
  faIcon?: IconProp;
}

/**
 * An info tooltip component that shows a card on hover.
 */
function InfoTooltip({ children, faIcon = ["far", "circle-question"], ...hoverCardProps }: InfoTooltipProps) {
  return (
    <HoverCard position="top" {...hoverCardProps}>
      <HoverCard.Target>
        <button className="p-2 text-lg leading-none text-blue-500">
          <FontAwesomeIcon icon={faIcon} />
        </button>
      </HoverCard.Target>
      <HoverCard.Dropdown className="py-2 text-justify !bg-blue-50 !border !border-blue-300 !drop-shadow-lg">
        {children}
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

export default InfoTooltip;

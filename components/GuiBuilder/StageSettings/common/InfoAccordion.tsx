import { Accordion, createStyles } from "@mantine/core";

interface InfoAccordionProps {
  title: string;
  children: React.ReactNode;
}

/**
 * An accordion that displays helper info.
 */
function InfoAccordion({ title, children }: InfoAccordionProps) {
  const { classes } = useStyles();
  return (
    <Accordion chevronPosition="left" classNames={classes}>
      <Accordion.Item value={title}>
        <Accordion.Control>{title}</Accordion.Control>
        <Accordion.Panel>
          <div className="text-sm text-gray-600">{children}</div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

const useStyles = createStyles(() => ({
  control: {
    padding: "8px 12px 8px 8px",
    ":hover": {
      backgroundColor: "transparent",
    },
  },
  label: {
    color: "#3b82f6",
    fontWeight: 600,
  },
  chevron: {
    marginRight: "8px",
  },
  content: {
    padding: "0px 12px 12px 40px",
    backgroundColor: "#ffffff",
  },
}));

export default InfoAccordion;

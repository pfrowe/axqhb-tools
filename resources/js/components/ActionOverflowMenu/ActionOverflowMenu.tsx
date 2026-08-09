import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from "@fluentui/react-components";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import { ReactNode, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./ActionOverflowMenu.module.scss";

export type ActionOverflowMenuItem = {
  key: string;
  icon: ReactNode;
  text: string;
  to?: string;
  onClick?: () => void;
};

type ActionOverflowMenuProps = {
  items: ActionOverflowMenuItem[];
  menuAriaLabel?: string;
  className?: string;
};

const ActionOverflowMenu = ({ items, menuAriaLabel = "Actions", className = "" }: ActionOverflowMenuProps) => {
  const navigate = useNavigate();
  const actionBarRef = useRef<HTMLDivElement>(null);
  const actionMeasureRef = useRef<HTMLDivElement>(null);
  const [collapseActions, setCollapseActions] = useState(false);

  const handleItemClick = useCallback(
    (item: ActionOverflowMenuItem) => {
      if (item.onClick) {
        item.onClick();
        return;
      }

      if (item.to) {
        navigate(item.to);
      }
    },
    [navigate]
  );

  const renderedItems = useMemo(
    () => items.filter((item) => item.to || item.onClick),
    [items]
  );

  useLayoutEffect(() => {
    const update = () => {
      if (!actionBarRef.current || !actionMeasureRef.current) {
        return;
      }
      const availableWidth = actionBarRef.current.clientWidth;
      const neededWidth = actionMeasureRef.current.scrollWidth;
      setCollapseActions(neededWidth > availableWidth);
    };

    update();
    const resizeObserver = new ResizeObserver(update);
    if (actionBarRef.current) {
      resizeObserver.observe(actionBarRef.current);
    }

    window.addEventListener("resize", update);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [renderedItems]);

  return (
    <div className={[styles.actionOverflowMenu, className].filter(Boolean).join(" ")} ref={actionBarRef}>
      {collapseActions ? (
        <Menu>
          <MenuTrigger>
            <Button className={styles.actionMenuButton} appearance="transparent" icon={<MoreHorizontal20Regular />} aria-label={menuAriaLabel} />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {renderedItems.map((item) => (
                <MenuItem key={item.key} onClick={() => handleItemClick(item)}>
                  <span className={styles.actionButtonContent}>
                    {item.icon}
                    {item.text}
                  </span>
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      ) : (
        renderedItems.map((item) => (
          item.to ? (
            <Link className={styles.buttonLink} key={item.key} to={item.to}>
              {item.icon}
              {item.text}
            </Link>
          ) : (
            <button className={styles.buttonLink} key={item.key} type="button" onClick={() => handleItemClick(item)}>
              {item.icon}
              {item.text}
            </button>
          )
        ))
      )}
      <div className={styles.actionBarMeasure} ref={actionMeasureRef} aria-hidden="true">
        {renderedItems.map((item) => (
          <div className={styles.buttonLink} key={`measure-${item.key}`}>
            {item.icon}
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
};

ActionOverflowMenu.displayName = "ActionOverflowMenu";

export default ActionOverflowMenu;

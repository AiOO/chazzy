import { memo, ReactElement, useMemo, useState } from 'react';
import {
  autoUpdate,
  FloatingPortal,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import MoreIcon from '@/app/[channelId]/MoreIcon';
import DiscordIcon from '@/app/[channelId]/DiscordIcon';

function ChazzyMenu(): ReactElement {
  const [isMenuOpened, setMenuOpened] = useState<boolean>(false);
  const { refs, floatingStyles, context } = useFloating({
    placement: 'top-end',
    open: isMenuOpened,
    onOpenChange: setMenuOpened,
    whileElementsMounted: autoUpdate,
    middleware: [offset(16)],
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const menu = useMemo(
    () => (
      <div id="menu-container" ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
        <div className="menu-list">
          <a className="menu-item" href="https://discord.gg/ExYacWuCyP" target="_blank">
            <DiscordIcon />
            Chazzy 문의 채널
          </a>
        </div>
      </div>
    ),
    [refs, floatingStyles, getFloatingProps],
  );

  return (
    <div id="menu-button">
      <button type="button" ref={refs.setReference} className={isMenuOpened ? 'active' : ''} {...getReferenceProps()}>
        <MoreIcon />
      </button>
      {isMenuOpened && <FloatingPortal>{menu}</FloatingPortal>}
    </div>
  );
}

export default memo(ChazzyMenu);

import { useEffect } from "react";
import type { Status } from "./data";

type KeyboardOptions = {
  enabled: boolean;
  onFlag: (status: Exclude<Status, null>) => void;
  onUndo: () => void;
};

export function useReviewKeyboard({
  enabled,
  onFlag,
  onUndo,
}: KeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest('input, textarea, select, [role="textbox"]'))
      )
        return;

      switch (event.key.toLowerCase()) {
        case "a":
        case "arrowleft":
          event.preventDefault();
          onFlag("unimportant");
          break;
        case "d":
        case "arrowright":
          event.preventDefault();
          onFlag("important");
          break;
        case "s":
        case "arrowdown":
          event.preventDefault();
          onUndo();
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onFlag, onUndo]);
}

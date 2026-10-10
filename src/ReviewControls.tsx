import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flag,
  RotateCcw,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Status } from "./data";

type ReviewControlsProps = {
  canFlag: boolean;
  canUndo: boolean;
  onFlag: (status: Exclude<Status, null>) => void;
  onUndo: () => void;
};

function Shortcut({
  letter,
  arrow: Arrow,
}: {
  letter: string;
  arrow: LucideIcon;
}) {
  return (
    <span className="shortcut" aria-hidden="true">
      <kbd>{letter}</kbd>
      <span>/</span>
      <kbd>
        <Arrow size={14} />
      </kbd>
    </span>
  );
}

export default function ReviewControls({
  canFlag,
  canUndo,
  onFlag,
  onUndo,
}: ReviewControlsProps) {
  return (
    <div className="review-controls">
      {canFlag && (
        <div className="review-actions">
          <button
            className="discard-button"
            aria-keyshortcuts="a ArrowLeft"
            title="Unimportant (A or Left Arrow)"
            onClick={() => onFlag("unimportant")}
          >
            <Shortcut letter="A" arrow={ArrowLeft} />
            <span className="decision-label">
              Unimportant <X size={20} aria-hidden="true" />
            </span>
          </button>
          <button
            className="keep-button"
            aria-keyshortcuts="d ArrowRight"
            title="Important (D or Right Arrow)"
            onClick={() => onFlag("important")}
          >
            <Shortcut letter="D" arrow={ArrowRight} />
            <span className="decision-label">
              Important <Flag size={20} aria-hidden="true" />
            </span>
          </button>
        </div>
      )}
      <button
        className="undo review-undo"
        aria-keyshortcuts="s ArrowDown"
        title="Go back / undo (S or Down Arrow)"
        disabled={!canUndo}
        onClick={onUndo}
      >
        <Shortcut letter="S" arrow={ArrowDown} />
        <span className="control-label">Go back</span>
        <RotateCcw size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

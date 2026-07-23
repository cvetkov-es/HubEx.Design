import * as React from "react";
import { Icon, type IconColor } from "../Icon/Icon";

export type SegmentedControlActionIcon = {
  /**
   * DEVIATION from the official API: the official `icon` is an SVG render
   * prop (`(props: SVGProps<SVGSVGElement>) => ReactElement`). This package
   * is Material-font-based and never bundles inline SVG (see the ban
   * documented on Icon.tsx / Button.tsx's `icon` prop), so here it's a
   * Material Icons glyph *name* (e.g. "close"), rendered via `<Icon/>`.
   */
  icon: string;
  /** `--hx-color-icon-*` token suffix (Icon's `color` prop). */
  iconColor?: IconColor;
  /** Accessible name for the action button (required, matches official). */
  ariaLabel: string;
  /** Fires on click. Does NOT change the selected segment. */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

export type SegmentedControlOption = {
  value: string;
  label: React.ReactNode;
  /** Static leading icon (Material glyph name — same DEVIATION as `actionIcon.icon`). */
  icon?: string;
  disabled?: boolean;
  /** Interactive icon-button shown only on the SELECTED segment. */
  actionIcon?: SegmentedControlActionIcon;
};

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  /** Controlled value. */
  value?: string;
  /** Initial value for uncontrolled use. Falls back to the first non-disabled option. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /**
   * Forces icon-only ("compact") rendering — labels are dropped from the DOM
   * and exposed only via `aria-label` on each segment.
   *
   * DEVIATION: the official `compact` also auto-activates via a
   * `ResizeObserver` measuring whether the control overflows its container,
   * and wraps each compact segment in a floating-ui Tooltip so the label
   * stays discoverable on hover/focus. Both are OMITTED here to keep this
   * component self-contained (no ResizeObserver-driven layout measurement,
   * and no runtime dependency on any other component, including our own
   * Tooltip) — `compact` is purely an explicit, caller-forced flag, and the
   * dropped label's accessible name is carried by `aria-label` alone.
   * @default false
   */
  compact?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  className?: string;
}

function optionLabelText(label: React.ReactNode): string | undefined {
  return typeof label === "string" ? label : undefined;
}

// Mirrors the official bundle's `findNextEnabledIndex` (SegmentedControl.utils):
// steps circularly from `currentIndex` in `direction`, skipping disabled
// options, and gives up (returning `currentIndex` unchanged) if every option
// is disabled.
function findNextEnabledIndex(
  options: Pick<SegmentedControlOption, "disabled">[],
  currentIndex: number,
  direction: "next" | "prev"
): number {
  const total = options.length;
  if (total === 0) return currentIndex;
  let index = currentIndex;
  for (let step = 0; step < total; step += 1) {
    index = direction === "next" ? (index + 1 + total) % total : (index - 1 + total) % total;
    if (!options[index]?.disabled) return index;
  }
  return currentIndex;
}

function getInitialValue(
  options: SegmentedControlOption[],
  value: string | undefined,
  defaultValue: string | undefined
): string | undefined {
  if (value !== undefined) return value;
  if (defaultValue !== undefined) return defaultValue;
  return options.find((option) => !option.disabled)?.value;
}

const ARROW_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]);

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement.
//
// SELF-CONTAINED by design (Task 10 requirement) — no floating-ui, no
// runtime import of any other component in this package (not even Tooltip;
// see the `compact` doc above for what that costs).
export const SegmentedControl = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLDivElement, SegmentedControlProps>((props, ref) => {
    const {
      options,
      value,
      defaultValue,
      onChange,
      compact = false,
      disabled = false,
      ariaLabel,
      ariaLabelledby,
      ariaDescribedby,
      className,
    } = props;

    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState(() =>
      getInitialValue(options, value, defaultValue)
    );
    const selectedValue = isControlled ? value : uncontrolledValue;
    const selectedIndex = options.findIndex((option) => option.value === selectedValue);

    const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);

    const selectValue = React.useCallback(
      (next: string) => {
        if (!isControlled) setUncontrolledValue(next);
        onChange?.(next);
      },
      [isControlled, onChange]
    );

    const cls = ["hx-segmented", className].filter(Boolean).join(" ");

    return (
      <div
        ref={ref}
        className={cls}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
      >
        {options.map((option, index) => {
          const selected = option.value === selectedValue;
          // Matches the official bundle: a selected option is never rendered
          // disabled even when `option.disabled` is true — selection wins.
          const itemDisabled = (disabled || Boolean(option.disabled)) && !selected;
          const rovingTabIndex = selected || (selectedIndex === -1 && index === 0) ? 0 : -1;
          const accessibleLabel = compact
            ? optionLabelText(option.label) ?? option.actionIcon?.ariaLabel
            : undefined;

          const activateOption = () => {
            if (itemDisabled) return;
            selectValue(option.value);
          };

          const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              activateOption();
              return;
            }
            if (!ARROW_KEYS.has(event.key)) return;
            event.preventDefault();
            let nextIndex = index;
            if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
              nextIndex = findNextEnabledIndex(options, index, "prev");
            }
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
              nextIndex = findNextEnabledIndex(options, index, "next");
            }
            if (event.key === "Home") nextIndex = findNextEnabledIndex(options, -1, "next");
            if (event.key === "End") nextIndex = findNextEnabledIndex(options, options.length, "prev");
            if (nextIndex !== index) {
              const nextOption = options[nextIndex];
              if (nextOption && !nextOption.disabled && !disabled) selectValue(nextOption.value);
              itemRefs.current[nextIndex]?.focus();
            }
          };

          return (
            <div
              key={option.value}
              className={[
                "hx-segmented__item",
                selected && "hx-segmented__item--active",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                role="radio"
                aria-checked={selected}
                aria-disabled={itemDisabled || undefined}
                aria-label={accessibleLabel}
                tabIndex={itemDisabled ? -1 : rovingTabIndex}
                className="hx-segmented__radio"
                onClick={activateOption}
                onKeyDown={handleKeyDown}
              >
                {option.icon && (
                  <Icon
                    name={option.icon}
                    size={16}
                    color={itemDisabled ? "neutral" : "primary"}
                    ariaLabel={undefined}
                  />
                )}
                {!compact && <span className="hx-segmented__label">{option.label}</span>}
              </div>
              {selected && option.actionIcon && (
                <button
                  type="button"
                  className="hx-segmented__action"
                  aria-label={option.actionIcon.ariaLabel}
                  disabled={Boolean(option.actionIcon.disabled)}
                  onClick={(event) => {
                    event.stopPropagation();
                    option.actionIcon?.onClick(event);
                  }}
                >
                  <Icon name={option.actionIcon.icon} size={16} color={option.actionIcon.iconColor ?? "primary"} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  }),
  { displayName: "SegmentedControl" }
);

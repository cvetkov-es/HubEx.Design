import * as React from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionState {
  active: boolean;
  selected: boolean;
  disabled: boolean;
}

/**
 * DEVIATION from the official API: the official `SelectActionItem.icon` is an
 * SVG render prop (`(props: SVGProps<SVGSVGElement>) => ReactElement`). This
 * package is Material-font-based and never bundles inline SVG (see the ban
 * documented on Icon.tsx, and the same deviation Button.tsx already takes for
 * its own `icon`/`endIcon` props) — here `icon` is a Material Icons glyph
 * *name* string, rendered as `<span class="material">{name}</span>`.
 */
export interface SelectActionItem<TOption extends SelectOption = SelectOption> {
  icon: string;
  ariaLabel: string;
  onClick: (option: TOption | null, event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export interface SelectProps<TOption extends SelectOption = SelectOption>
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "onBlur" | "type" | "role" | "size"
  > {
  options: TOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, option: TOption | null) => void;
  /** Fires when the combobox text changes (filter typing), including when the value is cleared. */
  onQueryChange?: (query: string) => void;
  renderOption?: (option: TOption, state: SelectOptionState) => React.ReactNode;
  /** searchQuery is always `inputText.trim().toLowerCase()`; not called at all when it's empty. */
  filterBy?: (option: TOption, searchQuery: string) => boolean;
  allowClear?: boolean;
  actions?: SelectActionItem<TOption>[];
  label?: string;
  required?: boolean;
  disabled?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Legacy (0.1.x/0.2.x) back-compat alias: drives the same error styling as the official `errorText` presence used to. */
  invalid?: boolean;
}

function defaultFilterBy<TOption extends SelectOption>(option: TOption, searchQuery: string): boolean {
  return option.label.toLowerCase().includes(searchQuery);
}

function getFirstEnabledIndex(list: readonly SelectOption[]): number {
  return list.findIndex((option) => !option.disabled);
}

function getNextEnabledIndex(list: readonly SelectOption[], start: number, direction: 1 | -1): number {
  if (list.length === 0) return -1;
  let index = start;
  for (let step = 0; step < list.length; step++) {
    index += direction;
    if (index < 0) index = list.length - 1;
    if (index > list.length - 1) index = 0;
    if (!list[index]?.disabled) return index;
  }
  return -1;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component
// tree-shaking). Unlike the other components in this package, Select is a
// plain *named* generic function rather than a forwardRef component — see
// Table.tsx for the same precedent (naming the function is sufficient for a
// correct displayName without a side-effect assignment statement); TS
// generics and React.forwardRef don't mix cleanly, and the official API has
// no ref prop to forward anyway.
//
// This is a SELF-CONTAINED lightweight combobox: no floating-ui, no portal —
// the menu is a CSS `position: absolute` box inside the trigger's own
// `position: relative` wrapper (`.hx-select-control`). It also does NOT
// depend on InputBase (not built yet, see Task 9) or reuse the sibling
// <Input> component; the text trigger below is its own plain <input>.
// TODO(Task 9): could reuse InputBase once it exists, instead of the raw <input> here.
function SelectImpl<TOption extends SelectOption = SelectOption>(props: SelectProps<TOption>) {
  const {
    options,
    value,
    defaultValue,
    onChange,
    onQueryChange,
    renderOption,
    filterBy,
    allowClear,
    actions,
    label,
    required,
    disabled,
    onBlur,
    onFocus,
    onClick,
    onKeyDown,
    invalid,
    className,
    id,
    ...rest
  } = props;

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? "");
  const currentValue = isControlled ? value ?? "" : uncontrolledValue;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const baseId = React.useId();
  const inputId = id ?? `${baseId}-input`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const selectedOption = options.find((option) => option.value === currentValue) ?? null;

  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions =
    normalizedQuery === ""
      ? options
      : options.filter((option) =>
          filterBy ? filterBy(option, normalizedQuery) : defaultFilterBy(option, normalizedQuery)
        );

  const displayValue = open ? query : selectedOption?.label ?? "";

  // Re-anchor the active (highlighted) option whenever the menu opens or the
  // filtered list changes: prefer the current selection if it's still
  // present and enabled, otherwise fall back to the first enabled option.
  React.useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
      return;
    }
    const selectedIndex = filteredOptions.findIndex((option) => option.value === currentValue);
    if (selectedIndex >= 0 && !filteredOptions[selectedIndex]?.disabled) {
      setActiveIndex(selectedIndex);
      return;
    }
    setActiveIndex(getFirstEnabledIndex(filteredOptions));
    // Only re-anchor on open/query/options changes — `currentValue` is read
    // once per run, not tracked as its own trigger (selecting an option
    // already closes the menu via commitSelection, so this effect doesn't
    // need to re-fire purely because the selection changed while open).
    // eslint-disable-next-line
  }, [open, query, options]);

  function openMenu() {
    if (disabled) return;
    if (!open) {
      setOpen(true);
      setQuery("");
    }
  }

  function commitSelection(option: TOption) {
    if (option.disabled) return;
    if (!isControlled) setUncontrolledValue(option.value);
    onChange?.(option.value, option);
    setOpen(false);
    setQuery("");
  }

  function handleClear(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!isControlled) setUncontrolledValue("");
    onChange?.("", null);
    onQueryChange?.("");
    setQuery("");
    inputRef.current?.focus();
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setQuery(next);
    if (!open) setOpen(true);
    onQueryChange?.(next);
  }

  function handleFocus(event: React.FocusEvent<HTMLInputElement>) {
    openMenu();
    onFocus?.(event);
  }

  function handleClick(event: React.MouseEvent<HTMLInputElement>) {
    openMenu();
    onClick?.(event);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    handleKeyDownInternal(event);
    onKeyDown?.(event);
  }

  function handleKeyDownInternal(event: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (!open) {
          openMenu();
          return;
        }
        setActiveIndex((index) => getNextEnabledIndex(filteredOptions, index, 1));
        return;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (!open) {
          openMenu();
          return;
        }
        setActiveIndex((index) => getNextEnabledIndex(filteredOptions, index, -1));
        return;
      }
      case "Enter": {
        if (open && activeIndex >= 0) {
          const option = filteredOptions[activeIndex];
          if (option && !option.disabled) {
            event.preventDefault();
            commitSelection(option);
          }
        }
        return;
      }
      case "Escape": {
        if (open) {
          event.preventDefault();
          setOpen(false);
          setQuery("");
        }
        return;
      }
      default:
        return;
    }
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    setOpen(false);
    setQuery("");
    onBlur?.(event);
  }

  const showClear = Boolean(allowClear) && !disabled && currentValue !== "";
  const hasError = Boolean(invalid);

  const wrapCls = ["hx-select-wrap", className].filter(Boolean).join(" ");
  const inputCls = ["hx-select", hasError && "hx-select--invalid"].filter(Boolean).join(" ");

  return (
    <div className={wrapCls}>
      {label && (
        <label className="hx-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="hx-select-control">
        {/* `...rest` is spread FIRST; every controlled attribute below is set
            AFTER so it can never be silently clobbered by a same-named prop
            passed through native HTML attributes (see Button.tsx). */}
        <input
          {...rest}
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          className={inputCls}
          value={displayValue}
          disabled={disabled}
          required={required}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-invalid={hasError || undefined}
          {...(open ? { "aria-controls": listboxId } : {})}
          {...(open && activeIndex >= 0 ? { "aria-activedescendant": optionId(activeIndex) } : {})}
          onFocus={handleFocus}
          onClick={handleClick}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
        {showClear ? (
          <button
            type="button"
            className="hx-select__clear"
            aria-label="Clear"
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
          >
            <span className="material" aria-hidden="true">
              close
            </span>
          </button>
        ) : (
          <span className="hx-select__chevron material" aria-hidden="true">
            expand_more
          </span>
        )}
        {open && (
          <div className="hx-select-menu">
            <ul className="hx-select-listbox" role="listbox" id={listboxId} aria-label={label}>
              {filteredOptions.length === 0 && <li className="hx-select__empty">No results</li>}
              {filteredOptions.map((option, index) => {
                const isSelected = option.value === currentValue;
                const isActive = index === activeIndex;
                const optionCls = [
                  "hx-select-option",
                  isActive && "hx-select-option--active",
                  isSelected && "hx-select-option--selected",
                  option.disabled && "hx-select-option--disabled"
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <li
                    key={option.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    className={optionCls}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commitSelection(option)}
                  >
                    {renderOption
                      ? renderOption(option, { active: isActive, selected: isSelected, disabled: Boolean(option.disabled) })
                      : option.label}
                  </li>
                );
              })}
            </ul>
            {actions && actions.length > 0 && (
              // Simplification per the Task 5 brief: the official API renders
              // these buttons inline in the trigger row (left of the chevron/
              // clear). This build places them in a footer row of the open
              // menu instead, to avoid the extra trigger-row layout math for
              // a first pass — see the brief's explicit note allowing a
              // minimal `actions` implementation.
              <div className="hx-select__actions">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    type="button"
                    className="hx-select__action"
                    aria-label={action.ariaLabel}
                    disabled={action.disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => action.onClick(selectedOption, event)}
                  >
                    <span className="material" aria-hidden="true">
                      {action.icon}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const Select = /* @__PURE__ */ Object.assign(SelectImpl, { displayName: "Select" }) as typeof SelectImpl & {
  displayName: string;
};

import * as React from "react";

export interface TabItem {
  value: string;
  label: string;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "children"> {
  value: string;
  onChange: (value: string) => void;
  items: TabItem[];
}

// Plain named function component (no forwardRef) — see Table.tsx for why
// naming the function is sufficient to get a correct displayName without a
// separate `Tabs.displayName = "Tabs"` side-effect statement.
export function Tabs({ value, onChange, items, className, ...rest }: TabsProps) {
  const cls = ["hx-tabs", className].filter(Boolean).join(" ");
  return (
    <div {...rest} className={cls} role="tablist">
      {items.map((item) => {
        const active = item.value === value;
        const itemCls = ["hx-tabs__item", active && "hx-tabs__item--active"].filter(Boolean).join(" ");
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={itemCls}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

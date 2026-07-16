import * as React from "react";

export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: Date;
  onChange: (date: Date) => void;
  month?: Date;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function sameDay(a: Date | undefined, b: Date): boolean {
  return !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Always a fixed 6-week (42-cell) Monday-start grid, so the visible day
// count never varies between months — that keeps rendering (and testing)
// deterministic. Leading/trailing cells belong to the adjacent month and
// are rendered muted, but are still real, clickable dates.
function buildGrid(viewYear: number, viewMonthIdx: number): Date[] {
  const firstOfMonth = new Date(viewYear, viewMonthIdx, 1);
  const leadingOffset = (firstOfMonth.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const gridStart = new Date(viewYear, viewMonthIdx, 1 - leadingOffset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }
  return cells;
}

// See Button.tsx for why displayName is set via Object.assign instead of a
// separate assignment statement (it's required for cross-component tree-shaking).
export const Calendar = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ React.forwardRef<HTMLDivElement, CalendarProps>(
    ({ value, onChange, month, className, ...rest }, ref) => {
      const initial = month ?? value ?? new Date();
      const [view, setView] = React.useState({ year: initial.getFullYear(), monthIdx: initial.getMonth() });

      // Keep the displayed month in sync with a *controlling* `month` prop
      // (e.g. a host re-opening the popover on a different value); internal
      // prev/next navigation still works uncontrolled between syncs.
      React.useEffect(() => {
        if (!month) return;
        setView({ year: month.getFullYear(), monthIdx: month.getMonth() });
      }, [month?.getFullYear(), month?.getMonth()]);

      const cells = buildGrid(view.year, view.monthIdx);

      const goPrevMonth = () => {
        const d = new Date(view.year, view.monthIdx - 1, 1);
        setView({ year: d.getFullYear(), monthIdx: d.getMonth() });
      };
      const goNextMonth = () => {
        const d = new Date(view.year, view.monthIdx + 1, 1);
        setView({ year: d.getFullYear(), monthIdx: d.getMonth() });
      };

      const cls = ["hx-calendar", className].filter(Boolean).join(" ");

      return (
        <div {...rest} className={cls} ref={ref} role="group">
          <div className="hx-calendar__nav">
            <button type="button" className="hx-calendar__nav-btn" aria-label="Previous month" onClick={goPrevMonth}>
              ‹
            </button>
            <span className="hx-calendar__month-label">
              {MONTH_NAMES[view.monthIdx]} {view.year}
            </span>
            <button type="button" className="hx-calendar__nav-btn" aria-label="Next month" onClick={goNextMonth}>
              ›
            </button>
          </div>
          <div className="hx-calendar__head" role="row">
            {WEEKDAYS.map((label) => (
              <span key={label} className="hx-calendar__weekday">
                {label}
              </span>
            ))}
          </div>
          <div className="hx-calendar__grid" role="grid">
            {cells.map((cellDate) => {
              const muted = cellDate.getMonth() !== view.monthIdx;
              const selected = sameDay(value, cellDate);
              const dayCls = [
                "hx-calendar__day",
                muted && "hx-calendar__day--muted",
                selected && "hx-calendar__day--selected"
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={isoDate(cellDate)}
                  type="button"
                  className={dayCls}
                  data-date={isoDate(cellDate)}
                  aria-selected={selected}
                  onClick={() => onChange(cellDate)}
                >
                  {cellDate.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
  ),
  { displayName: "Calendar" }
);

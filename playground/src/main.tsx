import { useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
// The playground is the ONE consumer app in this monorepo, and consumer apps
// are exactly where the HubEx stylesheet is meant to be imported (see the
// comment atop packages/react/src/index.ts) — this import must appear exactly
// once, here, and nowhere inside @cvetkov_es/react itself.
import "@cvetkov_es/css";
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  BadgeCount,
  BadgeDot,
  BadgeShift,
  BadgeTag,
  Breadcrumbs,
  Button,
  Calendar,
  Checkbox,
  Chip,
  DatePicker,
  Drawer,
  Dropdown,
  Field,
  Icon,
  Info,
  Input,
  InputBase,
  Label,
  Link,
  Loader,
  Menu,
  Modal,
  Pagination,
  Popover,
  Radio,
  RadioGroup,
  Search,
  SegmentedControl,
  Select,
  Table,
  Tabs,
  Tag,
  Text,
  TextArea,
  Toggle,
  Tooltip
} from "@cvetkov_es/react";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: "grid", gap: 12, padding: "16px 0", borderBottom: "1px solid #e2e2e2" }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>{children}</div>
    </section>
  );
}

function ButtonSection() {
  return (
    <Section title="Button">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="dashed">Dashed</Button>
      <Button size="sm">Small</Button>
      <Button disabled>Disabled</Button>
    </Section>
  );
}

function InputFieldSection() {
  return (
    <Section title="Input / Field">
      <Field label="Email">
        <Input placeholder="you@hubex" />
      </Field>
      <Field label="Invalid">
        <Input invalid defaultValue="bad value" />
      </Field>
      <Input disabled defaultValue="Disabled" />
    </Section>
  );
}

function CheckboxSection() {
  return (
    <Section title="Checkbox">
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Disabled" disabled />
    </Section>
  );
}

function RadioSection() {
  return (
    <Section title="Radio">
      <Radio name="playground-radio" label="Option A" defaultChecked />
      <Radio name="playground-radio" label="Option B" />
      <Radio name="playground-radio" label="Disabled" disabled />
    </Section>
  );
}

function RadioGroupSection() {
  const [plan, setPlan] = useState("pro");
  return (
    <Section title="RadioGroup">
      <RadioGroup
        name="playground-plan"
        value={plan}
        onChange={(value) => setPlan(value)}
        direction="row"
        options={[
          { value: "free", label: "Free" },
          { value: "pro", label: "Pro" },
          { value: "enterprise", label: "Enterprise" },
        ]}
      />
      <span>Selected: {plan}</span>
    </Section>
  );
}

function ToggleSection() {
  const [on, setOn] = useState(false);
  return (
    <Section title="Toggle">
      {/* onChange signature is now (checked, event) — see Toggle.tsx; `name` is
          required now that Toggle is backed by a real <input type="checkbox">. */}
      <Toggle name="playground-toggle" checked={on} onChange={(checked) => setOn(checked)} />
      <span>{on ? "On" : "Off"}</span>
      <Toggle name="playground-toggle-disabled" checked disabled onChange={() => {}} />
    </Section>
  );
}

function SelectSection() {
  const options = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
    { value: "c", label: "Option C" },
  ];
  const [value, setValue] = useState("b");
  return (
    <Section title="Select">
      {/* Select is now a self-contained combobox: `options` + `value`/`onChange`
          replace the old `<Select><option/></Select>` children API. */}
      <Select options={options} value={value} onChange={(next) => setValue(next)} allowClear />
      <Select options={options} invalid placeholder="Invalid" />
    </Section>
  );
}

function TableSection() {
  return (
    <Section title="Table">
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Role</Table.HeadCell>
          </Table.Row>
        </Table.Head>
        <tbody>
          <Table.Row>
            <Table.Cell>Иван Петров</Table.Cell>
            <Table.Cell>Admin</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Анна Смирнова</Table.Cell>
            <Table.Cell>Editor</Table.Cell>
          </Table.Row>
        </tbody>
      </Table>
    </Section>
  );
}

function PaginationSection() {
  // BREAKING (0.3.x): the old {page, pageCount, onPageChange} API is gone —
  // Pagination is now item-count-driven: {totalItems, page, pageSize, onChange}.
  const [page, setPage] = useState(3);
  const [pageSize, setPageSize] = useState(25);
  return (
    <Section title="Pagination">
      <Pagination
        totalItems={162}
        page={page}
        pageSize={pageSize}
        onChange={({ page: nextPage, pageSize: nextSize }) => {
          setPage(nextPage);
          setPageSize(nextSize);
        }}
      />
    </Section>
  );
}

function ModalSection() {
  const [open, setOpen] = useState(false);
  return (
    <Section title="Modal">
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Подтверждение">
        <p>Вы уверены, что хотите продолжить?</p>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Button onClick={() => setOpen(false)}>OK</Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Отмена
          </Button>
        </div>
      </Modal>
    </Section>
  );
}

function DrawerSection() {
  const [open, setOpen] = useState(false);
  return (
    <Section title="Drawer">
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer open={open} onClose={() => setOpen(false)} side="right">
        <h3>Drawer content</h3>
        <p>Some panel content lives here.</p>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Close
        </Button>
      </Drawer>
    </Section>
  );
}

function TooltipSection() {
  return (
    <Section title="Tooltip">
      <Tooltip content="Подсказка сверху">
        <Button variant="secondary">Hover me</Button>
      </Tooltip>
    </Section>
  );
}

function TabsSection() {
  const [value, setValue] = useState("one");
  return (
    <Section title="Tabs">
      <Tabs
        value={value}
        onChange={setValue}
        items={[
          { value: "one", label: "One" },
          { value: "two", label: "Two" },
          { value: "three", label: "Three" }
        ]}
      />
      <span>Active: {value}</span>
    </Section>
  );
}

function MenuSection() {
  const [lastSelected, setLastSelected] = useState<string>("none");
  return (
    <Section title="Menu">
      <Menu
        trigger="Actions"
        items={[
          { label: "Edit", onSelect: () => setLastSelected("Edit") },
          { label: "Duplicate", onSelect: () => setLastSelected("Duplicate") },
          { label: "Delete", onSelect: () => setLastSelected("Delete") }
        ]}
      />
      <span>Last selected: {lastSelected}</span>
    </Section>
  );
}

function BreadcrumbsSection() {
  return (
    <Section title="Breadcrumbs">
      <Breadcrumbs
        items={[
          { label: "Home", href: "#" },
          { label: "Settings", href: "#" },
          { label: "Profile" }
        ]}
      />
    </Section>
  );
}

function TagChipBadgeSection() {
  return (
    <Section title="Tag / Chip / Badge family">
      <Tag color="neutral">Neutral</Tag>
      <Tag color="brand">Brand</Tag>
      <Tag color="danger">Danger</Tag>
      <Chip onRemove={() => {}}>Removable chip</Chip>
      {/* BREAKING (0.3.x): the old single `<Badge variant="dot|count|tag">` is
          split into the official DS's Badge family — Badge (semantic pill),
          BadgeDot, BadgeCount, BadgeTag, BadgeShift. */}
      <Badge variant="accent">Accent</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <BadgeDot ariaLabel="Unread" />
      <BadgeCount value={5} />
      <BadgeCount value={12} background="success" />
      <BadgeTag type="new" />
      <BadgeTag type="beta" tone="dark" />
      <BadgeShift status="online" tooltipContent="Online" />
      <BadgeShift status="offline" size="l" tooltipContent="Offline" />
    </Section>
  );
}

function AvatarLabelSection() {
  return (
    <Section title="Avatar / Label">
      {/* Avatar has no color/variant prop — it auto-picks one of the 9 real
          Figma colour sets from `name` (sum of UTF-16 char codes, mod 9; see
          colorSetFor in Avatar.tsx). These 9 names were verified by that same
          formula to land on a different set each, in order one..nine, so this
          row shows every set exactly once: Eve->one, Kim->two, Xia->three,
          Dana->four, Quy->five, Bob->six, Ann->seven, Hana->eight, Cy->nine. */}
      <Avatar name="Eve" />
      <Avatar name="Kim" />
      <Avatar name="Xia" />
      <Avatar name="Dana" />
      <Avatar name="Quy" />
      <Avatar name="Bob" />
      <Avatar name="Ann" />
      <Avatar name="Hana" />
      <Avatar name="Cy" />
      <Avatar name="Eve" size="sm" />
      <Label>Standalone label</Label>
      <AvatarGroup
        avatars={[{ name: "Eve" }, { name: "Kim" }, { name: "Xia" }, { name: "Dana" }, { name: "Quy" }]}
        maxVisible={3}
      />
    </Section>
  );
}

function TypographySection() {
  return (
    <Section title="Text / Link">
      <Text variant="font-H2">Heading H2</Text>
      <Text variant="font-body-regular">Body regular</Text>
      <Text variant="font-body-medium" color="color-text-secondary">
        Body medium, secondary color
      </Text>
      <Link href="https://example.com" external>
        External link
      </Link>
      <Link href="#" disabled>
        Disabled link
      </Link>
    </Section>
  );
}

function LoaderSection() {
  return (
    <Section title="Loader">
      <Loader size="small" color="color-icon-primary" />
      <Loader size="medium" color="color-icon-secondary" />
      <Loader size="large" color="color-icon-error" />
    </Section>
  );
}

function InputVariantsSection() {
  const [searchValue, setSearchValue] = useState("");
  const [inputBaseValue, setInputBaseValue] = useState("");
  return (
    <Section title="InputBase / Search / TextArea">
      <InputBase
        value={inputBaseValue}
        onChange={(event) => setInputBaseValue(event.target.value)}
        placeholder="InputBase"
        leftIcon={
          <span className="material" aria-hidden="true">
            person
          </span>
        }
      />
      <Search value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search" />
      <TextArea placeholder="TextArea (auto-size)" autoSize maxRows={4} textLimit={120} allowClear />
    </Section>
  );
}

function OverlaysSection() {
  return (
    <Section title="Popover / Dropdown / Info">
      <Popover content="Popover panel content">
        <Button variant="secondary">Open popover</Button>
      </Popover>
      <Dropdown
        content={
          <ul className="hx-dropdown__list" style={{ margin: 0, padding: 0, listStyle: "none" }}>
            <li>
              <button type="button" className="hx-menu__item">
                Edit
              </button>
            </li>
            <li>
              <button type="button" className="hx-menu__item">
                Delete
              </button>
            </li>
          </ul>
        }
      >
        <Button variant="secondary">Open dropdown</Button>
      </Dropdown>
      <Info content="Extra context shown in a popover." />
    </Section>
  );
}

function SegmentedControlSection() {
  const [value, setValue] = useState("day");
  return (
    <Section title="SegmentedControl">
      <SegmentedControl
        value={value}
        onChange={(next) => setValue(next)}
        options={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
        ]}
      />
    </Section>
  );
}

function AlertSection() {
  return (
    <Section title="Alert">
      <Alert severity="info" title="Информация">
        Полезное сообщение.
      </Alert>
      <Alert severity="success" title="Успех">
        Операция выполнена.
      </Alert>
      <Alert severity="warning" title="Внимание">
        Проверьте данные.
      </Alert>
      <Alert severity="danger" title="Ошибка">
        Что-то пошло не так.
      </Alert>
    </Section>
  );
}

function IconSection() {
  return (
    <Section title="Icon">
      <Icon name="home" />
      <Icon name="settings" size={32} />
      <Icon name="delete" size={16} />
      <span style={{ fontSize: 12, color: "#888" }}>
        (Requires the Material Icons font, loaded by the host app — not bundled here; if the font isn't
        loaded you'll just see the glyph name as text, e.g. "home".)
      </span>
    </Section>
  );
}

function CalendarSection() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <Section title="Calendar">
      <Calendar value={date} onChange={setDate} />
      <span>Selected: {date ? date.toDateString() : "none"}</span>
    </Section>
  );
}

function DatePickerSection() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return (
    <Section title="DatePicker">
      <DatePicker value={date} onChange={setDate} placeholder="Choose a date" />
    </Section>
  );
}

function App() {
  return (
    <div style={{ padding: 24, display: "grid", gap: 8, maxWidth: 960, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1>HubEx UI — Playground</h1>
      <p style={{ color: "#666" }}>Kitchen sink of every @cvetkov_es/react component, for visual review against source/Образцы.</p>
      <ButtonSection />
      <InputFieldSection />
      <CheckboxSection />
      <RadioSection />
      <RadioGroupSection />
      <ToggleSection />
      <SelectSection />
      <TableSection />
      <PaginationSection />
      <ModalSection />
      <DrawerSection />
      <TooltipSection />
      <TabsSection />
      <MenuSection />
      <BreadcrumbsSection />
      <TagChipBadgeSection />
      <AvatarLabelSection />
      <TypographySection />
      <LoaderSection />
      <InputVariantsSection />
      <OverlaysSection />
      <SegmentedControlSection />
      <AlertSection />
      <IconSection />
      <CalendarSection />
      <DatePickerSection />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

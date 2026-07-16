import { useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
// The playground is the ONE consumer app in this monorepo, and consumer apps
// are exactly where the HubEx stylesheet is meant to be imported (see the
// comment atop packages/react/src/index.ts) — this import must appear exactly
// once, here, and nowhere inside @hubex/react itself.
import "@hubex/css";
import {
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Calendar,
  Checkbox,
  Chip,
  DatePicker,
  Drawer,
  Field,
  Icon,
  Input,
  Label,
  Menu,
  Modal,
  Pagination,
  Radio,
  Select,
  Table,
  Tabs,
  Tag,
  Toggle,
  Tooltip
} from "@hubex/react";

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
      <Button variant="danger">Danger</Button>
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

function ToggleSection() {
  const [on, setOn] = useState(false);
  return (
    <Section title="Toggle">
      <Toggle checked={on} onChange={setOn} />
      <span>{on ? "On" : "Off"}</span>
      <Toggle checked disabled onChange={() => {}} />
    </Section>
  );
}

function SelectSection() {
  return (
    <Section title="Select">
      <Select defaultValue="b">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
        <option value="c">Option C</option>
      </Select>
      <Select invalid defaultValue="">
        <option value="" disabled>
          Invalid
        </option>
      </Select>
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
  const [page, setPage] = useState(3);
  return (
    <Section title="Pagination">
      <Pagination page={page} pageCount={7} onPageChange={setPage} />
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
    <Section title="Tag / Chip / Badge">
      <Tag color="neutral">Neutral</Tag>
      <Tag color="brand">Brand</Tag>
      <Tag color="danger">Danger</Tag>
      <Chip onRemove={() => {}}>Removable chip</Chip>
      <Badge variant="dot" />
      <Badge variant="count" count={5} />
      <Badge variant="tag">New</Badge>
    </Section>
  );
}

function AvatarLabelSection() {
  return (
    <Section title="Avatar / Label">
      <Avatar name="Иван Петров" size="md" />
      <Avatar name="Анна Смирнова" size="sm" />
      <Label>Standalone label</Label>
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
      <p style={{ color: "#666" }}>Kitchen sink of every @hubex/react component, for visual review against source/Образцы.</p>
      <ButtonSection />
      <InputFieldSection />
      <CheckboxSection />
      <RadioSection />
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
      <AlertSection />
      <IconSection />
      <CalendarSection />
      <DatePickerSection />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

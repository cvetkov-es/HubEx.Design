import { render, screen } from "@testing-library/react";
import { Table } from "./Table";

test("renders a table with the base class", () => {
  render(
    <Table>
      <tbody>
        <tr>
          <td>cell</td>
        </tr>
      </tbody>
    </Table>
  );
  expect(screen.getByRole("table")).toHaveClass("hx-table");
});

test("renders head, row, and cells via the static subcomponents", () => {
  render(
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.HeadCell>Name</Table.HeadCell>
        </Table.Row>
      </Table.Head>
      <tbody>
        <Table.Row>
          <Table.Cell>Value</Table.Cell>
        </Table.Row>
      </tbody>
    </Table>
  );
  const table = screen.getByRole("table");
  expect(table).toHaveClass("hx-table");

  const columnHeader = screen.getByRole("columnheader", { name: "Name" });
  expect(columnHeader).toHaveClass("hx-table__headcell");
  expect(columnHeader.closest("thead")).toHaveClass("hx-table__head");
  expect(columnHeader.closest("tr")).toHaveClass("hx-table__row");

  const cell = screen.getByRole("cell", { name: "Value" });
  expect(cell).toHaveClass("hx-table__cell");
  expect(cell.closest("tr")).toHaveClass("hx-table__row");
});

test("preserves custom className on Table alongside base class", () => {
  render(
    <Table className="custom">
      <tbody>
        <tr>
          <td>cell</td>
        </tr>
      </tbody>
    </Table>
  );
  expect(screen.getByRole("table")).toHaveClass("hx-table", "custom");
});

test("preserves custom className on Table.Row alongside base class", () => {
  render(
    <table>
      <tbody>
        <Table.Row className="custom">
          <Table.Cell>cell</Table.Cell>
        </Table.Row>
      </tbody>
    </table>
  );
  expect(screen.getByRole("row")).toHaveClass("hx-table__row", "custom");
});

test("forwards native attributes on Table.Cell (e.g. colSpan)", () => {
  render(
    <table>
      <tbody>
        <tr>
          <Table.Cell colSpan={2}>wide</Table.Cell>
        </tr>
      </tbody>
    </table>
  );
  expect(screen.getByRole("cell", { name: "wide" })).toHaveAttribute("colspan", "2");
});

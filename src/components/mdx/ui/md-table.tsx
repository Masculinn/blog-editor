import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FC, HtmlHTMLAttributes } from "react";

type MdTableProps = HtmlHTMLAttributes<HTMLTableElement>;
type MdTHeadProps = HtmlHTMLAttributes<HTMLTableSectionElement>;
type MdTBodyProps = HtmlHTMLAttributes<HTMLTableSectionElement>;
type MdTTrProps = HtmlHTMLAttributes<HTMLTableRowElement>;
type MdTTdProps = HtmlHTMLAttributes<HTMLTableCellElement>;
type MdTThProps = HtmlHTMLAttributes<HTMLTableCellElement>;
type MdTCaptionProps = HtmlHTMLAttributes<HTMLTableCaptionElement>;

const MdTable: FC<MdTableProps> = (props) => (
  <Table
    {...props}
    className="table-sticky table-zebra table-hover rounded-2xl my-4"
  />
);
const MdThead: FC<MdTHeadProps> = (props) => <TableHeader {...props} />;
const MdTbody: FC<MdTBodyProps> = (props) => <TableBody {...props} />;
const MdTr: FC<MdTTrProps> = (props) => <TableRow {...props} />;
const MdTh: FC<MdTThProps> = (props) => <TableHead {...props} />;
const MdTd: FC<MdTTdProps> = (props) => <TableCell {...props} />;
const MdCaption: FC<MdTCaptionProps> = (props) => <TableCaption {...props} />;

export { MdCaption, MdTable, MdTbody, MdTd, MdTh, MdThead, MdTr };

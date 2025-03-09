"use client";

import { type ColumnDef } from "@tanstack/react-table";


import { IBarkery } from "../../types/barkeries-type";
import selectColumn from "./column/select-column";
import idColumn from "./column/id-column";
import actionColumn from "./column/action-column";
import bakeyNameColumn from "./column/bakery-name-column";
import ownerNameColumn from "./column/owner-name-column";

export function fetchBakeryTableColumnDefs(): ColumnDef<IBarkery, unknown>[] {
  return [
    selectColumn,
    idColumn,
    bakeyNameColumn,
    ownerNameColumn,
    actionColumn


    // bookingTimeColumn,
  ];
}

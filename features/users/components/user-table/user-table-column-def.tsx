"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { IUser } from "../../types/user-type";
import selectColumn from "./column/select-column";
import idColumn from "./column/id-column";
import nameColumn from "./column/name-column";


export function fetchUsesrsTableColumnDefs(): ColumnDef<IUser, unknown>[] {
  return [
    selectColumn,
    idColumn,
    nameColumn
    // bookingTimeColumn,

  ];
}

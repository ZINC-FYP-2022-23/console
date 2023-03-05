/**
 * @file Utility functions for {@link https://tanstack.com/table/v8 TanStack Table}.
 */

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SortDirection } from "@tanstack/react-table";

/**
 * @param sort Sort direction. `false` means restore original order.
 * @returns The sort icon to display in the table's header column.
 */
export const getHeaderColumnSortIcon = (sort: SortDirection | false) => {
  switch (sort) {
    case "asc":
      return <FontAwesomeIcon icon={["fas", "sort-up"]} />;
    case "desc":
      return <FontAwesomeIcon icon={["fas", "sort-down"]} />;
    default:
      return null;
  }
};

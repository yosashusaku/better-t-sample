import { createColumnHelper } from "@tanstack/react-table"
import { Building2, Calendar } from "lucide-react"
import { roleLabels, statusColors, statusLabels } from "../../constants"
import type { ProjectWithDetails } from "../../types"
import { Badge } from "../ui/badge"

const columnHelper = createColumnHelper<ProjectWithDetails>()

export const projectColumns = [
  columnHelper.accessor("name", {
    header: "プロジェクト名",
    cell: (info) => (
      <div className="font-medium">
        {info.getValue()}
        {info.row.original.description && (
          <p className="text-sm text-gray-500 mt-1">{info.row.original.description}</p>
        )}
      </div>
    ),
  }),
  columnHelper.accessor("status", {
    header: "ステータス",
    cell: (info) => (
      <Badge className={statusColors[info.getValue()]}>{statusLabels[info.getValue()]}</Badge>
    ),
  }),
  columnHelper.accessor("customer", {
    header: "顧客",
    cell: (info) => {
      const customer = info.getValue()
      return customer ? (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span>{customer.displayName || customer.name}</span>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  }),
  columnHelper.accessor("memberRole", {
    header: "役割",
    cell: (info) => <Badge variant="outline">{roleLabels[info.getValue()]}</Badge>,
  }),
  columnHelper.accessor("startDate", {
    header: "開始日",
    cell: (info) => {
      const date = info.getValue()
      return date ? (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(date).toLocaleDateString("ja-JP")}</span>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  }),
  columnHelper.accessor("endDate", {
    header: "終了予定日",
    cell: (info) => {
      const date = info.getValue()
      return date ? (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(date).toLocaleDateString("ja-JP")}</span>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  }),
]

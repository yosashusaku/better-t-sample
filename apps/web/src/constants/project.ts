import type { ProjectWithDetails } from "../types"

export const statusColors: Record<ProjectWithDetails["status"], string> = {
  planning: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  on_hold: "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
}

export const statusLabels: Record<ProjectWithDetails["status"], string> = {
  planning: "計画中",
  active: "進行中",
  on_hold: "保留",
  completed: "完了",
  cancelled: "中止",
}

export const roleLabels: Record<ProjectWithDetails["memberRole"], string> = {
  owner: "オーナー",
  admin: "管理者",
  member: "メンバー",
  viewer: "閲覧者",
}

import { Link } from "@tanstack/react-router"
import { ArrowLeft, Building2, Calendar, Edit, MoreHorizontal, Users } from "lucide-react"
import { roleLabels, statusColors, statusLabels } from "../../constants"
import type { ProjectWithDetails } from "../../types"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface ProjectHeaderProps {
  project: {
    id: string
    name: string
    description: string | null
    status: ProjectWithDetails["status"]
    customer: ProjectWithDetails["customer"]
    organization: ProjectWithDetails["organization"]
    memberRole: ProjectWithDetails["memberRole"]
    startDate: Date | null
    endDate: Date | null
    createdAt: Date
  }
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="border-b bg-white">
      <div className="container mx-auto py-6">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/project">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              プロジェクト一覧に戻る
            </Button>
          </Link>
        </div>

        {/* Header Content */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge className={statusColors[project.status]}>{statusLabels[project.status]}</Badge>
              <Badge variant="outline">{roleLabels[project.memberRole]}</Badge>
            </div>

            {project.description && (
              <p className="text-gray-600 text-lg mb-4">{project.description}</p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              {project.customer && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{project.customer.displayName || project.customer.name}</span>
                </div>
              )}

              {project.organization && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{project.organization.name}</span>
                </div>
              )}

              {project.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>開始: {new Date(project.startDate).toLocaleDateString("ja-JP")}</span>
                </div>
              )}

              {project.endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>終了予定: {new Date(project.endDate).toLocaleDateString("ja-JP")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  メンバー管理
                </DropdownMenuItem>
                <DropdownMenuItem>設定</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">プロジェクトを削除</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

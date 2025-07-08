import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { trpc } from "@/utils/trpc"
import { Button } from "../ui/button"
import { ProjectFilters } from "./project-filters"
import { ProjectStatsSection } from "./project-stats"
import { ProjectTable } from "./project-table"

export function ProjectList() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  // Get project statistics
  const { data: stats } = useQuery(trpc.project.stats.queryOptions())

  // Get project list
  const { data: projects = [], isLoading, error } = useQuery(trpc.project.list.queryOptions())

  // Filter projects based on search and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      search === "" ||
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description?.toLowerCase().includes(search.toLowerCase()) ||
      project.customer?.name.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "" || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">エラーが発生しました: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">プロジェクト一覧</h1>
          <p className="text-gray-600">参加中のプロジェクトを管理します</p>
        </div>
        <Button>新しいプロジェクト</Button>
      </div>

      {/* Statistics */}
      {stats && <ProjectStatsSection stats={stats} />}

      {/* Filters */}
      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Projects Table */}
      <ProjectTable projects={filteredProjects} />
    </div>
  )
}

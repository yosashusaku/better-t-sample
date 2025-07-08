import { useQuery } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import { trpc } from "../../utils/trpc"
import { ProjectHeader } from "./project-header"
import { ProjectTabs } from "./project-tabs"

export function ProjectDetail() {
  const { projectId } = useParams({ from: "/project/$projectId" })

  const {
    data: project,
    isLoading,
    error,
  } = useQuery(trpc.project.get.queryOptions({ id: projectId }))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">プロジェクトを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">エラーが発生しました</h2>
            <p className="text-red-600 mb-4">{error.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">プロジェクトが見つかりません</h2>
          <p className="text-gray-600">
            指定されたプロジェクトは存在しないか、アクセス権限がありません。
          </p>
        </div>
      </div>
    )
  }

  // Transform the project data to match the expected format
  const transformedProject = {
    ...project,
    memberRole: project.currentUserRole as "owner" | "admin" | "member" | "viewer",
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
    startDate: project.startDate ? new Date(project.startDate) : null,
    endDate: project.endDate ? new Date(project.endDate) : null,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader project={transformedProject} />
      <ProjectTabs projectId={projectId} />
    </div>
  )
}

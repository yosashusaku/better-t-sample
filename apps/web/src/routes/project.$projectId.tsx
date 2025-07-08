import { createFileRoute } from "@tanstack/react-router"
import { ProjectDetail } from "../components/project"

function ProjectDetailPage() {
  return <ProjectDetail />
}

export const Route = createFileRoute("/project/$projectId")({
  component: ProjectDetailPage,
})

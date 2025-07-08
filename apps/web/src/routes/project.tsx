import { createFileRoute } from "@tanstack/react-router"
import { ProjectList } from "../components/project"

function ProjectListPage() {
  return <ProjectList />
}

export const Route = createFileRoute("/project")({
  component: ProjectListPage,
})

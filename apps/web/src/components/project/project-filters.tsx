import { Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface ProjectFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
}

export function ProjectFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: ProjectFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>フィルター</CardTitle>
        <CardDescription>プロジェクトを検索・絞り込みできます</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="プロジェクト名、説明、顧客名で検索..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">すべて</SelectItem>
              <SelectItem value="active">進行中</SelectItem>
              <SelectItem value="planning">計画中</SelectItem>
              <SelectItem value="on_hold">保留中</SelectItem>
              <SelectItem value="completed">完了</SelectItem>
              <SelectItem value="cancelled">中止</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

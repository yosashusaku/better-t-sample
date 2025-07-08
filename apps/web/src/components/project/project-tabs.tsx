import {
  BarChart3,
  Calendar,
  CheckSquare,
  DollarSign,
  FileText,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface ProjectTabsProps {
  projectId: string
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const tabs = [
    { value: "overview", label: "概要", icon: BarChart3 },
    { value: "tasks", label: "タスク", icon: CheckSquare },
    { value: "timeline", label: "スケジュール", icon: Calendar },
    { value: "budget", label: "予算・コスト", icon: DollarSign },
    { value: "files", label: "ファイル", icon: FileText },
    { value: "team", label: "チーム", icon: Users },
    { value: "discussions", label: "議論", icon: MessageSquare },
    { value: "settings", label: "設定", icon: Settings },
  ]

  console.log("Project ID:", projectId)

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.value}
                type="button"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-white shadow-sm hover:bg-gray-50"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">完了タスク</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">進行状況</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">65%</div>
                <p className="text-xs text-muted-foreground">+5% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">チームメンバー</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">+1 new member</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">予算使用率</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">¥780,000 / ¥1,000,000</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>最近のアクティビティ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">新しいタスクが作成されました</p>
                      <p className="text-gray-500">2時間前</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">UIデザインレビューが完了</p>
                      <p className="text-gray-500">4時間前</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">新しいメンバーが参加</p>
                      <p className="text-gray-500">1日前</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>次の締切</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">プロトタイプ完成</p>
                      <p className="text-sm text-gray-500">フロントエンド開発</p>
                    </div>
                    <div className="text-sm text-red-600">明日</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">テスト実行</p>
                      <p className="text-sm text-gray-500">QA</p>
                    </div>
                    <div className="text-sm text-yellow-600">3日後</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">リリース準備</p>
                      <p className="text-sm text-gray-500">DevOps</p>
                    </div>
                    <div className="text-sm text-gray-600">1週間後</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

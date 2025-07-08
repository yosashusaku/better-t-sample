import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Calendar, DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { trpcClient } from "../../utils/trpc"

interface AdvertisingBudgetProps {
  projectId: string
}

type MediaType = "digital" | "tv" | "newspaper" | "magazine" | "outdoor" | "radio" | "other"

interface MonthlyBudget {
  id: string
  projectId: string
  year: number
  month: number
  plannedBudget: number
  actualSpent: number
  variance: number
  variancePercentage: number
  mediaType: string
  notes?: string
}

export function AdvertisingBudget({ projectId }: AdvertisingBudgetProps) {
  const currentYear = new Date().getFullYear()

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [editingMonth, setEditingMonth] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    plannedBudget: "",
    actualSpent: "",
    mediaType: "digital" as MediaType,
    notes: ""
  })

  // Get monthly budgets from API
  const { data: monthlyBudgets = [], refetch } = useQuery({
    queryKey: ['advertising.budget.getMonthlyBudgets', { projectId, year: selectedYear }],
    queryFn: () => trpcClient.advertising.budget.getMonthlyBudgets.query({
      projectId,
      year: selectedYear
    })
  })

  // Mutation for saving budget data
  const savebudgetMutation = useMutation({
    mutationFn: (data: {
      projectId: string
      year: number
      month: number
      plannedBudget: number
      actualSpent: number
      mediaType: MediaType
      notes?: string
    }) => trpcClient.advertising.budget.saveMonthlyBudget.mutate(data),
    onSuccess: () => {
      toast.success("月別予算データを保存しました")
      refetch()
      setEditingMonth(null)
    },
    onError: (error: Error) => {
      toast.error(`保存に失敗しました: ${error.message}`)
    }
  })

  const months = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月"
  ]

  const mediaTypes = [
    { value: "digital", label: "デジタル広告" },
    { value: "tv", label: "テレビCM" },
    { value: "newspaper", label: "新聞広告" },
    { value: "magazine", label: "雑誌広告" },
    { value: "outdoor", label: "屋外広告" },
    { value: "radio", label: "ラジオ広告" },
    { value: "other", label: "その他" }
  ]

  const handleEdit = (month: number, data: MonthlyBudget) => {
    setEditingMonth(month)
    setFormData({
      plannedBudget: data.plannedBudget.toString(),
      actualSpent: data.actualSpent.toString(),
      mediaType: data.mediaType as MediaType,
      notes: data.notes || ""
    })
  }

  const handleSave = (month: number) => {
    const plannedBudget = parseFloat(formData.plannedBudget) || 0
    const actualSpent = parseFloat(formData.actualSpent) || 0

    savebudgetMutation.mutate({
      projectId,
      year: selectedYear,
      month,
      plannedBudget,
      actualSpent,
      mediaType: formData.mediaType,
      notes: formData.notes
    })
  }

  const handleCancel = () => {
    setEditingMonth(null)
    setFormData({
      plannedBudget: "",
      actualSpent: "",
      mediaType: "digital" as MediaType,
      notes: ""
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(value)
  }

  const totalPlanned = monthlyBudgets.reduce((sum, item) => sum + item.plannedBudget, 0)
  const totalActual = monthlyBudgets.reduce((sum, item) => sum + item.actualSpent, 0)
  const totalVariance = totalActual - totalPlanned
  const totalVariancePercentage = totalPlanned ? (totalVariance / totalPlanned) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">年間予算</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPlanned)}</div>
            <p className="text-xs text-muted-foreground">
              {selectedYear}年度
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">実績値</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalActual)}</div>
            <p className="text-xs text-muted-foreground">
              累計実績
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">差異</CardTitle>
            {totalVariance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(totalVariance))}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalVariancePercentage.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">執行率</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPlanned ? ((totalActual / totalPlanned) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              予算に対する実績
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Year Selector and Monthly Budget Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>月別広告予算管理</CardTitle>
              <CardDescription>
                月ごとの広告予算と実績を管理します
              </CardDescription>
            </div>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>月</TableHead>
                <TableHead>媒体種別</TableHead>
                <TableHead className="text-right">予算</TableHead>
                <TableHead className="text-right">実績</TableHead>
                <TableHead className="text-right">差異</TableHead>
                <TableHead className="text-right">差異率</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyBudgets.map((item: MonthlyBudget, index: number) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{months[index]}</TableCell>
                  <TableCell>
                    {editingMonth === item.month ? (
                      <Select
                        value={formData.mediaType}
                        onValueChange={(value) => 
                          setFormData({ ...formData, mediaType: value as MediaType })
                        }
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mediaTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      mediaTypes.find(t => t.value === item.mediaType)?.label || "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingMonth === item.month ? (
                      <Input
                        type="number"
                        value={formData.plannedBudget}
                        onChange={(e) => 
                          setFormData({ ...formData, plannedBudget: e.target.value })
                        }
                        className="w-[120px] text-right"
                      />
                    ) : (
                      formatCurrency(item.plannedBudget)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingMonth === item.month ? (
                      <Input
                        type="number"
                        value={formData.actualSpent}
                        onChange={(e) => 
                          setFormData({ ...formData, actualSpent: e.target.value })
                        }
                        className="w-[120px] text-right"
                      />
                    ) : (
                      formatCurrency(item.actualSpent)
                    )}
                  </TableCell>
                  <TableCell className={`text-right ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(item.variance))}
                  </TableCell>
                  <TableCell className={`text-right ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.variancePercentage.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    {editingMonth === item.month ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(item.month)}
                        >
                          保存
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          取消
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item.month, item)}
                      >
                        編集
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

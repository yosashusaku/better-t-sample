import type { RouterOutputs } from "./trpc"

export type ProjectWithDetails = RouterOutputs["project"]["list"][0]
export type ProjectStats = RouterOutputs["project"]["stats"]

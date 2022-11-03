export interface NodeLauncherNode {
  id: string
  ticker: string
  address: string
}

export interface NPGetVersionJsonRpcResponse {
  error?: string
  result?: string
}

export interface NodeGetAllJsonRpcResponse {
  error?: string
  result?: NodeLauncherNode[]
}

export interface PoktGetPrometheusDataJsonRpcResponse {
  error?: string
  result?: string
}

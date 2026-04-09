export interface Room {
  id: number
  name: string
  extraCharge: number
  noServiceCharge: boolean
}

export interface Table {
  id: number
  name: string
}

export type ProductType = 'kg' | 'litr' | 'portsiya'
export type ProductCategory = 'asosiy' | 'ichimlik' | 'shirinlik' | 'gazak'

export interface Product {
  id: number
  name: string
  type: ProductType
  price: number
  image: string | null
  category: ProductCategory
}

export type EmployeeStatus = 'working' | 'free'

export interface Employee {
  id: string
  familyName: string
  status: EmployeeStatus
}

export interface OrderItem {
  productId: number
  quantity: number
  priceAtOrder: number
}

export interface ActiveOrder {
  roomId: number
  startTime: string
  items: OrderItem[]
}

export type ActiveOrders = Record<string, ActiveOrder>

export type RemoveReason = 'client_rejected' | 'employee_error'

export interface RemovedItem {
  productId: number
  name: string
  quantity: number
  reason: RemoveReason
  employeeId: string | null
  fine: number
}

export interface HistoryItem {
  productId: number
  name: string
  quantity: number
  price: number
  total: number
}

export interface HistoryEntry {
  id: number
  roomId: number
  roomName: string
  closedAt: string
  items: HistoryItem[]
  subtotal: number
  serviceCharge: number
  roomCharge: number
  grandTotal: number
  removedItems: RemovedItem[]
}

export interface Fine {
  id: number
  employeeId: string
  employeeName: string
  orderId: number
  reason: string
  amount: number
  comment: string
  date: string
}

export interface DecreasePenalty {
  productId: number
  productName: string
  previousQty: number
  newQty: number
  reason: RemoveReason
  comment: string
  employeeId: string | null
  fineAmount: number
}

'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from "./components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Switch } from "./components/ui/switch"
import { ScrollArea } from "./components/ui/scroll-area"

// Menu data
const menuItems = [
  { id: 1, name: 'Tandoori Chicken', price: 295, category: 'Starter' },
  { id: 2, name: 'Lasooni Dal Tadka', price: 275, category: 'Main Course' },
  { id: 3, name: 'Hyderabadi Murg Biryani', price: 375, category: 'Main Course' },
  { id: 4, name: 'Tandoori Roti', price: 30, category: 'Breads' },
  { id: 5, name: 'Butter Naan', price: 40, category: 'Breads' },
  { id: 6, name: 'Cold Coffee', price: 150, category: 'Beverages' },
]

const categories = ['Starter', 'Main Course', 'Breads', 'Beverages', 'Desserts']

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface TableData {
  customerName: string
  customerPhone: string
  isOccupied: boolean
  isPrepared: boolean
  isPaid: boolean
  order: OrderItem[]
  orderDate?: Date
  orderTime?: string
  invoiceNumber?: string
}

interface OrderHistory {
  id: number
  customerName: string
  tableNumber: number
  date: string
  time: string
  total: number
  order: OrderItem[]
  invoiceNumber: string
}

interface State {
  page: 'home' | 'tables' | 'status' | 'menu' | 'history' | 'viewDetails'
  selectedTable: number | null
  selectedCategory: string
  tableData: { [key: number]: TableData }
  orderHistory: OrderHistory[]
  editingCustomer: boolean
  selectedOrder: OrderHistory | null
}

class RestaurantPOSClass extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props)
    this.state = {
      page: 'home',
      selectedTable: null,
      selectedCategory: categories[0],
      tableData: {},
      orderHistory: [
        {
          id: 12,
          customerName: 'Raj Singh',
          tableNumber: 3,
          date: '11/10/24',
          time: '2:30 pm',
          total: 760,
          order: [
            { id: 1, name: 'Tandoori Chicken', price: 295, quantity: 2 },
            { id: 2, name: 'Butter Naan', price: 40, quantity: 3 },
            { id: 3, name: 'Cold Coffee', price: 150, quantity: 1 }
          ],
          invoiceNumber: 'INV20241110001'
        },
        {
          id: 13,
          customerName: 'Sher Khan',
          tableNumber: 1,
          date: '11/10/24',
          time: '1:23 pm',
          total: 160,
          order: [
            { id: 4, name: 'Tandoori Roti', price: 30, quantity: 2 },
            { id: 6, name: 'Cold Coffee', price: 150, quantity: 1 }
          ],
          invoiceNumber: 'INV20241110002'
        },
      ],
      editingCustomer: false,
      selectedOrder: null
    }
  }

  getCurrentTableData = (): TableData => {
    const { selectedTable, tableData } = this.state
    return tableData[selectedTable ?? 0] || {
      customerName: '',
      customerPhone: '',
      isOccupied: false,
      isPrepared: false,
      isPaid: false,
      order: []
    }
  }

  updateTableData = (data: Partial<TableData>) => {
    const { selectedTable, tableData } = this.state
    if (!selectedTable) return

    this.setState({
      tableData: {
        ...tableData,
        [selectedTable]: {
          ...this.getCurrentTableData(),
          ...data
        }
      }
    })
  }

  addToOrder = (item: typeof menuItems[0]) => {
    const currentOrder = this.getCurrentTableData().order
    const existingItem = currentOrder.find(orderItem => orderItem.id === item.id)
    
    if (existingItem) {
      this.updateTableData({
        order: currentOrder.map(orderItem =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        )
      })
    } else {
      this.updateTableData({
        order: [...currentOrder, { ...item, quantity: 1 }]
      })
    }
  }

  updateQuantity = (itemId: number, newQuantity: number) => {
    const currentOrder = this.getCurrentTableData().order
    if (newQuantity === 0) {
      this.updateTableData({
        order: currentOrder.filter(item => item.id !== itemId)
      })
    } else {
      this.updateTableData({
        order: currentOrder.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      })
    }
  }

  calculateTotal = () => {
    const order = this.getCurrentTableData().order
    const subtotal = order.reduce((total, item) => total + (item.price * item.quantity), 0)
    const gst = subtotal * 0.025 // 2.5% GST
    const sgst = subtotal * 0.025 // 2.5% SGST
    return {
      subtotal,
      gst,
      sgst,
      total: subtotal + gst + sgst
    }
  }

  confirmOrder = () => {
    const currentTable = this.getCurrentTableData()
    const { total } = this.calculateTotal()
    const date = new Date()
    
    this.updateTableData({
      orderDate: date,
      orderTime: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      invoiceNumber: `INV${date.getTime().toString().slice(-8)}`,
      isOccupied: true
    })

    const newOrder: OrderHistory = {
      id: this.state.orderHistory.length + 1,
      customerName: currentTable.customerName,
      tableNumber: this.state.selectedTable ?? 0,
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      total,
      order: currentTable.order,
      invoiceNumber: `INV${date.getTime().toString().slice(-8)}`
    }

    this.setState(prevState => ({
      orderHistory: [newOrder, ...prevState.orderHistory],
      page: 'status'
    }))
  }

  resetTable = () => {
    const { selectedTable, tableData } = this.state
    if (!selectedTable) return
    
    const newTableData = { ...tableData }
    delete newTableData[selectedTable]
    
    this.setState({
      tableData: newTableData,
      page: 'tables'
    })
  }

  renderHomePage = () => (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-normal">Home Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full rounded-xl h-12 text-lg font-normal"
            onClick={() => this.setState({ page: 'tables' })}
          >
            Restaurant POS Interface
          </Button>
          <Button 
            className="w-full rounded-xl h-12 text-lg font-normal"
            variant="outline"
            onClick={() => this.setState({ page: 'history' })}
          >
            Order History
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  renderTablesPage = () => (
    <div className="container mx-auto p-4">
      <Card className="border-2">
        <CardHeader className="flex flex-row items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => this.setState({ page: 'home' })}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <CardTitle className="flex-1 text-center text-2xl font-normal">
            Restaurant POS System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 15 }, (_, i) => i + 1).map((tableNum) => {
              const isOccupied = this.state.tableData[tableNum]?.isOccupied
              return (
                <Button
                  key={tableNum}
                  variant="outline"
                  className={`h-24 rounded-xl text-lg font-normal ${
                    isOccupied ? 'bg-red-100 hover:bg-red-200' : 'bg-green-100 hover:bg-green-200'
                  }`}
                  onClick={() => this.setState({ 
                    selectedTable: tableNum,
                    page: 'status'
                  })}
                >
                  Table {tableNum}
                  <br />
                  {isOccupied ? 'Occupied' : 'Vacant'}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  renderStatusPage = () => {
    const currentTable = this.getCurrentTableData()
    const { subtotal, gst, sgst, total } = this.calculateTotal()

    return (
      <div className="container mx-auto p-4">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => this.setState({ page: 'tables' })}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <CardTitle className="flex-1 text-center text-2xl font-normal">
              Table {this.state.selectedTable}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="border">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={currentTable.customerName}
                      onChange={(e) => this.updateTableData({ customerName: e.target.value })}
                      disabled={this.state.editingCustomer}
                    />
                  </div>
                  <div>
                    <Label>Phone no.</Label>
                    <Input
                      value={currentTable.customerPhone}
                      onChange={(e) => this.updateTableData({ customerPhone: e.target.value })}
                      disabled={this.state.editingCustomer}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => this.setState({ editingCustomer: false })}
                    >
                      Edit Details
                    </Button>
                    <Button
                      onClick={() => this.setState({ editingCustomer: true })}
                    >
                      Confirm Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="border px-4 py-2 rounded-lg">Table Status</Label>
                  <div className="flex items-center space-x-2">
                    <span>Occupied</span>
                    <Switch
                      checked={currentTable.isOccupied}
                      onCheckedChange={(checked) => this.updateTableData({ isOccupied: checked })}
                    />
                    <span>Vacant</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="border px-4 py-2 rounded-lg">Order Status</Label>
                  <div className="flex items-center space-x-2">
                    <span>Prepared</span>
                    <Switch
                      checked={currentTable.isPrepared}
                      onCheckedChange={(checked) => this.updateTableData({ isPrepared: checked })}
                    />
                    <span>Served</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="border px-4 py-2 rounded-lg">Payment Status</Label>
                  <div className="flex items-center space-x-2">
                    <span>Paid</span>
                    <Switch
                      checked={currentTable.isPaid}
                      onCheckedChange={(checked) => this.updateTableData({ isPaid: checked })}
                    />
                    <span>Un-Paid</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {currentTable.order.length > 0 && (
              <Card className="border">
                <CardContent className="pt-6">
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Invoice Number: {currentTable.invoiceNumber}</span>
                        <span>
                          {currentTable.orderDate?.toLocaleDateString()} {currentTable.orderTime}
                        </span>
                      </div>
                      <div className="border-b pb-2">
                        <div className="grid grid-cols-4 font-medium">
                          <span>Item</span>
                          <span className="text-center">Qty</span>
                          <span className="text-right">Rate</span>
                          <span className="text-right">Total</span>
                        </div>
                      </div>
                      {currentTable.order.map((item) => (
                        <div key={item.id} className="grid grid-cols-4">
                          <span>{item.name}</span>
                          <span className="text-center">{item.quantity}</span>
                          <span className="text-right">₹{item.price.toFixed(2)}</span>
                          <span className="text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 space-y-1">
                        <div className="flex justify-between">
                          <span>Sub Total:</span>
                          <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>CGST @2.5%:</span>
                          <span>₹{gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>SGST @2.5%:</span>
                          <span>₹{sgst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Total:</span>
                          <span>₹{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </CardContent>

          <div className="p-6 flex justify-between">
            <Button
              variant="outline"
              className={currentTable.order.length > 0 ? 'bg-gray-100' : ''}
              onClick={() => this.setState({ page: 'menu' })}
            >
              {currentTable.order.length > 0 ? 'Edit Order' : 'Place Order'}
            </Button>
            {currentTable.order.length > 0 && (
              <Button variant="outline">
                Send Bill via SMS
              </Button>
            )}
            <Button
              variant="outline"
              onClick={this.resetTable}
            >
              Reset Table
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  renderMenuPage = () => {
    const currentOrder = this.getCurrentTableData().order
    const { total } = this.calculateTotal()

    return (
      <div className="container mx-auto p-4">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => this.setState({ page: 'status' })}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <CardTitle className="flex-1 text-center text-2xl font-normal">
              Table {this.state.selectedTable} - Menu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={this.state.selectedCategory === category ? "default" : "outline"}
                  className="rounded-xl"
                  onClick={() => this.setState({ selectedCategory: category })}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="border">
                <CardContent className="pt-6">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="grid grid-cols-2 gap-4">
                      {menuItems
                        .filter(item => item.category === this.state.selectedCategory)
                        .map((item) => {
                          const orderItem = currentOrder.find(i => i.id === item.id)
                          return (
                            <Button
                              key={item.id}
                              variant="outline"
                              className={`h-24 flex flex-col rounded-xl ${
                                orderItem ? 'bg-gray-100' : ''
                              }`}
                              onClick={() => this.addToOrder(item)}
                            >
                              {item.name}
                              <span>₹{item.price}</span>
                            </Button>
                          )
                        })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="pt-6">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {currentOrder.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <span>{item.name}</span>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => this.updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => this.updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                            <span className="w-20 text-right">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <div className="p-6 border-t mt-4 flex justify-between items-center">
                  <span className="font-medium">Total: ₹{total.toFixed(2)}</span>
                  <Button onClick={this.confirmOrder}>Confirm Order</Button>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  renderHistoryPage = () => (
    <div className="container mx-auto p-4">
      <Card className="border-2">
        <CardHeader className="flex flex-row items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => this.setState({ page: 'home' })}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <CardTitle className="flex-1 text-center text-2xl font-normal">
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">Sr. No.</th>
                  <th className="pb-2">Customer Name</th>
                  <th className="pb-2">Table</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Total Cost</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {this.state.orderHistory.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-4">{order.id}</td>
                    <td>{order.customerName}</td>
                    <td>{order.tableNumber}</td>
                    <td>{order.date}</td>
                    <td>{order.time}</td>
                    <td>₹{order.total}</td>
                    <td>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => this.setState({ page: 'viewDetails', selectedOrder: order })}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )

  renderViewDetailsPage = () => {
    const { selectedOrder } = this.state
    if (!selectedOrder) return null

    return (
      <div className="container mx-auto p-4">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => this.setState({ page: 'history', selectedOrder: null })}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <CardTitle className="flex-1 text-center text-2xl font-normal">
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Customer Information</h3>
                  <p>Name: {selectedOrder.customerName}</p>
                  <p>Table: {selectedOrder.tableNumber}</p>
                  <p>Date: {selectedOrder.date}</p>
                  <p>Time: {selectedOrder.time}</p>
                  <p>Invoice Number: {selectedOrder.invoiceNumber}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Order Items</h3>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-2">Item</th>
                        <th className="pb-2">Quantity</th>
                        <th className="pb-2">Price</th>
                        <th className="pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2">{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>₹{item.price}</td>
                          <td>₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Bill Summary</h3>
                  <p>Subtotal: ₹{selectedOrder.total}</p>
                  <p>GST (5%): ₹{(selectedOrder.total * 0.05).toFixed(2)}</p>
                  <p className="font-bold">Total: ₹{(selectedOrder.total * 1.05).toFixed(2)}</p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    )
  }

  render() {
    switch (this.state.page) {
      case 'home':
        return this.renderHomePage()
      case 'tables':
        return this.renderTablesPage()
      case 'status':
        return this.renderStatusPage()
      case 'menu':
        return this.renderMenuPage()
      case 'history':
        return this.renderHistoryPage()
      case 'viewDetails':
        return this.renderViewDetailsPage()
      default:
        return null
    }
  }
}

export default function RestaurantPOS() {
  return <RestaurantPOSClass />
}
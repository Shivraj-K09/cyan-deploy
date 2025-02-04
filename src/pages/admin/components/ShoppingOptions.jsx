import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"

const productData = [
  { id: 1, name: "Product 1", price: 19.99, inventory: 50 },
  { id: 2, name: "Product 2", price: 29.99, inventory: 30 },
  { id: 3, name: "Product 3", price: 39.99, inventory: 20 },
  { id: 4, name: "Product 4", price: 49.99, inventory: 10 },
]

export function ShoppingOptions() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState(productData)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.price.toString().includes(searchTerm) ||
      product.inventory.toString().includes(searchTerm),
  )

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleEdit = (id) => {
    console.log(`Editing product with id: ${id}`)
  }

  const handleDelete = (id) => {
    setProducts(products.filter((product) => product.id !== id))
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex space-x-2">
        <Input placeholder="Search products..." className="max-w-sm" value={searchTerm} onChange={handleSearch} />
        <Button>Search</Button>
        <Button variant="outline">Add Product</Button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Product Name</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Price</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Inventory</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow
                key={product.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">{product.name}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">${product.price.toFixed(2)}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{product.inventory}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(product.id)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleDelete(product.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  )
}


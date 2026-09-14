import { Router } from 'express'
import { store } from '../db/store.js'

const router = Router()

// GET /api/products - list all products with optional filtering & sorting
router.get('/', async (req, res) => {
  try {
    const { category, gender, search, featured, sort } = req.query
    let products = await store.getProducts()

    if (category && category.toLowerCase() !== 'all') {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (gender && gender.toLowerCase() !== 'all') {
      products = products.filter(
        (p) =>
          p.gender.toLowerCase() === gender.toLowerCase() ||
          p.gender.toLowerCase() === 'unisex'
      )
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase()
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      )
    }

    if (featured === 'true') {
      products = products.filter((p) => p.isFeatured)
    }

    if (sort === 'price-asc') {
      products.sort((a, b) => a.numericPrice - b.numericPrice)
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.numericPrice - a.numericPrice)
    }

    res.json({
      success: true,
      count: products.length,
      products
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/products/:id - get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await store.getProductById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    res.json({ success: true, product })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router

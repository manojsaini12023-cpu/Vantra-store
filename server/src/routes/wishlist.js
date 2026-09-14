import { Router } from 'express'
import { store } from '../db/store.js'

const router = Router()

// GET /api/wishlist - Get wishlisted item IDs and full product details
router.get('/', async (_req, res) => {
  try {
    const [wishlistIds, products] = await Promise.all([
      store.getWishlist(),
      store.getProducts()
    ])

    const savedProducts = wishlistIds
      .map((id) => products.find((p) => p.id === Number(id)))
      .filter(Boolean)

    res.json({
      success: true,
      count: wishlistIds.length,
      wishlist: wishlistIds,
      items: savedProducts
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/wishlist/toggle - Add or remove an item from wishlist
router.post('/toggle', async (req, res) => {
  try {
    const { productId } = req.body
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required to toggle wishlist.'
      })
    }

    const { isWishlisted, wishlist } = await store.toggleWishlist(productId)
    const products = await store.getProducts()
    const product = products.find((p) => p.id === Number(productId))

    res.json({
      success: true,
      isWishlisted,
      productId: Number(productId),
      count: wishlist.length,
      wishlist,
      message: isWishlisted
        ? `Added "${product?.title || 'Item'}" to your Wishlist!`
        : `Removed "${product?.title || 'Item'}" from your Wishlist.`
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router

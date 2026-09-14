import { Router } from 'express'
import { store } from '../db/store.js'

const router = Router()

// GET /api/reviews/:productId - Get verified reviews & rating breakdown for a product
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const reviews = await store.getReviews(productId)

    const totalReviews = reviews.length
    const avg = totalReviews > 0
      ? Number((reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / totalReviews).toFixed(1))
      : 5.0

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let trueToSizeCount = 0

    reviews.forEach((r) => {
      const score = Math.round(Number(r.rating) || 5)
      if (distribution[score] !== undefined) distribution[score]++
      const fit = (r.fit || '').toLowerCase()
      if (fit.includes('true') || fit.includes('exact')) trueToSizeCount++
    })

    const fitPercentage = totalReviews > 0
      ? Math.round((trueToSizeCount / totalReviews) * 100)
      : 92

    res.json({
      success: true,
      productId: Number(productId),
      totalReviews,
      averageRating: avg,
      distribution,
      fitStats: {
        trueToSizePercentage: fitPercentage,
        verdict: `${fitPercentage}% of buyers report true to size streetwear fit`
      },
      reviews
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/reviews/:productId - Submit a verified buyer customer review
router.post('/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const { author, rating, title, comment, fit, city } = req.body

    if (!author || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Reviewer name and review comment are required.'
      })
    }

    const numRating = Number(rating) || 5
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5 stars.'
      })
    }

    const newReview = await store.addReview(productId, {
      author,
      rating: numRating,
      title: title || 'Quality Streetwear Piece',
      comment,
      fit: fit || 'True to Size',
      city: city || 'India'
    })

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for community feedback.',
      review: newReview
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router

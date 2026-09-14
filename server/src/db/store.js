import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { hashPassword } from '../utils/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.resolve(__dirname, '../../data')

const INITIAL_PRODUCTS = [
  {
    id: 1,
    title: 'UNLEASH THE DRAGON TEE',
    price: '₹3,799',
    numericPrice: 3799,
    category: 'T-Shirt',
    gender: 'Unisex',
    image: '/products/tshirt-unleash-dragon.png',
    fit: 'flatlay',
    isFeatured: true,
    stock: 25,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Heavyweight 240 GSM French Terry cotton tee with high-density dragon artwork print and relaxed boxy drape.'
  },
  {
    id: 2,
    title: 'HOT WHEELS RAGLAN TEE',
    price: '₹3,499',
    numericPrice: 3499,
    category: 'T-Shirt',
    gender: 'Unisex',
    image: '/products/tshirt-hotwheels.png',
    fit: 'flatlay',
    isFeatured: true,
    stock: 18,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Contrast raglan sleeve vintage streetwear tee featuring automotive graphic print and drop shoulders.'
  },
  {
    id: 3,
    title: 'OVERDRIVE RACING MOTO TEE',
    price: '₹3,999',
    numericPrice: 3999,
    category: 'T-Shirt',
    gender: 'Men',
    image: '/products/tshirt-overdrive.png',
    fit: 'flatlay',
    isFeatured: true,
    stock: 12,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Motorsport-inspired heavy wash jersey with screenprinted racing typography and distressed ribbed crewneck.'
  },
  {
    id: 4,
    title: 'GENTLE DESIRES OVERSIZED TEE',
    price: '₹3,299',
    numericPrice: 3299,
    category: 'T-Shirt',
    gender: 'Unisex',
    image: '/products/tshirt-gentle-desires.png',
    fit: 'flatlay',
    isFeatured: false,
    stock: 30,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Minimalist oversized silhouette in vintage stone-washed cotton with tonal back embroidery.'
  },
  {
    id: 5,
    title: 'TAKE IT EASY GRAFFITI TEE',
    price: '₹2,999',
    numericPrice: 2999,
    category: 'T-Shirt',
    gender: 'Unisex',
    image: '/products/tshirt-take-it-easy.png',
    fit: 'flatlay',
    isFeatured: true,
    stock: 15,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Rebellious urban graphic tee with graffiti-inspired puff print on ultra-soft combed cotton.'
  },
  {
    id: 6,
    title: 'JOURNEY HOODIE',
    price: '₹7,999',
    numericPrice: 7999,
    category: 'Hoodie',
    gender: 'Unisex',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    fit: '',
    isFeatured: false,
    stock: 20,
    sizes: ['S', 'M', 'L', 'XL'],
    description: '450 GSM heavyweight fleece hoodie with double-layer hood, brushed interior, and dropped shoulders.'
  },
  {
    id: 7,
    title: 'BLOCK HOODIE',
    price: '₹8,999',
    numericPrice: 8999,
    category: 'Hoodie',
    gender: 'Men',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    fit: '',
    isFeatured: false,
    stock: 14,
    sizes: ['M', 'L', 'XL'],
    description: 'Color-blocked architectural hoodie crafted from custom-dyed loopback cotton terry.'
  },
  {
    id: 8,
    title: 'MONO SHIRT',
    price: '₹4,999',
    numericPrice: 4999,
    category: 'Shirt',
    gender: 'Men',
    image: 'https://images.unsplash.com/photo-1521369909026-2afed882baee?auto=format&fit=crop&w=900&q=80',
    fit: '',
    isFeatured: false,
    stock: 16,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Tailored boxy overshirt with concealed horn button placket and utility chest flap pockets.'
  },
  {
    id: 9,
    title: 'RAW SHIRT',
    price: '₹5,999',
    numericPrice: 5999,
    category: 'Shirt',
    gender: 'Women',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    fit: '',
    isFeatured: false,
    stock: 22,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Raw-hem unstructured shirt woven in premium Japanese cotton-linen blend for effortless layering.'
  },
  {
    id: 10,
    title: 'BNKRS 92 OFF-SHOULDER CROP SWEATSHIRT',
    price: '₹3,499',
    numericPrice: 3499,
    category: 'Hoodie',
    gender: 'Women',
    image: '/products/women-bnkrs-crop-sweatshirt.png',
    fit: '',
    isFeatured: true,
    stock: 20,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Raw-hem off-shoulder cropped fleece sweatshirt in pale butter yellow, featuring vintage collegiate BNKRS 92 screenprint and ribbed drop sleeves.'
  },
  {
    id: 11,
    title: 'RED DRAGON OVERSIZED GRAPHIC TEE',
    price: '₹3,799',
    numericPrice: 3799,
    category: 'T-Shirt',
    gender: 'Women',
    image: '/products/women-dragon-oversized-tee.jpg',
    fit: '',
    isFeatured: true,
    stock: 25,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Vibrant crimson heavyweight 240 GSM combed cotton tee featuring mythical azure Japanese dragon artwork and relaxed drop-shoulder drape.'
  },
  {
    id: 12,
    title: "BUSY BUZZIN' OVERSIZED VINTAGE TEE",
    price: '₹3,299',
    numericPrice: 3299,
    category: 'T-Shirt',
    gender: 'Women',
    image: '/products/women-bee-oversized-tee.jpg',
    fit: '',
    isFeatured: true,
    stock: 18,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Stone cream organic cotton tee with giant archival bee illustration, gothic red typography, and distressed vintage wash.'
  },
  {
    id: 13,
    title: 'NEON PINK STREETWEAR DAD CAP',
    price: '₹1,999',
    numericPrice: 1999,
    category: 'Shirt',
    gender: 'Women',
    image: '/products/women-pink-cap.png',
    fit: '',
    isFeatured: true,
    stock: 35,
    sizes: ['S', 'M', 'L'],
    description: 'High-saturation bubblegum pink 6-panel low-profile curved brim baseball cap with adjustable metal back clasp.'
  },
  {
    id: 14,
    title: 'POISON SCORPION OVERSIZED TEE',
    price: '₹3,899',
    numericPrice: 3899,
    category: 'T-Shirt',
    gender: 'Women',
    image: '/products/women-poison-scorpion-tee.jpg',
    fit: '',
    isFeatured: true,
    stock: 15,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Midnight black heavy jersey tee featuring high-voltage blue electric scorpion artwork, metal eyelet aesthetics, and gothic Poison typography.'
  },
  {
    id: 15,
    title: 'SPIDER-MAN RETRO POSTAGE OVERSIZED TEE',
    price: '₹3,499',
    numericPrice: 3499,
    category: 'T-Shirt',
    gender: 'Men',
    image: '/products/men-spiderman-red-tee.png',
    fit: '',
    isFeatured: true,
    stock: 28,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Vibrant crimson heavy-gauge 260 GSM boxy streetwear tee with stamp-framed Spider-Man comic artwork print.'
  },
  {
    id: 16,
    title: 'MILES MORALES GLITCH STREET TEE',
    price: '₹3,699',
    numericPrice: 3699,
    category: 'T-Shirt',
    gender: 'Men',
    image: '/products/men-spiderman-miles-tee.png',
    fit: '',
    isFeatured: true,
    stock: 22,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Washed charcoal drop-shoulder oversized tee featuring Miles Morales glitch-split mask typography on back.'
  },
  {
    id: 17,
    title: 'WILD & FREE GEOMETRIC WOLF TEE',
    price: '₹3,299',
    numericPrice: 3299,
    category: 'T-Shirt',
    gender: 'Men',
    image: '/products/men-wolf-graphic-tee.png',
    fit: '',
    isFeatured: true,
    stock: 25,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Warm sand stone-washed cotton tee with dual-tone geometric half-wolf artwork and typography back print.'
  },
  {
    id: 18,
    title: 'HORIZON BLUE RIBBED BABY TEE',
    price: '₹2,699',
    numericPrice: 2699,
    category: 'T-Shirt',
    gender: 'Women',
    image: '/products/women-blue-baby-tee.png',
    fit: '',
    isFeatured: true,
    stock: 30,
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Fitted slate-blue cropped baby tee in soft stretch-rib cotton with micro cap sleeves and crew neckline.'
  },
  {
    id: 19,
    title: 'TACTICAL OLIVE CORSET HALTER TOP',
    price: '₹3,899',
    numericPrice: 3899,
    category: 'Shirt',
    gender: 'Women',
    image: '/products/women-olive-halter-corset.jpg',
    fit: '',
    isFeatured: true,
    stock: 18,
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Structured military olive denim halterneck top with front metal zipper, contrasting tan leather collar trim, and contoured panels.'
  },
  {
    id: 20,
    title: 'CRIMSON RED OVERSIZED STREETWEAR HOODIE',
    price: '₹4,499',
    numericPrice: 4499,
    category: 'Hoodie',
    gender: 'Women',
    image: '/products/women-crimson-oversized-hoodie.png',
    fit: '',
    isFeatured: true,
    stock: 24,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Vibrant scarlet red 380 GSM heavyweight cotton fleece oversized hoodie with front kangaroo pocket, drop shoulder silhouette, and minimalist white chest embroidery.'
  },
  {
    id: 21,
    title: 'SPIDER-WEB EMBROIDERED WHITE HOODIE',
    price: '₹4,899',
    numericPrice: 4899,
    category: 'Hoodie',
    gender: 'Women',
    image: '/products/women-spider-web-white-hoodie.png',
    fit: '',
    isFeatured: true,
    stock: 20,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Clean optical white heavyweight fleece hoodie featuring striking scarlet red spider-web embroidered chest centerpiece, relaxed slouch fit, and ribbed trim.'
  },
  {
    id: 22,
    title: 'TRAVIS SCOTT FLAME TOUR HOODIE',
    price: '₹5,499',
    numericPrice: 5499,
    category: 'Hoodie',
    gender: 'Women',
    image: '/products/women-travis-scott-flame-hoodie.png',
    fit: '',
    isFeatured: true,
    stock: 18,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Midnight black heavyweight cotton hoodie featuring high-impact Travis Scott fire-flame typography back print, tour lyrics, and relaxed boxy drape.'
  },
  {
    id: 23,
    title: 'BUTTER CREAM RELAXED FLEECE HOODIE',
    price: '₹4,299',
    numericPrice: 4299,
    category: 'Hoodie',
    gender: 'Women',
    image: '/products/women-butter-cream-hoodie.png',
    fit: '',
    isFeatured: true,
    stock: 26,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Ultra-soft pastel butter cream brushed fleece hoodie with seamless hood construction, oversized cocoon silhouette, and tonal micro branding.'
  },
  {
    id: 24,
    title: 'FOREST GREEN COZY OVERSIZED HOODIE',
    price: '₹4,299',
    numericPrice: 4299,
    category: 'Hoodie',
    gender: 'Women',
    image: '/products/women-forest-green-hoodie.png',
    fit: '',
    isFeatured: true,
    stock: 22,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Rich deep forest green 400 GSM heavyweight brushed back fleece hoodie with double-layered hood, dropped shoulders, and kangaroo utility pocket.'
  }
]

const INITIAL_PROMOS = [
  {
    code: 'VANTA10',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 0,
    description: '10% OFF on all orders'
  },
  {
    code: 'VANTA500',
    discountType: 'fixed',
    discountValue: 500,
    minOrder: 2500,
    description: '₹500 OFF on orders above ₹2,500'
  },
  {
    code: 'DROPDAY',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 5000,
    description: '15% VIP discount for orders above ₹5,000'
  }
]

const INITIAL_REVIEWS = [
  {
    id: 1,
    productId: 1,
    author: 'Aarav Sharma',
    city: 'Mumbai',
    rating: 5,
    title: 'The fabric drape is insane!',
    comment: 'The 240 GSM weight is heavy yet super breathable. Dragon graphics have a tactile rubberized puff feel. Definitely fits boxy and oversized, go true to size for that streetwear silhouette.',
    fit: 'True to Size',
    verified: true,
    createdAt: '2026-08-12T10:30:00Z',
    helpfulCount: 38
  },
  {
    id: 2,
    productId: 1,
    author: 'Kabir Verma',
    city: 'Delhi',
    rating: 5,
    title: 'Best luxury tee I own',
    comment: 'Washed it three times, zero shrink and colors remain pitch black and vivid. Worth every rupee.',
    fit: 'Runs Slightly Large',
    verified: true,
    createdAt: '2026-08-20T14:15:00Z',
    helpfulCount: 19
  },
  {
    id: 3,
    productId: 2,
    author: 'Rohan Mehra',
    city: 'Bengaluru',
    rating: 5,
    title: 'Raglan cut is timeless',
    comment: 'Contrast sleeves and vintage motorsports look get compliments everywhere. Stitching quality is 10/10.',
    fit: 'True to Size',
    verified: true,
    createdAt: '2026-08-25T16:45:00Z',
    helpfulCount: 24
  },
  {
    id: 4,
    productId: 10,
    author: 'Ananya Roy',
    city: 'Bengaluru',
    rating: 5,
    title: 'Cutest cropped fleece drop!',
    comment: 'The raw hem crop sits perfectly with high-waisted cargos. Pale butter color is subtle and collegiate print is stunning.',
    fit: 'True to Size',
    verified: true,
    createdAt: '2026-09-02T11:20:00Z',
    helpfulCount: 42
  },
  {
    id: 5,
    productId: 11,
    author: 'Sneha Patel',
    city: 'Ahmedabad',
    rating: 5,
    title: 'Electric dragon artwork turns heads',
    comment: 'The contrast of crimson red with the azure dragon is straight out of Harajuku streetwear. Boxy drape is on point.',
    fit: 'Oversized',
    verified: true,
    createdAt: '2026-09-05T09:10:00Z',
    helpfulCount: 15
  }
]

class Store {
  constructor() {
    this.dataDir = DATA_DIR
  }

  async init() {
    await fs.mkdir(this.dataDir, { recursive: true })
    await this._ensureFile('products.json', INITIAL_PRODUCTS)
    await this._ensureFile('promos.json', INITIAL_PROMOS)
    await this._ensureFile('orders.json', [])
    await this._ensureFile('subscribers.json', [])
    await this._ensureFile('reviews.json', INITIAL_REVIEWS)
    await this._ensureFile('wishlist.json', [1, 2])
    await this._ensureFile('users.json', [])
    await this.initAdminUser()
  }

  async _ensureFile(fileName, defaultData) {
    const filePath = path.join(this.dataDir, fileName)
    try {
      await fs.access(filePath)
    } catch {
      await this._writeFile(filePath, defaultData)
    }
  }

  async _readFile(fileName) {
    const filePath = path.join(this.dataDir, fileName)
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  }

  async _writeFile(filePath, data) {
    const tempPath = `${filePath}.tmp.${Date.now()}`
    const content = JSON.stringify(data, null, 2)
    await fs.writeFile(tempPath, content, 'utf-8')
    await fs.rename(tempPath, filePath)
  }

  async getProducts() {
    return this._readFile('products.json')
  }

  async getProductById(id) {
    const products = await this.getProducts()
    return products.find((p) => p.id === Number(id)) || null
  }

  async getPromos() {
    return this._readFile('promos.json')
  }

  async getOrders() {
    return this._readFile('orders.json')
  }

  async getOrderById(orderId) {
    const orders = await this.getOrders()
    return orders.find((o) => o.orderId === orderId) || null
  }

  async createOrder(orderData) {
    const orders = await this.getOrders()
    orders.unshift(orderData)
    const filePath = path.join(this.dataDir, 'orders.json')
    await this._writeFile(filePath, orders)
    return orderData
  }

  async updateOrderStatus(orderId, status) {
    const orders = await this.getOrders()
    const orderIndex = orders.findIndex((o) => o.orderId === orderId || o.orderNumber === orderId)
    if (orderIndex === -1) return null

    orders[orderIndex].status = status
    orders[orderIndex].updatedAt = new Date().toISOString()

    const trackingMessages = {
      CONFIRMED: 'Order Placed • Preparing for Dispatch',
      PROCESSING: 'Packing & Quality Check In Progress',
      SHIPPED: 'In Transit with Express Courier Air',
      DELIVERED: 'Delivered to Customer',
      CANCELLED: 'Order Cancelled'
    }

    if (orders[orderIndex].shipping) {
      orders[orderIndex].shipping.trackingStatus =
        trackingMessages[status] || `Status updated to ${status}`
    }

    const filePath = path.join(this.dataDir, 'orders.json')
    await this._writeFile(filePath, orders)
    return orders[orderIndex]
  }

  async deleteOrder(orderId) {
    const orders = await this.getOrders()
    const initialLen = orders.length
    const filtered = orders.filter((o) => o.orderId !== orderId && o.orderNumber !== orderId)
    if (filtered.length === initialLen) return false
    const filePath = path.join(this.dataDir, 'orders.json')
    await this._writeFile(filePath, filtered)
    return true
  }

  async clearOrders() {
    const filePath = path.join(this.dataDir, 'orders.json')
    await this._writeFile(filePath, [])
    return { success: true, count: 0 }
  }

  async addProduct(productData) {
    const products = await this.getProducts()
    const nextId = products.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1
    const numericPrice = Number(productData.numericPrice) || 0

    const newProduct = {
      id: nextId,
      title: (productData.title || 'NEW STREETWEAR PIECE').trim(),
      price: `₹${numericPrice.toLocaleString('en-IN')}`,
      numericPrice,
      category: productData.category || 'T-Shirt',
      gender: productData.gender || 'Unisex',
      image: productData.image || '/products/tshirt-unleash-dragon.png',
      fit: productData.fit || '',
      isFeatured: Boolean(productData.isFeatured),
      stock: Number(productData.stock) >= 0 ? Number(productData.stock) : 20,
      sizes: Array.isArray(productData.sizes) && productData.sizes.length > 0
        ? productData.sizes
        : ['S', 'M', 'L', 'XL'],
      description: (productData.description || '').trim()
    }

    products.unshift(newProduct)
    const filePath = path.join(this.dataDir, 'products.json')
    await this._writeFile(filePath, products)
    return newProduct
  }

  async updateProduct(id, updates) {
    const products = await this.getProducts()
    const index = products.findIndex((p) => p.id === Number(id))
    if (index === -1) return null

    const existing = products[index]
    const updated = { ...existing, ...updates, id: existing.id }

    if (updates.numericPrice !== undefined) {
      const num = Number(updates.numericPrice) || 0
      updated.numericPrice = num
      updated.price = `₹${num.toLocaleString('en-IN')}`
    }

    if (updates.stock !== undefined) {
      updated.stock = Math.max(0, Number(updates.stock) || 0)
    }

    if (updates.isFeatured !== undefined) {
      updated.isFeatured = Boolean(updates.isFeatured)
    }

    products[index] = updated
    const filePath = path.join(this.dataDir, 'products.json')
    await this._writeFile(filePath, products)
    return updated
  }

  async deleteProduct(id) {
    const products = await this.getProducts()
    const initialLen = products.length
    const filtered = products.filter((p) => p.id !== Number(id))
    if (filtered.length === initialLen) return false

    const filePath = path.join(this.dataDir, 'products.json')
    await this._writeFile(filePath, filtered)
    return true
  }

  async addPromo(promoData) {
    const promos = await this.getPromos()
    const cleanCode = (promoData.code || '').trim().toUpperCase()
    if (!cleanCode) {
      return { added: false, message: 'Promo code is required.' }
    }

    if (promos.some((p) => p.code.toUpperCase() === cleanCode)) {
      return { added: false, message: `Promo code ${cleanCode} already exists.` }
    }

    const newPromo = {
      code: cleanCode,
      discountType: promoData.discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Number(promoData.discountValue) || 10,
      minOrder: Number(promoData.minOrder) || 0,
      description: (promoData.description || `${cleanCode} Special Discount`).trim()
    }

    promos.push(newPromo)
    const filePath = path.join(this.dataDir, 'promos.json')
    await this._writeFile(filePath, promos)
    return { added: true, promo: newPromo }
  }

  async deletePromo(code) {
    const promos = await this.getPromos()
    const cleanCode = (code || '').trim().toUpperCase()
    const initialLen = promos.length
    const filtered = promos.filter((p) => p.code.toUpperCase() !== cleanCode)
    if (filtered.length === initialLen) return false

    const filePath = path.join(this.dataDir, 'promos.json')
    await this._writeFile(filePath, filtered)
    return true
  }

  async getSubscribers() {
    return this._readFile('subscribers.json')
  }

  async addSubscriber(email) {
    const subscribers = await this.getSubscribers()
    const cleanEmail = email.trim().toLowerCase()
    if (subscribers.some((s) => s.email === cleanEmail)) {
      return { added: false, message: 'Email is already registered on the waitlist.' }
    }
    const record = {
      email: cleanEmail,
      subscribedAt: new Date().toISOString()
    }
    subscribers.push(record)
    const filePath = path.join(this.dataDir, 'subscribers.json')
    await this._writeFile(filePath, subscribers)
    return { added: true, message: 'Successfully added to the VANTA VIP waitlist.' }
  }

  async getReviews(productId) {
    const reviews = await this._readFile('reviews.json')
    if (productId !== undefined && productId !== null) {
      return reviews.filter((r) => r.productId === Number(productId))
    }
    return reviews
  }

  async addReview(productId, reviewData) {
    const reviews = await this._readFile('reviews.json')
    const nextId = reviews.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1
    const newReview = {
      id: nextId,
      productId: Number(productId),
      author: (reviewData.author || 'Verified Streetwear Collector').trim(),
      city: (reviewData.city || 'India').trim(),
      rating: Math.min(5, Math.max(1, Number(reviewData.rating) || 5)),
      title: (reviewData.title || 'Exceptional Drop').trim(),
      comment: (reviewData.comment || '').trim(),
      fit: reviewData.fit || 'True to Size',
      verified: true,
      createdAt: new Date().toISOString(),
      helpfulCount: 1
    }
    reviews.unshift(newReview)
    const filePath = path.join(this.dataDir, 'reviews.json')
    await this._writeFile(filePath, reviews)
    return newReview
  }

  async getWishlist() {
    return this._readFile('wishlist.json')
  }

  async toggleWishlist(productId) {
    const pId = Number(productId)
    const wishlist = await this.getWishlist()
    const index = wishlist.indexOf(pId)
    let isWishlisted = false
    if (index > -1) {
      wishlist.splice(index, 1)
      isWishlisted = false
    } else {
      wishlist.push(pId)
      isWishlisted = true
    }
    const filePath = path.join(this.dataDir, 'wishlist.json')
    await this._writeFile(filePath, wishlist)
    return { isWishlisted, wishlist }
  }

  async updateOrderPayment(orderId, paymentData) {
    const orders = await this.getOrders()
    const index = orders.findIndex((o) => o.orderId === orderId || o.orderNumber === orderId)
    if (index === -1) return null

    orders[index].paymentStatus = 'PAID_PREPAID'
    orders[index].paymentMethod = paymentData.method || 'ONLINE_PREPAID'
    orders[index].paymentDetails = {
      transactionId: paymentData.transactionId || `TXN_${Date.now()}`,
      gateway: paymentData.gateway || 'Razorpay UPI Gateway',
      paidAt: new Date().toISOString(),
      amount: orders[index].pricing?.totalAmount || 0,
      currency: paymentData.currency || 'INR'
    }
    const filePath = path.join(this.dataDir, 'orders.json')
    await this._writeFile(filePath, orders)
    return orders[index]
  }

  async initAdminUser() {
    const users = await this.getUsers()
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@vanta.com').toLowerCase().trim()
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    const existingAdmin = users.find((u) => u.email.toLowerCase() === adminEmail || u.role === 'admin')
    if (!existingAdmin) {
      const adminUser = {
        id: 'usr_admin_001',
        name: 'VANTA Executive Admin',
        email: adminEmail,
        role: 'admin',
        phone: '+91 98765 43210',
        passwordHash: hashPassword(adminPassword),
        createdAt: new Date().toISOString()
      }
      users.push(adminUser)
      const filePath = path.join(this.dataDir, 'users.json')
      await this._writeFile(filePath, users)
      console.log(`✓ Admin user initialized: ${adminEmail} (password: ${adminPassword})`)
    }
  }

  async getUsers() {
    return this._readFile('users.json')
  }

  async findUserByEmail(email) {
    if (!email) return null
    const cleanEmail = email.toLowerCase().trim()
    const users = await this.getUsers()
    return users.find((u) => u.email.toLowerCase() === cleanEmail) || null
  }

  async findUserById(id) {
    if (!id) return null
    const users = await this.getUsers()
    return users.find((u) => u.id === id) || null
  }

  async createUser(userData) {
    const users = await this.getUsers()
    const cleanEmail = (userData.email || '').toLowerCase().trim()
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`An account with email ${cleanEmail} already exists.`)
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      name: (userData.name || 'Streetwear Enthusiast').trim(),
      email: cleanEmail,
      phone: (userData.phone || '').trim(),
      role: userData.role || 'user',
      passwordHash: userData.passwordHash || hashPassword(userData.password),
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    const filePath = path.join(this.dataDir, 'users.json')
    await this._writeFile(filePath, users)
    return newUser
  }
}

export const store = new Store()

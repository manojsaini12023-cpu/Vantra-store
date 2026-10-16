import { useEffect, useState, useCallback } from 'react'
import './App.css'
import { megaMenuData } from './megaMenuData'
import { CartDrawer } from './CartDrawer'
import { ProductDetailModal } from './ProductDetailModal'
import { AdminDashboard } from './AdminDashboard'
import { useCurrency } from './useCurrency'
import { WishlistDrawer } from './WishlistDrawer'
import { useAuth } from './AuthContext'
import { AuthModal } from './AuthModal'

const parsePrice = (priceStr) => {
  const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10)
  return isNaN(num) ? 2999 : num
}

const categoryTabs = ['All', 'Women', 'T-Shirt', 'Hoodie', 'Shirt']

const genderSections = [
  {
    title: 'Men',
    subtitle: 'Built for sharp layers and everyday motion.',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Women',
    subtitle: 'Raw-cut crops, electric dragons & heavyweight oversized drops.',
    image: '/products/women-bnkrs-crop-sweatshirt.png',
  },
]

const defaultProducts = [
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
  },
  {
    id: 6,
    title: 'JOURNEY HOODIE',
    price: '₹7,999',
    numericPrice: 7999,
    category: 'Hoodie',
    gender: 'Unisex',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    isFeatured: false,
  },
  {
    id: 7,
    title: 'BLOCK HOODIE',
    price: '₹8,999',
    numericPrice: 8999,
    category: 'Hoodie',
    gender: 'Men',
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    isFeatured: false,
  },
  {
    id: 8,
    title: 'MONO SHIRT',
    price: '₹4,999',
    numericPrice: 4999,
    category: 'Shirt',
    gender: 'Men',
    image:
      'https://images.unsplash.com/photo-1521369909026-2afed882baee?auto=format&fit=crop&w=900&q=80',
    isFeatured: false,
  },
  {
    id: 9,
    title: 'RAW SHIRT',
    price: '₹5,999',
    numericPrice: 5999,
    category: 'Shirt',
    gender: 'Women',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    isFeatured: false,
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
  },
]

const HERO_SLIDES = [
  {
    id: 15,
    title: 'SPIDER-MAN RETRO POSTAGE OVERSIZED TEE',
    shortTitle: 'SPIDER-MAN RETRO TEE',
    gender: 'Men',
    category: 'Oversized Streetwear Tee',
    price: '₹3,499',
    numericPrice: 3499,
    badge: 'NEW DROP // MEN T-SHIRT',
    image: '/products/men-spiderman-red-tee.png',
    tagline: 'Heavyweight 260 GSM Boxy Silhouette'
  },
  {
    id: 18,
    title: 'HORIZON BLUE RIBBED BABY TEE',
    shortTitle: 'HORIZON BLUE BABY TEE',
    gender: 'Women',
    category: 'Cropped Stretch Baby Tee',
    price: '₹2,699',
    numericPrice: 2699,
    badge: 'NEW ARRIVAL // WOMEN TOP',
    image: '/products/women-blue-baby-tee.png',
    tagline: 'Ultra-Soft Stretch Ribbed Cotton'
  },
  {
    id: 16,
    title: 'MILES MORALES GLITCH STREET TEE',
    shortTitle: 'MILES MORALES GLITCH TEE',
    gender: 'Men',
    category: 'Back Graphic Art Tee',
    price: '₹3,699',
    numericPrice: 3699,
    badge: 'LIMITED // MEN T-SHIRT',
    image: '/products/men-spiderman-miles-tee.png',
    tagline: 'Cyber Split Mask Art on Washed Charcoal'
  },
  {
    id: 19,
    title: 'TACTICAL OLIVE CORSET HALTER TOP',
    shortTitle: 'TACTICAL OLIVE CORSET TOP',
    gender: 'Women',
    category: 'Contoured Halter Denim Top',
    price: '₹3,899',
    numericPrice: 3899,
    badge: 'EXCLUSIVE // WOMEN TOP',
    image: '/products/women-olive-halter-corset.jpg',
    tagline: 'Military Denim Halter with Front Zipper'
  },
  {
    id: 17,
    title: 'WILD & FREE GEOMETRIC WOLF TEE',
    shortTitle: 'WILD & FREE WOLF TEE',
    gender: 'Men',
    category: 'Vintage Graphic Tee',
    price: '₹3,299',
    numericPrice: 3299,
    badge: 'STREET ICON // MEN T-SHIRT',
    image: '/products/men-wolf-graphic-tee.png',
    tagline: 'Dual-Tone Geometric Wolf Back Print'
  }
]

const LOOKBOOK_ITEMS = [
  {
    id: 15,
    lookNumber: '01',
    title: 'SPIDER-MAN RETRO POSTAGE OVERSIZED TEE',
    shortTitle: 'NEIGHBORHOOD SPIDER-MAN',
    gender: 'Men',
    category: 'Oversized Streetwear Tee',
    price: '₹3,499',
    numericPrice: 3499,
    image: '/products/men-spiderman-red-tee.png',
    concept: '260 GSM boxy crimson cotton paired with relaxed raw-hem washed denim. Stamp graphic framing for heritage comic aesthetics.',
    stylistNote: 'Size up for an exaggerated runway drop shoulder.'
  },
  {
    id: 18,
    lookNumber: '02',
    title: 'HORIZON BLUE RIBBED BABY TEE',
    shortTitle: 'HORIZON SLATE CHIC',
    gender: 'Women',
    category: 'Cropped Ribbed Baby Tee',
    price: '₹2,699',
    numericPrice: 2699,
    image: '/products/women-blue-baby-tee.png',
    concept: 'Slate blue stretch rib cotton styled with a micro pleated skirt and chunky lace-up boots for retro y2k streetwear flair.',
    stylistNote: 'Pair with silver layered chains and minimal headwear.'
  },
  {
    id: 16,
    lookNumber: '03',
    title: 'MILES MORALES GLITCH STREET TEE',
    shortTitle: 'CYBERPUNK SPIDER',
    gender: 'Men',
    category: 'Miles Morales Glitch Tee',
    price: '₹3,699',
    numericPrice: 3699,
    image: '/products/men-spiderman-miles-tee.png',
    concept: 'Washed charcoal drop shoulder jersey highlighting the neon blue & red glitch mask back typography. Tailored for midnight cityscapes.',
    stylistNote: 'Wear over an elongated white tank for high-contrast layering.'
  },
  {
    id: 19,
    lookNumber: '04',
    title: 'TACTICAL OLIVE CORSET HALTER TOP',
    shortTitle: 'TACTICAL NOIR CORSET',
    gender: 'Women',
    category: 'Contoured Halter Denim Top',
    price: '₹3,899',
    numericPrice: 3899,
    image: '/products/women-olive-halter-corset.jpg',
    concept: 'Structured military olive denim with front metal hardware and contrast tan leather collar accents. Built for confident attitude.',
    stylistNote: 'Pairs impeccably with wide-leg cargo jeans and low-top trainers.'
  },
  {
    id: 17,
    lookNumber: '05',
    title: 'WILD & FREE GEOMETRIC WOLF TEE',
    shortTitle: 'BEAST WITHIN SILHOUETTE',
    gender: 'Men',
    category: 'Geometric Wolf Graphic Tee',
    price: '₹3,299',
    numericPrice: 3299,
    image: '/products/men-wolf-graphic-tee.png',
    concept: 'Warm sand stone-washed cotton balancing realistic sketch art with geometric facets. An organic palette engineered for everyday ease.',
    stylistNote: 'Complements earthy cargos and vintage canvas kicks.'
  },
  {
    id: 14,
    lookNumber: '06',
    title: 'POISON SCORPION OVERSIZED TEE',
    shortTitle: 'ELECTRIC VENOM',
    gender: 'Women',
    category: 'Poison Scorpion Heavy Tee',
    price: '₹3,899',
    numericPrice: 3899,
    image: '/products/women-poison-scorpion-tee.jpg',
    concept: 'Heavyweight black jersey infused with luminescent cyan scorpion artwork and metallic grunge gothic detailing.',
    stylistNote: 'Style with chunky platform combat boots.'
  },
  {
    id: 21,
    lookNumber: '07',
    title: 'SPIDER-WEB EMBROIDERED WHITE HOODIE',
    shortTitle: 'ARACHNID EMBROIDERED FLEECE',
    gender: 'Women',
    category: 'Embroidered Fleece Hoodie',
    price: '₹4,899',
    numericPrice: 4899,
    image: '/products/women-spider-web-white-hoodie.png',
    concept: 'Clean optical white fleece engineered with high-density red thread spider web embroidery. Styled with a distressed denim mini skirt and black eyewear.',
    stylistNote: 'Pair with high platform boots or chunky retro trainers.'
  },
  {
    id: 20,
    lookNumber: '08',
    title: 'CRIMSON RED OVERSIZED STREETWEAR HOODIE',
    shortTitle: 'SCARLET DROP FLEECE',
    gender: 'Women',
    category: 'Oversized Streetwear Hoodie',
    price: '₹4,499',
    numericPrice: 4499,
    image: '/products/women-crimson-oversized-hoodie.png',
    concept: 'Voluminous 380 GSM crimson red cotton fleece with relaxed drop shoulders, white chest embroidery, and visor-shield sunglasses.',
    stylistNote: 'Half-tuck over wide-leg light wash skate denim.'
  },
  {
    id: 22,
    lookNumber: '09',
    title: 'TRAVIS SCOTT FLAME TOUR HOODIE',
    shortTitle: 'FLAME TOUR TYPOGRAPHY',
    gender: 'Women',
    category: 'Tour Graphic Hoodie',
    price: '₹5,499',
    numericPrice: 5499,
    image: '/products/women-travis-scott-flame-hoodie.png',
    concept: 'Heavy brushed back black fleece showcasing flaming red-hot Travis Scott concert typography and high-voltage tour lyrics.',
    stylistNote: 'Layer with black leather trousers or baggy utility joggers.'
  }
]

const storyCards = [
  {
    title: 'Needlework',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Tailored strength',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
  },
]

function App() {
  const [activeTab, setActiveTab] = useState('All')
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileActiveAccordion, setMobileActiveAccordion] = useState('MEN')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null)
  const [autoOpenCheckoutInDrawer, setAutoOpenCheckoutInDrawer] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Authentication & Staff Admin Access
  const { user, isAdmin, logout, openAuthModal, authNotification } = useAuth()

  const handleOpenAdminPortal = () => {
    if (isAdmin) {
      setIsAdminOpen(true)
    } else {
      openAuthModal('admin')
    }
  }

  // Multi-Currency & Wishlist
  const { currency, setCurrency, currencies, formatPrice } = useCurrency()
  const [wishlistIds, setWishlistIds] = useState([])
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)

  // Products from Backend
  const [products, setProducts] = useState(defaultProducts)
  const [isApiOnline, setIsApiOnline] = useState(false)

  // Hero Image Slider State (Men T-shirts & Women Tops)
  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const [isSliderPaused, setIsSliderPaused] = useState(false)

  // Fullscreen Mode Handler
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }

  // Auto-advance hero slider every 4 seconds (pauses on hover)
  useEffect(() => {
    if (isSliderPaused) return
    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [isSliderPaused])

  const handlePrevSlide = (e) => {
    e.stopPropagation()
    setHeroSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  const handleNextSlide = (e) => {
    e.stopPropagation()
    setHeroSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)
  }

  const handleHeroSlideSelect = (slide) => {
    const matched = products.find((p) => p.id === slide.id) || {
      id: slide.id,
      title: slide.title,
      price: slide.price,
      numericPrice: slide.numericPrice,
      category: slide.category,
      gender: slide.gender,
      image: slide.image,
      stock: 25,
      sizes: ['S', 'M', 'L', 'XL'],
      description: slide.tagline
    }
    setSelectedProductForDetail(matched)
  }

  // Lookbook Modal State & Interactive Handlers
  const [isLookbookOpen, setIsLookbookOpen] = useState(false)
  const [lookbookFilter, setLookbookFilter] = useState('ALL')

  // Women Section Subcategory Filter State
  const [womenCategoryFilter, setWomenCategoryFilter] = useState('ALL')

  // SHOP NOW: Smoothly navigates to the collections catalog and sets tab to 'All'
  const handleShopNow = () => {
    setActiveTab('All')
    const el = document.getElementById('collection')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // VIEW LOOKBOOK: Opens the rich editorial runway lookbook
  const handleOpenLookbook = () => {
    setIsLookbookOpen(true)
  }

  // Open product detail directly from Lookbook card
  const handleLookbookSelectProduct = (look) => {
    const matched = products.find((p) => p.id === look.id) || {
      id: look.id,
      title: look.title,
      price: look.price,
      numericPrice: look.numericPrice,
      category: look.category,
      gender: look.gender,
      image: look.image,
      stock: 25,
      sizes: ['S', 'M', 'L', 'XL'],
      description: look.concept
    }
    setIsLookbookOpen(false)
    setSelectedProductForDetail(matched)
  }

  // Close Lookbook with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isLookbookOpen) {
        setIsLookbookOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLookbookOpen])

  // Fetch Wishlist from Backend
  const fetchWishlist = useCallback(() => {
    fetch('/api/wishlist')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.wishlist)) {
          setWishlistIds(data.wishlist)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const handleToggleWishlist = async (productId) => {
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })
      const data = await res.json()
      if (data.success) {
        setWishlistIds(data.wishlist)
      }
    } catch {
      setWishlistIds((prev) =>
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
      )
    }
  }

  const wishlistItems = wishlistIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)

  // Orders Modal & History
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false)
  const [ordersList, setOrdersList] = useState([])
  const [orderSearchId, setOrderSearchId] = useState('')
  const [orderSearchResult, setOrderSearchResult] = useState(null)
  const [orderSearchError, setOrderSearchError] = useState('')
  const [isSearchingOrder, setIsSearchingOrder] = useState(false)

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterMsg, setNewsletterMsg] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  const [cartItems, setCartItems] = useState([
    {
      cartId: 'cart-init-1',
      id: 2,
      title: 'HOT WHEELS RAGLAN TEE',
      category: 'T-Shirt',
      price: '₹3,499',
      numericPrice: 3499,
      image: '/products/tshirt-hotwheels.png',
      size: 'L',
      quantity: 1,
      fit: 'flatlay',
    },
    {
      cartId: 'cart-init-2',
      id: 1,
      title: 'UNLEASH THE DRAGON TEE',
      category: 'T-Shirt',
      price: '₹3,799',
      numericPrice: 3799,
      image: '/products/tshirt-unleash-dragon.png',
      size: 'XL',
      quantity: 1,
    },
  ])

  // Fetch products from backend
  const fetchProducts = useCallback(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products)
          setIsApiOnline(true)
        }
      })
      .catch((err) => {
        console.warn('Backend server not connected yet, using offline catalog.', err)
        setIsApiOnline(false)
      })
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleOpenOrders = async () => {
    setIsOrdersModalOpen(true)
    setOrderSearchError('')
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (data.success && Array.isArray(data.orders)) {
        setOrdersList(data.orders)
      }
    } catch {
      // offline fallback
    }
  }

  const handleSearchOrder = async (e) => {
    e.preventDefault()
    if (!orderSearchId.trim()) return
    setIsSearchingOrder(true)
    setOrderSearchError('')
    setOrderSearchResult(null)
    try {
      const res = await fetch(`/api/orders/${orderSearchId.trim()}`)
      const data = await res.json()
      if (data.success && data.order) {
        setOrderSearchResult(data.order)
      } else {
        setOrderSearchError(data.message || 'Order reference not found in database.')
      }
    } catch {
      setOrderSearchError('Server connection error. Please try again.')
    } finally {
      setIsSearchingOrder(false)
    }
  }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    setNewsletterLoading(true)
    setNewsletterMsg('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      })
      const data = await res.json()
      setNewsletterMsg(data.message || 'Thank you for subscribing!')
      if (data.success) {
        setNewsletterEmail('')
      }
    } catch {
      setNewsletterMsg('Subscribed! Welcome to VANTA.')
      setNewsletterEmail('')
    } finally {
      setNewsletterLoading(false)
    }
  }

  const handleUpdateQuantity = (cartId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean),
    )
  }

  const handleRemoveItem = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId))
  }

  const handleUpdateSize = (cartId, newSize) => {
    setCartItems((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, size: newSize } : item)),
    )
  }

  const handleAddToCart = (product, size = 'L', quantityToAdd = 1) => {
    const numericPrice = product.numericPrice || parsePrice(product.price)
    const qty = Math.max(1, quantityToAdd)
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.id === product.id && i.size === size,
      )
      if (existingIdx >= 0) {
        const updated = [...prev]
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + qty,
        }
        return updated
      }
      return [
        ...prev,
        {
          cartId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          id: product.id,
          title: product.title,
          category: product.category || 'Streetwear',
          price: product.price,
          numericPrice,
          image: product.image,
          size,
          quantity: qty,
          fit: product.fit,
        },
      ]
    })
    setIsCartOpen(true)
  }

  const handleBuyNow = (product, size = 'L', quantityToAdd = 1) => {
    handleAddToCart(product, size, quantityToAdd)
    setAutoOpenCheckoutInDrawer(true)
    setSelectedProductForDetail(null)
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveMegaMenu(null)
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.12 },
    )

    const revealItems = document.querySelectorAll('.reveal')
    revealItems.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  const handleMegaItemClick = (itemName) => {
    setActiveMegaMenu(null)
    setMobileMenuOpen(false)
    const upper = itemName.toUpperCase()
    if (upper.includes('WOMEN')) {
      setActiveTab('Women')
    } else if (
      upper.includes('T-SHIRT') ||
      upper.includes('TEE') ||
      upper.includes('HOTWHEELS') ||
      upper.includes('OVERDRIVE') ||
      upper.includes('DESIRES')
    ) {
      setActiveTab('T-Shirt')
    } else if (upper.includes('HOODIE') || upper.includes('SWEATSHIRT')) {
      setActiveTab('Hoodie')
    } else if (upper.includes('SHIRT')) {
      setActiveTab('Shirt')
    } else {
      setActiveTab('All')
    }
    const target = document.getElementById('collection')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const featuredProducts =
    products.filter((p) => p.isFeatured).length > 0
      ? products.filter((p) => p.isFeatured)
      : products.slice(0, 4)

  const filteredProducts =
    activeTab === 'All'
      ? products
      : activeTab === 'Women'
      ? products.filter((product) => product.gender === 'Women')
      : products.filter((product) => product.category === activeTab)

  if (isAdminOpen) {
    if (!isAdmin) {
      setIsAdminOpen(false)
      openAuthModal('admin')
      return null
    }
    return (
      <AdminDashboard
        onClose={() => {
          setIsAdminOpen(false)
          fetchProducts()
        }}
      />
    )
  }

  return (
    <div className="page-shell">
      <div className="announcement-bar">
        <span>EXPRESS SHIPPING ACROSS INDIA • CASH ON DELIVERY &amp; INSTANT UPI AVAILABLE</span>
        <div className="announcement-right-group">
          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="fullscreen-toggle-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen' : 'View Full Screen'}
            aria-label={isFullscreen ? 'Exit Full Screen' : 'View Full Screen'}
          >
            <span>{isFullscreen ? '⛶ EXIT FULLSCREEN' : '⛶ FULLSCREEN'}</span>
          </button>

          {/* Multi-Currency Switcher */}
          <div className="currency-selector-pill">
            <span className="currency-icon">🌐</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="currency-select-field"
              aria-label="Select Currency"
            >
              {Object.values(currencies).map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.flag} {curr.code} ({curr.symbol.trim()})
                </option>
              ))}
            </select>
          </div>
          {isApiOnline && <span className="api-online-pill">● API LIVE</span>}
        </div>
      </div>
      <header className={`topbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="brand-row">
          <a href="#" className="brand-link" aria-label="VANTA">
            <img src="/vanta-logo.png" alt="VANTA - Premium Streetwear" className="brand-logo" />
          </a>
          <nav className="main-nav" aria-label="Main navigation">
            <div className="mega-nav-triggers">
              <button
                type="button"
                className={`mega-nav-btn ${activeMegaMenu === 'WOMEN' ? 'active' : ''}`}
                onClick={() => setActiveMegaMenu(activeMegaMenu === 'WOMEN' ? null : 'WOMEN')}
                onMouseEnter={() => setActiveMegaMenu('WOMEN')}
              >
                WOMEN <span className="nav-caret">▾</span>
              </button>
              <button
                type="button"
                className={`mega-nav-btn ${activeMegaMenu === 'MEN' ? 'active' : ''}`}
                onClick={() => setActiveMegaMenu(activeMegaMenu === 'MEN' ? null : 'MEN')}
                onMouseEnter={() => setActiveMegaMenu('MEN')}
              >
                MEN <span className="nav-caret">▾</span>
              </button>
              <button
                type="button"
                className={`mega-nav-btn ${activeMegaMenu === 'ACCESSORIES' ? 'active' : ''}`}
                onClick={() => setActiveMegaMenu(activeMegaMenu === 'ACCESSORIES' ? null : 'ACCESSORIES')}
                onMouseEnter={() => setActiveMegaMenu('ACCESSORIES')}
              >
                ACCESSORIES <span className="nav-caret">▾</span>
              </button>
            </div>

            <div className="nav-links-subtle">
              <a href="#new" onClick={() => setActiveMegaMenu(null)}>New</a>
              <a href="#collection" onClick={() => setActiveMegaMenu(null)}>Collection</a>
              <a href="#journal" onClick={() => setActiveMegaMenu(null)}>Journal</a>
              <a href="#about" onClick={() => setActiveMegaMenu(null)}>About</a>
            </div>
          </nav>
          <div className="nav-actions">
            {/* User Account / Auth Dropdown */}
            {!user ? (
              <button
                type="button"
                className="user-account-btn"
                onClick={() => openAuthModal('signin')}
                title="Sign in or create account"
              >
                👤 Sign In
              </button>
            ) : (
              <div className="user-dropdown-wrapper">
                <button
                  type="button"
                  className={`user-account-btn ${isAdmin ? 'admin-user' : ''}`}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  title="Account Options"
                >
                  👤 {user.name.split(' ')[0]} {isAdmin && '⚡'} ▾
                </button>
                {isUserMenuOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-name">{user.name}</div>
                      <div className="user-dropdown-email">{user.email}</div>
                      <span className={`user-dropdown-role ${isAdmin ? 'admin' : ''}`}>
                        {isAdmin ? 'STAFF ADMIN' : 'CLIENT'}
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        className="user-dropdown-item"
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          setIsAdminOpen(true)
                        }}
                      >
                        ⚡ Admin Dashboard
                      </button>
                    )}
                    <button
                      type="button"
                      className="user-dropdown-item"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        setIsWishlistOpen(true)
                      }}
                    >
                      ♡ Saved Items ({wishlistIds.length})
                    </button>
                    <button
                      type="button"
                      className="user-dropdown-item"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        handleOpenOrders()
                      }}
                    >
                      📦 Track Orders
                    </button>
                    <button
                      type="button"
                      className="user-dropdown-item logout"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        logout()
                      }}
                    >
                      ⏻ Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {isAdmin && (
              <button
                type="button"
                className="nav-button small admin-btn"
                onClick={() => setIsAdminOpen(true)}
                title="Open Backend Admin Dashboard"
              >
                ⚡ Admin
              </button>
            )}
            <button
              type="button"
              className="nav-button small wishlist-nav-btn"
              onClick={() => setIsWishlistOpen(true)}
              title="View saved items"
            >
              ♡ Saved {wishlistIds.length > 0 ? `(${wishlistIds.length})` : ''}
            </button>
            <button
              type="button"
              className="nav-button small orders-btn"
              onClick={handleOpenOrders}
              title="Track and manage placed orders"
            >
              Orders {ordersList.length > 0 ? `(${ordersList.length})` : ''}
            </button>
            <button
              type="button"
              className="nav-button cart-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Cart"
            >
              Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
            </button>
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {activeMegaMenu && megaMenuData[activeMegaMenu] && (
          <div
            className="mega-dropdown-container"
            onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <div className="mega-dropdown-inner">
              <div className="mega-columns-grid">
                {/* Column 1: Categories */}
                <div className="mega-col mega-col-categories">
                  <ul className="mega-items-list">
                    {megaMenuData[activeMegaMenu].categories.map((item) => (
                      <li key={item}>
                        <a
                          href="#collection"
                          className="mega-category-link"
                          onClick={(e) => {
                            e.preventDefault()
                            handleMegaItemClick(item)
                          }}
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Collection */}
                <div className="mega-col mega-col-collections">
                  <h3 className="mega-col-heading">COLLECTION</h3>
                  <ul className="mega-items-list">
                    {megaMenuData[activeMegaMenu].collections.map((item) => (
                      <li key={item}>
                        <a
                          href="#collection"
                          className="mega-regular-link"
                          onClick={(e) => {
                            e.preventDefault()
                            handleMegaItemClick(item)
                          }}
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Collaborations */}
                <div className="mega-col mega-col-collaborations">
                  <h3 className="mega-col-heading">COLLABORATIONS</h3>
                  <ul className="mega-items-list">
                    {megaMenuData[activeMegaMenu].collaborations.map((item) => (
                      <li key={item}>
                        <a
                          href="#collection"
                          className="mega-regular-link"
                          onClick={(e) => {
                            e.preventDefault()
                            handleMegaItemClick(item)
                          }}
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                type="button"
                className="mega-close-btn"
                onClick={() => setActiveMegaMenu(null)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </header>

      {activeMegaMenu && (
        <div
          className="mega-menu-backdrop"
          onClick={() => setActiveMegaMenu(null)}
          aria-hidden="true"
        />
      )}

      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <img src="/vanta-logo.png" alt="VANTA" className="brand-logo" />
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {isAdmin && (
              <div className="mobile-admin-bar">
                <button
                  type="button"
                  className="mobile-admin-link"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setIsAdminOpen(true)
                  }}
                >
                  ⚡ Staff Admin Dashboard
                </button>
              </div>
            )}

            <div className="mobile-quick-actions">
              <button
                type="button"
                className="mobile-quick-link"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setIsWishlistOpen(true)
                }}
              >
                ♡ Saved Items {wishlistIds.length > 0 ? `(${wishlistIds.length})` : ''}
              </button>
              <button
                type="button"
                className="mobile-quick-link"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleOpenOrders()
                }}
              >
                📦 Track Orders {ordersList.length > 0 ? `(${ordersList.length})` : ''}
              </button>
            </div>

            <div className="mobile-tabs-row">
              {['MEN', 'WOMEN', 'ACCESSORIES'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`mobile-tab-pill ${mobileActiveAccordion === tab ? 'active' : ''}`}
                  onClick={() => setMobileActiveAccordion(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mobile-drawer-body">
              {megaMenuData[mobileActiveAccordion] && (
                <div className="mobile-drawer-sections">
                  <div className="mobile-group">
                    <h4 className="mobile-group-title">{mobileActiveAccordion} CATEGORIES</h4>
                    <div className="mobile-links-list">
                      {megaMenuData[mobileActiveAccordion].categories.map((item) => (
                        <a
                          key={item}
                          href="#collection"
                          className="mobile-item-link bold"
                          onClick={(e) => {
                            e.preventDefault()
                            handleMegaItemClick(item)
                          }}
                        >
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="mobile-group">
                    <h4 className="mobile-group-title">COLLECTION</h4>
                    <div className="mobile-links-list">
                      {megaMenuData[mobileActiveAccordion].collections.map((item) => (
                        <a
                          key={item}
                          href="#collection"
                          className="mobile-item-link"
                          onClick={(e) => {
                            e.preventDefault()
                            handleMegaItemClick(item)
                          }}
                        >
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="mobile-group">
                    <h4 className="mobile-group-title">COLLABORATIONS</h4>
                    <div className="mobile-links-list">
                      {megaMenuData[mobileActiveAccordion].collaborations.map((item) => (
                        <a
                          key={item}
                          href="#collection"
                          className="mobile-item-link"
                          onClick={(e) => {
                            e.preventDefault()
                            handleMegaItemClick(item)
                          }}
                        >
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="fashion-page">
        <section className="hero-block reveal" id="new">
          <div className="hero-copy">
            <p className="eyebrow">VANTA // NEW ARRIVALS</p>
            <h1>VANTA</h1>
            <p className="subcopy">
              Future-ready staples shaped for the street, designed with elevated
              tailoring and all-season ease.
            </p>
            <div className="cta-row">
              <button
                type="button"
                className="primary-btn"
                onClick={handleShopNow}
                id="hero-shop-now-btn"
                title="Browse Full Collection"
              >
                Shop now
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleOpenLookbook}
                id="hero-view-lookbook-btn"
                title="View Runway Editorial Lookbook"
              >
                View lookbook
              </button>
            </div>
          </div>

          <div
            className="hero-visual hero-slider-container"
            onMouseEnter={() => setIsSliderPaused(true)}
            onMouseLeave={() => setIsSliderPaused(false)}
          >
            {/* Dynamic Drop Badge */}
            <div className="badge hero-slider-badge">
              <span className="slider-pulse-dot"></span>
              {HERO_SLIDES[heroSlideIndex].badge}
            </div>

            {/* Slider Images with Smooth Fade Transition */}
            <div className="hero-slider-viewport">
              {HERO_SLIDES.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`hero-slide-item ${idx === heroSlideIndex ? 'active' : ''}`}
                  onClick={() => handleHeroSlideSelect(slide)}
                  title={`View details for ${slide.title}`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="hero-slide-img"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                  <div className="hero-slide-vignette"></div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              type="button"
              className="hero-slider-arrow prev"
              onClick={handlePrevSlide}
              aria-label="Previous clothing slide"
              title="Previous item"
            >
              ‹
            </button>
            <button
              type="button"
              className="hero-slider-arrow next"
              onClick={handleNextSlide}
              aria-label="Next clothing slide"
              title="Next item"
            >
              ›
            </button>

            {/* Interactive Bottom Product Pill */}
            <div
              className="hero-slider-info-pill"
              onClick={() => handleHeroSlideSelect(HERO_SLIDES[heroSlideIndex])}
              title="Click to view full product details & buy"
            >
              <div className="info-pill-details">
                <span className="info-pill-cat">{HERO_SLIDES[heroSlideIndex].gender} • {HERO_SLIDES[heroSlideIndex].category}</span>
                <h3 className="info-pill-title">{HERO_SLIDES[heroSlideIndex].shortTitle}</h3>
              </div>
              <div className="info-pill-action">
                <span className="info-pill-price">{formatPrice(HERO_SLIDES[heroSlideIndex].numericPrice)}</span>
                <span className="info-pill-cta">Inspect →</span>
              </div>
            </div>

            {/* Indicator Dots */}
            <div className="hero-slider-dots" role="tablist" aria-label="Hero slider pagination">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`hero-dot ${idx === heroSlideIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setHeroSlideIndex(idx)
                  }}
                  aria-label={`Jump to slide ${idx + 1}: ${slide.shortTitle}`}
                />
              ))}
            </div>

            {/* Dynamic Floating Capsule Card */}
            <div className="floating-card hero-capsule-card">
              <span>Capsule Drop</span>
              <strong>0{heroSlideIndex + 1} / 0{HERO_SLIDES.length}</strong>
            </div>
          </div>
        </section>

        <section className="brand-strip reveal">
          <span>VANTA™</span>
          <span>Streetwear</span>
          <span>Essentials</span>
          <span>Tailored</span>
          <span>Limited</span>
        </section>

        <section className="feature-showcase reveal">
          <div className="feature-header">
            <p className="eyebrow">Featured items</p>
            <h2>Curated for colder nights.</h2>
          </div>

          <div className="carousel-track" aria-label="Featured products carousel">
            {featuredProducts.map((product) => (
              <article
                className="mini-product clickable-product-card"
                key={product.id}
                onClick={() => setSelectedProductForDetail(product)}
                title={`View ${product.title} details`}
              >
                <div className={`mini-image-wrap ${product.fit || ''}`}>
                  <img src={product.image} alt={product.title} />
                  <button
                    type="button"
                    className="mini-quick-add-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToCart(product, 'L')
                    }}
                    aria-label={`Add ${product.title} to cart`}
                  >
                    + ADD TO BAG
                  </button>
                </div>
                <div className="mini-copy">
                  <h3>{product.title}</h3>
                  <span>{formatPrice(product.numericPrice)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="gender-showcase reveal">
          <div className="gender-grid">
            {genderSections.map((section) => (
              <article className="gender-card" key={section.title}>
                <div className="gender-image-wrap">
                  <img src={section.image} alt={section.title} />
                </div>
                <div className="gender-copy">
                  <p className="eyebrow">Collection</p>
                  <h3>{section.title}</h3>
                  <p>{section.subtitle}</p>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      if (section.title === 'Women') {
                        setActiveTab('Women')
                        document.getElementById('women')?.scrollIntoView({ behavior: 'smooth' })
                      } else {
                        setActiveTab('All')
                        document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                  >
                    Shop {section.title}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Dedicated Women's Showcase Section */}
        <section className="women-capsule-section reveal" id="women">
          <div className="section-head">
            <div>
              <p className="eyebrow">VANTA WOMEN // 2026 CAPSULE</p>
              <h2>Raw silhouettes, oversized fleece &amp; electric hoodies.</h2>
            </div>
            <div className="women-capsule-badges">
              <span className="women-count-pill">{products.filter((p) => p.gender === 'Women').length} EXCLUSIVE STYLES</span>
              <button
                type="button"
                className="tab active"
                onClick={() => {
                  setActiveTab('Women')
                  document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                FILTER IN COLLECTION →
              </button>
            </div>
          </div>

          {/* Women Subcategory Filter Bar */}
          <div className="women-subnav-bar">
            <div className="women-subnav-pills">
              {[
                { key: 'ALL', label: 'ALL WOMEN' },
                { key: 'HOODIES', label: '🔥 HOODIES & FLEECE' },
                { key: 'TOPS', label: 'TOPS & TEES' }
              ].map((sub) => (
                <button
                  key={sub.key}
                  type="button"
                  className={`women-sub-pill ${womenCategoryFilter === sub.key ? 'active' : ''}`}
                  onClick={() => setWomenCategoryFilter(sub.key)}
                >
                  {sub.label}
                </button>
              ))}
            </div>
            <span className="women-subnav-counter">
              Showing {
                products
                  .filter((p) => p.gender === 'Women')
                  .filter((p) => {
                    if (womenCategoryFilter === 'ALL') return true
                    if (womenCategoryFilter === 'HOODIES') return p.category === 'Hoodie'
                    if (womenCategoryFilter === 'TOPS') return p.category !== 'Hoodie'
                    return true
                  }).length
              } Pieces
            </span>
          </div>

          <div className="women-capsule-grid">
            {products
              .filter((p) => p.gender === 'Women')
              .filter((p) => {
                if (womenCategoryFilter === 'ALL') return true
                if (womenCategoryFilter === 'HOODIES') return p.category === 'Hoodie'
                if (womenCategoryFilter === 'TOPS') return p.category !== 'Hoodie'
                return true
              })
              .map((product) => (
                <article
                  className="women-capsule-card clickable-product-card"
                  key={product.id}
                  onClick={() => setSelectedProductForDetail(product)}
                  title={`View ${product.title} details`}
                >
                  <div className="women-card-img-wrap">
                    <img src={product.image} alt={product.title} />
                    <button
                      type="button"
                      className={`card-heart-btn ${wishlistIds.includes(product.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleWishlist(product.id)
                      }}
                      title={wishlistIds.includes(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      {wishlistIds.includes(product.id) ? '♥' : '♡'}
                    </button>
                    <button
                      type="button"
                      className="mini-quick-add-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToCart(product, 'L')
                      }}
                      aria-label={`Quick add ${product.title} to bag`}
                    >
                      + ADD TO BAG
                    </button>
                  </div>
                  <div className="women-card-meta">
                    <div className="women-card-titles">
                      <span className="women-card-tag">{product.category}</span>
                      <h3 className="women-card-heading">{product.title}</h3>
                    </div>
                    <div className="women-card-price-row">
                      <span className="women-card-price">{formatPrice(product.numericPrice)}</span>
                      <span className="women-card-cta">Configure Fit →</span>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </section>

        <section className="collection-section reveal" id="collection">
          <div className="section-head">
            <div>
              <p className="eyebrow">Our collection</p>
              <h2>Premium essentials in motion.</h2>
            </div>

            <div className="tabs" aria-label="Product categories">
              {categoryTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={tab === activeTab ? 'tab active' : 'tab'}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article
                className="product-card reveal clickable-product-card"
                key={product.id}
                onClick={() => setSelectedProductForDetail(product)}
                title={`View ${product.title} details`}
              >
                <div className={`product-image-wrap ${product.fit || ''}`}>
                  <img src={product.image} alt={product.title} />
                  <button
                    type="button"
                    className={`card-heart-btn ${wishlistIds.includes(product.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleWishlist(product.id)
                    }}
                    title={wishlistIds.includes(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    {wishlistIds.includes(product.id) ? '♥' : '♡'}
                  </button>
                  <button
                    type="button"
                    className="wishlist-btn"
                    title="Quick add to bag"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToCart(product, 'L')
                    }}
                  >
                    +
                  </button>

                  {/* Quick Add All Sizes Bar */}
                  <div className="product-card-quick-sizes" onClick={(e) => e.stopPropagation()}>
                    <span className="quick-size-label">QUICK ADD SIZE</span>
                    <div className="quick-size-buttons">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          className="quick-size-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(product, size)
                          }}
                          title={`Add size ${size} to bag`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="product-meta">
                  <div>
                    <p>{product.category}</p>
                    <h3>{product.title}</h3>
                  </div>
                  <span>{formatPrice(product.numericPrice)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="editorial-split reveal">
          <div className="editorial-copy">
            <p className="eyebrow">01 / Streetwear</p>
            <h2>Sweatshirt</h2>
            <p>
              Designed with airy cotton fleece, oversized volume, and a clean
              drape built for everyday movement.
            </p>
            <button
              type="button"
              className="secondary-btn"
              onClick={handleOpenLookbook}
              title="Open Streetwear Lookbook"
            >
              Explore style
            </button>
          </div>

          <div className="editorial-image">
            <img
              src="https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80"
              alt="Editorial fashion portrait"
            />
          </div>
        </section>

        <section className="story-row reveal" id="journal">
          {storyCards.map((card) => (
            <article className="story-card" key={card.title}>
              <div className="story-image-wrap">
                <img src={card.image} alt={card.title} />
              </div>
              <div className="story-content">
                <p>Crafted for life</p>
                <h3>{card.title}</h3>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer className="brand-footer reveal" id="about">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/vanta-logo-white.png" alt="VANTA Logo" className="footer-logo" />
            <p className="footer-tagline">
              Shaped for the street. Engineered with architectural volume, elevated tailoring, and all-season ease.
            </p>
          </div>
          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Collection</h4>
              <a href="#collection">New Arrivals</a>
              <a href="#collection">Hoodies &amp; Fleece</a>
              <a href="#collection">Tailored Shirts</a>
              <a href="#collection">Limited Drops</a>
            </div>
            <div className="footer-col">
              <h4>Brand</h4>
              <a href="#journal">Editorial Journal</a>
              <a href="#about">Studio Philosophy</a>
              <a
                href="#lookbook"
                onClick={(e) => {
                  e.preventDefault()
                  handleOpenLookbook()
                }}
              >
                Lookbook 2026
              </a>
              <a href="#collection">Sustainability</a>
            </div>
            <div className="footer-col">
              <h4>Client Service</h4>
              <a href="#about">Shipping &amp; Delivery</a>
              <a href="#about">Size Guide</a>
              <a href="#about">Care Guide</a>
              <a href="#about">Concierge</a>
              <button
                type="button"
                className="footer-admin-btn"
                onClick={handleOpenAdminPortal}
              >
                ⚡ Staff Admin Portal
              </button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-emblem-wrap">
            <img src="/vanta-emblem.png" alt="VANTA Emblem" className="footer-emblem" />
          </div>
          <p>© {new Date().getFullYear()} VANTA™ Streetwear Studio. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#about">Privacy Policy</a>
            <span>•</span>
            <a href="#about">Terms of Service</a>
            <span>•</span>
            <a href="#about">Accessibility</a>
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false)
          setAutoOpenCheckoutInDrawer(false)
        }}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onUpdateSize={handleUpdateSize}
        onClearCart={() => setCartItems([])}
        autoOpenCheckout={autoOpenCheckoutInDrawer}
      />

      {/* Customer Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlistItems}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={(product, size) => {
          handleAddToCart(product, size, 1)
          setIsWishlistOpen(false)
          setIsCartOpen(true)
        }}
      />

      {/* Interactive Product Detail Modal */}
      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onAddToCart={(prod, size, qty) => handleAddToCart(prod, size, qty)}
          onBuyNow={(prod, size, qty) => handleBuyNow(prod, size, qty)}
          isWishlisted={wishlistIds.includes(selectedProductForDetail.id)}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      {/* Orders Tracking Modal */}
      {isOrdersModalOpen && (
        <div className="orders-modal-overlay" onClick={() => setIsOrdersModalOpen(false)}>
          <div className="orders-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="orders-modal-header">
              <div>
                <span className="orders-eyebrow">VANTA CLIENT ORDERS</span>
                <h3>TRACK &amp; MANAGE ORDERS</h3>
              </div>
              <button
                type="button"
                className="checkout-modal-close"
                onClick={() => setIsOrdersModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Search Specific Order */}
            <form className="order-lookup-form" onSubmit={handleSearchOrder}>
              <input
                type="text"
                placeholder="Enter Order Reference (e.g. VNTA-2026-664440)"
                value={orderSearchId}
                onChange={(e) => setOrderSearchId(e.target.value)}
              />
              <button type="submit" disabled={isSearchingOrder}>
                {isSearchingOrder ? 'TRACKING...' : 'TRACK'}
              </button>
            </form>

            {orderSearchError && <p className="order-lookup-error">{orderSearchError}</p>}

            {/* Single Order Search Result */}
            {orderSearchResult && (
              <div className="order-result-card">
                <div className="result-top">
                  <div>
                    <span className="order-ref-badge">{orderSearchResult.orderNumber}</span>
                    <h4>{orderSearchResult.customer.name}</h4>
                  </div>
                  <span className="status-badge green">{orderSearchResult.status}</span>
                </div>
                <div className="result-grid">
                  <div>
                    <small>ESTIMATED ARRIVAL</small>
                    <p><strong>{orderSearchResult.shipping.estimatedDelivery}</strong></p>
                  </div>
                  <div>
                    <small>PAYMENT</small>
                    <p>{orderSearchResult.paymentMethod} • {formatPrice(orderSearchResult.pricing.totalAmount)}</p>
                  </div>
                  <div>
                    <small>SHIPPING CARRIER</small>
                    <p>{orderSearchResult.shipping.method}</p>
                  </div>
                  <div>
                    <small>DELIVERY ADDRESS</small>
                    <p>{orderSearchResult.customer.address}, {orderSearchResult.customer.city} ({orderSearchResult.customer.pincode})</p>
                  </div>
                </div>
                <div className="order-result-actions">
                  <a
                    href={`/api/invoice/${orderSearchResult.orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="print-invoice-btn"
                  >
                    🖨️ View &amp; Print Official GST Tax Invoice
                  </a>
                </div>
              </div>
            )}

            {/* Recent Orders List from Backend */}
            <div className="recent-orders-section">
              <h4>RECENT SERVER ORDERS ({ordersList.length})</h4>
              {ordersList.length === 0 ? (
                <div className="empty-orders-view">
                  <p>No orders recorded on server yet.</p>
                  <small>Add items to your cart and complete checkout to see them here.</small>
                </div>
              ) : (
                <div className="orders-list-scroll">
                  {ordersList.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="order-history-item"
                      onClick={() => setOrderSearchResult(ord)}
                    >
                      <div className="order-history-header">
                        <strong>{ord.orderNumber}</strong>
                        <span className="status-badge green">{ord.status}</span>
                      </div>
                      <div className="order-history-meta">
                        <span>{ord.customer.name} • {ord.items.length} item(s)</span>
                        <strong>{formatPrice(ord.pricing.totalAmount)}</strong>
                      </div>
                      <small className="order-history-date">
                        Placed: {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • Mode: {ord.paymentMethod}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editorial Lookbook Modal */}
      {isLookbookOpen && (
        <div
          className="lookbook-overlay"
          onClick={() => setIsLookbookOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="VANTA Lookbook 2026"
        >
          <div
            className="lookbook-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="lookbook-header">
              <div className="lookbook-header-text">
                <span className="lookbook-eyebrow">VANTA // EDITORIAL DOSSIER</span>
                <h2 className="lookbook-title">LOOKBOOK 2026 — STREET ARCHITECTURE</h2>
                <p className="lookbook-desc">
                  Curated runway silhouettes engineered for all-season movement. Select any piece to inspect fabric specs and order directly.
                </p>
              </div>
              <button
                type="button"
                className="lookbook-close-btn"
                onClick={() => setIsLookbookOpen(false)}
                aria-label="Close Lookbook"
              >
                ✕
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="lookbook-filter-bar">
              <div className="lookbook-filter-pills">
                {['ALL', 'MEN', 'WOMEN'].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`lookbook-filter-pill ${lookbookFilter === filter ? 'active' : ''}`}
                    onClick={() => setLookbookFilter(filter)}
                  >
                    {filter === 'ALL' ? 'ALL LOOKS' : `${filter}'S CAPSULE`}
                  </button>
                ))}
              </div>
              <span className="lookbook-count">
                {LOOKBOOK_ITEMS.filter((item) => lookbookFilter === 'ALL' || item.gender.toUpperCase() === lookbookFilter).length} Curated Fits
              </span>
            </div>

            {/* Lookbook Cards Grid */}
            <div className="lookbook-grid">
              {LOOKBOOK_ITEMS
                .filter((item) => lookbookFilter === 'ALL' || item.gender.toUpperCase() === lookbookFilter)
                .map((item) => (
                  <article key={item.id} className="lookbook-card">
                    <div className="lookbook-card-image-wrap">
                      <img src={item.image} alt={item.title} className="lookbook-card-img" />
                      <div className="lookbook-badge-row">
                        <span className="lookbook-badge look-num">LOOK {item.lookNumber}</span>
                        <span className="lookbook-badge look-gender">{item.gender}</span>
                      </div>
                      <div className="lookbook-overlay-hover">
                        <button
                          type="button"
                          className="lookbook-quick-view-btn"
                          onClick={() => handleLookbookSelectProduct(item)}
                        >
                          Configure Piece ↗
                        </button>
                      </div>
                    </div>

                    <div className="lookbook-card-info">
                      <div className="lookbook-card-header">
                        <span className="lookbook-category">{item.category}</span>
                        <span className="lookbook-price">{formatPrice(item.numericPrice)}</span>
                      </div>
                      <h3 className="lookbook-item-title">{item.title}</h3>
                      <p className="lookbook-concept">{item.concept}</p>
                      <div className="lookbook-stylist-tip">
                        <strong>Stylist Note:</strong> {item.stylistNote}
                      </div>

                      <div className="lookbook-actions">
                        <button
                          type="button"
                          className="lookbook-shop-btn"
                          onClick={() => handleLookbookSelectProduct(item)}
                        >
                          Shop This Piece →
                        </button>
                        <button
                          type="button"
                          className={`lookbook-heart-btn ${wishlistIds.includes(item.id) ? 'active' : ''}`}
                          onClick={() => handleToggleWishlist(item.id)}
                          title={wishlistIds.includes(item.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
                        >
                          {wishlistIds.includes(item.id) ? '♥' : '♡'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
            </div>

            {/* Modal Footer CTA */}
            <div className="lookbook-footer-cta">
              <div>
                <h4>Looking for the complete seasonal catalog?</h4>
                <p>Browse all oversized fits, graphic tees, hoodies, and cargo outerwear.</p>
              </div>
              <button
                type="button"
                className="lookbook-explore-catalog-btn"
                onClick={() => {
                  setIsLookbookOpen(false)
                  handleShopNow()
                }}
              >
                Browse Full Catalog ({products.length} Items) ↓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal (Sign In / Sign Up / Staff Admin Gateway) */}
      <AuthModal onAdminSuccess={() => setIsAdminOpen(true)} />

      {/* Global Auth Notifications */}
      {authNotification && (
        <div className={`auth-global-toast ${authNotification.type}`}>
          <span>{authNotification.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{authNotification.message}</span>
        </div>
      )}
    </div>
  )
}

export default App

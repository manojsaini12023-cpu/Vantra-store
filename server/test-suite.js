const BASE_URL = 'http://localhost:5000'

async function runTests() {
  console.log('🧪 Starting VANTA Backend API Automated Test Suite...\n')
  let passed = 0
  let failed = 0

  const assert = (condition, name) => {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`)
      passed++
    } else {
      console.error(`  ✗ FAIL: ${name}`)
      failed++
    }
  }

  try {
    // 1. Healthcheck
    const healthRes = await fetch(`${BASE_URL}/api/health`).then(r => r.json())
    assert(healthRes.status === 'ok', 'Health check returns status ok')

    // 2. Products
    const prodRes = await fetch(`${BASE_URL}/api/products`).then(r => r.json())
    assert(prodRes.success && prodRes.count >= 9, `Products list returns catalog (${prodRes.count} items)`)

    // 3. Category Filter
    const hoodieRes = await fetch(`${BASE_URL}/api/products?category=Hoodie`).then(r => r.json())
    assert(hoodieRes.products.every(p => p.category === 'Hoodie'), 'Category filter returns only Hoodies')

    // 4. Single Product
    const singleRes = await fetch(`${BASE_URL}/api/products/1`).then(r => r.json())
    assert(singleRes.product && singleRes.product.id === 1, 'Single product lookup returns id 1')

    // 5. Promo VANTA10
    const promoRes1 = await fetch(`${BASE_URL}/api/promo/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'VANTA10', subtotal: 3799 })
    }).then(r => r.json())
    assert(promoRes1.valid && promoRes1.discountAmount === 380, `Promo VANTA10 calculates 10% (₹380)`)

    // 6. Promo VANTA500 threshold
    const promoRes2 = await fetch(`${BASE_URL}/api/promo/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'VANTA500', subtotal: 1500 })
    }).then(r => r.json())
    assert(!promoRes2.valid, 'Promo VANTA500 correctly rejects order below min threshold')

    // 7. Pincode Check
    const pinRes = await fetch(`${BASE_URL}/api/shipping/check-pincode/560038`).then(r => r.json())
    assert(pinRes.valid && pinRes.expressAvailable, 'Shipping pincode check confirms express dispatch')

    // 8. Newsletter
    const testEmail = `vip_${Date.now()}@vanta.studio`
    const newsRes = await fetch(`${BASE_URL}/api/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    }).then(r => r.json())
    assert(newsRes.success, 'Newsletter subscription registers new subscriber')

    // 9. Order Placement
    const orderPayload = {
      customer: {
        name: 'Rohan Mehra',
        phone: '+91 98765 43210',
        email: 'rohan@example.com',
        address: 'Penthouse 12, Cyber City',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122002'
      },
      items: [
        { id: 1, title: 'UNLEASH THE DRAGON TEE', size: 'L', quantity: 1, numericPrice: 3799, price: '₹3,799', image: '/products/tshirt-unleash-dragon.png' },
        { id: 2, title: 'HOT WHEELS RAGLAN TEE', size: 'XL', quantity: 1, numericPrice: 3499, price: '₹3,499', image: '/products/tshirt-hotwheels.png' }
      ],
      promoCode: 'VANTA10',
      paymentMethod: 'COD'
    }

    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    }).then(r => r.json())
    assert(orderRes.success && orderRes.order.orderNumber.startsWith('VNTA-'), `Order placed successfully (${orderRes.order?.orderNumber})`)

    const createdId = orderRes.order.orderId

    // 10. Order Lookup
    const lookupRes = await fetch(`${BASE_URL}/api/orders/${createdId}`).then(r => r.json())
    assert(lookupRes.success && lookupRes.order.customer.name === 'Rohan Mehra', `Order lookup matches customer (${lookupRes.order?.customer?.name})`)

    // 11. Orders List
    const listRes = await fetch(`${BASE_URL}/api/orders`).then(r => r.json())
    assert(listRes.success && listRes.orders.length > 0, `Orders listing contains ${listRes.count} orders`)

    console.log(`\n🎉 Test Suite Completed: ${passed} Passed, ${failed} Failed.`)
  } catch (err) {
    console.error('Test Suite encountered unhandled error:', err)
  }
}

runTests()

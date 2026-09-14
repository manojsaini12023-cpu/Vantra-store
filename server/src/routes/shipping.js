import { Router } from 'express'

const router = Router()

// Postal PIN code prefix mapping for all major zones in India
const PINCODE_GEO_DATABASE = [
  { prefix: '11', city: 'New Delhi', state: 'Delhi', isMetro: true },
  { prefix: '12', city: 'Gurugram', state: 'Haryana', isMetro: true },
  { prefix: '13', city: 'Ambala / Panipat', state: 'Haryana', isMetro: false },
  { prefix: '14', city: 'Ludhiana / Jalandhar', state: 'Punjab', isMetro: false },
  { prefix: '15', city: 'Bathinda / Firozpur', state: 'Punjab', isMetro: false },
  { prefix: '16', city: 'Chandigarh', state: 'Chandigarh', isMetro: true },
  { prefix: '17', city: 'Shimla / Dharamshala', state: 'Himachal Pradesh', isMetro: false },
  { prefix: '18', city: 'Jammu', state: 'Jammu and Kashmir', isMetro: false },
  { prefix: '19', city: 'Srinagar', state: 'Jammu and Kashmir', isMetro: false },
  { prefix: '20', city: 'Noida / Ghaziabad', state: 'Uttar Pradesh', isMetro: true },
  { prefix: '22', city: 'Lucknow / Varanasi', state: 'Uttar Pradesh', isMetro: false },
  { prefix: '24', city: 'Dehradun / Haridwar', state: 'Uttarakhand', isMetro: false },
  { prefix: '28', city: 'Agra / Mathura', state: 'Uttar Pradesh', isMetro: false },
  { prefix: '30', city: 'Jaipur', state: 'Rajasthan', isMetro: true },
  { prefix: '31', city: 'Udaipur / Kota', state: 'Rajasthan', isMetro: false },
  { prefix: '34', city: 'Jodhpur', state: 'Rajasthan', isMetro: false },
  { prefix: '38', city: 'Ahmedabad / Gandhinagar', state: 'Gujarat', isMetro: true },
  { prefix: '39', city: 'Surat / Vadodara', state: 'Gujarat', isMetro: true },
  { prefix: '40', city: 'Mumbai', state: 'Maharashtra', isMetro: true },
  { prefix: '41', city: 'Pune', state: 'Maharashtra', isMetro: true },
  { prefix: '42', city: 'Nashik', state: 'Maharashtra', isMetro: false },
  { prefix: '44', city: 'Nagpur', state: 'Maharashtra', isMetro: false },
  { prefix: '45', city: 'Indore', state: 'Madhya Pradesh', isMetro: true },
  { prefix: '46', city: 'Bhopal', state: 'Madhya Pradesh', isMetro: false },
  { prefix: '50', city: 'Hyderabad', state: 'Telangana', isMetro: true },
  { prefix: '51', city: 'Tirupati / Kadapa', state: 'Andhra Pradesh', isMetro: false },
  { prefix: '52', city: 'Vijayawada / Guntur', state: 'Andhra Pradesh', isMetro: false },
  { prefix: '53', city: 'Visakhapatnam', state: 'Andhra Pradesh', isMetro: false },
  { prefix: '56', city: 'Bengaluru', state: 'Karnataka', isMetro: true },
  { prefix: '57', city: 'Mangaluru / Mysuru', state: 'Karnataka', isMetro: false },
  { prefix: '58', city: 'Hubballi / Belagavi', state: 'Karnataka', isMetro: false },
  { prefix: '60', city: 'Chennai', state: 'Tamil Nadu', isMetro: true },
  { prefix: '62', city: 'Madurai', state: 'Tamil Nadu', isMetro: false },
  { prefix: '64', city: 'Coimbatore', state: 'Tamil Nadu', isMetro: false },
  { prefix: '68', city: 'Kochi / Ernakulam', state: 'Kerala', isMetro: true },
  { prefix: '69', city: 'Thiruvananthapuram', state: 'Kerala', isMetro: false },
  { prefix: '70', city: 'Kolkata', state: 'West Bengal', isMetro: true },
  { prefix: '71', city: 'Howrah / Hooghly', state: 'West Bengal', isMetro: false },
  { prefix: '75', city: 'Bhubaneswar / Cuttack', state: 'Odisha', isMetro: false },
  { prefix: '78', city: 'Guwahati', state: 'Assam', isMetro: false },
  { prefix: '80', city: 'Patna', state: 'Bihar', isMetro: false },
  { prefix: '83', city: 'Ranchi / Jamshedpur', state: 'Jharkhand', isMetro: false }
]

// GET /api/shipping/check-pincode/:pincode - Geocode PIN, detect City & State, and compute transit time
router.get('/check-pincode/:pincode', (req, res) => {
  try {
    const { pincode } = req.params

    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code.'
      })
    }

    const cleanPin = pincode.trim()
    const prefix2 = cleanPin.slice(0, 2)
    const match = PINCODE_GEO_DATABASE.find((item) => item.prefix === prefix2)

    const city = match ? match.city : 'District Center'
    const state = match ? match.state : 'India'
    const isMetro = match ? match.isMetro : false

    const now = new Date()
    const daysMin = isMetro ? 2 : 3
    const daysMax = isMetro ? 3 : 5

    const dateFrom = new Date(now.getTime() + daysMin * 24 * 60 * 60 * 1000)
    const dateTo = new Date(now.getTime() + daysMax * 24 * 60 * 60 * 1000)
    const dateOpts = { month: 'short', day: 'numeric' }

    const formattedDelivery = `${dateFrom.toLocaleDateString('en-IN', dateOpts)} - ${dateTo.toLocaleDateString('en-IN', dateOpts)}`

    res.json({
      success: true,
      valid: true,
      pincode: cleanPin,
      city,
      state,
      isMetro,
      expressAvailable: true,
      codAvailable: true,
      dispatchWindow: 'Same-day priority dispatch from VANTA Hub',
      estimatedDelivery: formattedDelivery,
      carrier: isMetro ? 'BlueDart Express Air Priority' : 'Delhivery Express Surface',
      message: `Direct delivery active for ${city}, ${state} (${cleanPin}). Estimated arrival: ${formattedDelivery}.`
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router

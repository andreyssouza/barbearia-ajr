const { Router } = require('express')
const { getPublicInfo, getSlots, createPublicAppointment } = require('../controllers/barbershopController')

const router = Router()

router.get('/:slug', getPublicInfo)
router.get('/:slug/slots', getSlots)
router.post('/:slug/appointments', createPublicAppointment)

module.exports = router

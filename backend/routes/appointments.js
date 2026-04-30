const { Router } = require('express')
const { list, create, remove } = require('../controllers/appointmentController')
const { authMiddleware } = require('../middleware/auth')

const router = Router()

router.use(authMiddleware)

router.get('/', list)
router.post('/', create)
router.delete('/:id', remove)

module.exports = router

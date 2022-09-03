const { handleSuperSignin, getGrowers, addGrower, getAdminDetails } = require('../controllers/supers');
const authMiddleware = require('../middlewares/auth');
const router = require('express').Router();

router.post('/super/login', handleSuperSignin);
router.get('/super/growers', authMiddleware, getGrowers);
router.put('/super/add-grower', authMiddleware, addGrower);
router.get('/super/verify', authMiddleware, getAdminDetails);

// const response = await request.put('/super/add-grower').send({ phoneNumber: mockUser.phoneNumber });

module.exports = router;

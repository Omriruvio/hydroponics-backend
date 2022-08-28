const { handleSuperSignin, getGrowers, addGrower } = require('../controllers/supers');
const authMiddleware = require('../middlewares/auth');
const router = require('express').Router();

router.post('/super/login', handleSuperSignin);
router.get('/super/growers', getGrowers);
router.put('/super/add-grower', addGrower);

// const response = await request.put('/super/add-grower').send({ phoneNumber: mockUser.phoneNumber });

module.exports = router;

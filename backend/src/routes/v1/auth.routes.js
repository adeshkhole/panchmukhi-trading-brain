const { Router } = require('express');
const { validateRequest } = require('../../utils/validation');
const authController = require('../../controllers/auth.controller');
const { authenticate } = require('../../middleware/auth');
const router = Router();

// Public routes
router.post(
  '/register',
  validateRequest('register', 'body'),
  authController.register
);

router.post(
  '/login',
  validateRequest('login', 'body'),
  authController.login
);

// Protected routes
router.use(authenticate);

router.get('/me', authController.getProfile);
router.put('/me', validateRequest('updateProfile', 'body'), authController.updateProfile);
router.put(
  '/change-password',
  validateRequest('changePassword', 'body'),
  authController.changePassword
);

module.exports = router;

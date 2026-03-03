import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator';

const router = Router();
const userController = new UserController();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Профиль пользователя
router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

// Смена пароля
router.put('/change-password', validate(changePasswordSchema), userController.changePassword);

// Аватар
router.put('/avatar', userController.updateAvatar);
router.delete('/avatar', userController.deleteAvatar);

// Деактивация аккаунта
router.post('/deactivate', userController.deactivateAccount);

export default router;

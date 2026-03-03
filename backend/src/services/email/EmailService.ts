import { transporter } from '../../config/email';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';

export class EmailService {
  /**
   * Send verification email to user
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationLink = `${config.FRONTEND_URL}/verify-email/${token}`;

    try {
      await transporter.sendMail({
        from: `"Fitness Platform" <${config.SMTP_FROM}>`,
        to: email,
        subject: 'Подтвердите ваш email',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🏋️ Добро пожаловать в Fitness Platform!</h1>
                </div>
                <div class="content">
                  <h2>Подтвердите ваш email</h2>
                  <p>Спасибо за регистрацию! Для завершения регистрации, пожалуйста, подтвердите ваш email адрес, нажав на кнопку ниже:</p>
                  <p style="text-align: center;">
                    <a href="${verificationLink}" class="button">Подтвердить Email</a>
                  </p>
                  <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
                  <p style="word-break: break-all; color: #667eea;">${verificationLink}</p>
                  <p><strong>Важно:</strong> Эта ссылка действительна в течение 24 часов.</p>
                  <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
                </div>
                <div class="footer">
                  <p>© 2024 Fitness Platform. Все права защищены.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
Добро пожаловать в Fitness Platform!

Для завершения регистрации, пожалуйста, перейдите по ссылке:
${verificationLink}

Эта ссылка действительна в течение 24 часов.

Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
        `,
      });

      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `${config.FRONTEND_URL}/reset-password/${token}`;

    try {
      await transporter.sendMail({
        from: `"Fitness Platform" <${config.SMTP_FROM}>`,
        to: email,
        subject: 'Сброс пароля',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #f44336; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔒 Сброс пароля</h1>
                </div>
                <div class="content">
                  <h2>Запрос на сброс пароля</h2>
                  <p>Вы запросили сброс пароля для вашего аккаунта. Нажмите на кнопку ниже, чтобы создать новый пароль:</p>
                  <p style="text-align: center;">
                    <a href="${resetLink}" class="button">Сбросить пароль</a>
                  </p>
                  <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
                  <p style="word-break: break-all; color: #f44336;">${resetLink}</p>
                  <p><strong>Важно:</strong> Эта ссылка действительна в течение 1 часа.</p>
                  <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо. Ваш пароль останется неизменным.</p>
                </div>
                <div class="footer">
                  <p>© 2024 Fitness Platform. Все права защищены.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
Сброс пароля

Вы запросили сброс пароля для вашего аккаунта. Перейдите по ссылке:
${resetLink}

Эта ссылка действительна в течение 1 часа.

Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
        `,
      });

      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      await transporter.sendMail({
        from: `"Fitness Platform" <${config.SMTP_FROM}>`,
        to: email,
        subject: 'Добро пожаловать в Fitness Platform! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Добро пожаловать, ${firstName}!</h1>
                </div>
                <div class="content">
                  <p>Спасибо за подтверждение вашего email! Теперь вы можете пользоваться всеми возможностями Fitness Platform:</p>
                  <ul>
                    <li>📊 Управление фитнес-целями и трекинг прогресса</li>
                    <li>💪 Планирование и логирование тренировок</li>
                    <li>🥗 Управление питанием и подсчет калорий</li>
                    <li>👨‍🏫 Онлайн-консультации с профессиональными тренерами</li>
                    <li>🤖 AI-рекомендации для достижения ваших целей</li>
                  </ul>
                  <p style="text-align: center;">
                    <a href="${config.FRONTEND_URL}/dashboard" class="button">Начать сейчас</a>
                  </p>
                  <p>Желаем вам успехов в достижении ваших фитнес-целей! 💪</p>
                </div>
                <div class="footer">
                  <p>© 2024 Fitness Platform. Все права защищены.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      // Don't throw error for welcome email - it's not critical
    }
  }
}

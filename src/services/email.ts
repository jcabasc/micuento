import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.resendApiKey);

const FROM_EMAIL = "MiCuento <noreply@micuento.co>";

interface OrderConfirmationParams {
  to: string;
  childName: string;
  storyTitle: string;
  orderId: string;
  totalAmount: number;
  orderStatusUrl: string;
}

interface OrderReadyParams {
  to: string;
  childName: string;
  storyTitle: string;
  orderId: string;
  downloadUrl: string;
}

interface PaymentFailedParams {
  to: string;
  childName: string;
  storyTitle: string;
  orderId: string;
  retryUrl: string;
}

/**
 * Send order confirmation email after successful payment
 */
export async function sendOrderConfirmationEmail(
  params: OrderConfirmationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `¡Pedido confirmado! Cuento para ${params.childName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 28px; font-weight: bold; color: #EA580C; }
            .content { background: #FFF7ED; padding: 30px; border-radius: 12px; }
            .highlight { color: #EA580C; font-weight: bold; }
            .button { display: inline-block; background: #EA580C; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MiCuento</div>
            </div>
            <div class="content">
              <h1>¡Gracias por tu pedido! 🎉</h1>
              <p>Estamos emocionados de crear un cuento especial para <span class="highlight">${params.childName}</span>.</p>

              <div class="order-details">
                <h3>Detalles del pedido</h3>
                <p><strong>Cuento:</strong> ${params.storyTitle}</p>
                <p><strong>Para:</strong> ${params.childName}</p>
                <p><strong>Total:</strong> $${(params.totalAmount / 100).toLocaleString("es-CO")} COP</p>
                <p><strong>ID del pedido:</strong> ${params.orderId}</p>
              </div>

              <p>Estamos personalizando las ilustraciones con el rostro de ${params.childName}. Este proceso puede tomar unos minutos.</p>

              <p style="text-align: center;">
                <a href="${params.orderStatusUrl}" class="button">Ver estado del pedido</a>
              </p>

              <p>Te enviaremos otro email cuando tu cuento esté listo para descargar.</p>
            </div>
            <div class="footer">
              <p>MiCuento - Cuentos personalizados que hacen soñar</p>
              <p>Si tienes alguna pregunta, responde a este email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

/**
 * Send email when order is ready for download
 */
export async function sendOrderReadyEmail(
  params: OrderReadyParams
): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `¡Tu cuento está listo! - ${params.childName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 28px; font-weight: bold; color: #EA580C; }
            .content { background: #FFF7ED; padding: 30px; border-radius: 12px; text-align: center; }
            .highlight { color: #EA580C; font-weight: bold; }
            .button { display: inline-block; background: #EA580C; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; margin: 20px 0; font-size: 18px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .emoji { font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MiCuento</div>
            </div>
            <div class="content">
              <div class="emoji">🎉📖</div>
              <h1>¡El cuento de ${params.childName} está listo!</h1>
              <p>Hemos terminado de personalizar tu cuento "<span class="highlight">${params.storyTitle}</span>".</p>

              <a href="${params.downloadUrl}" class="button">Descargar PDF</a>

              <p style="font-size: 14px; color: #666;">
                Este enlace estará disponible por 30 días.
              </p>
            </div>
            <div class="footer">
              <p>¡Esperamos que ${params.childName} disfrute su aventura!</p>
              <p>MiCuento - Cuentos personalizados que hacen soñar</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

/**
 * Send email when payment fails
 */
export async function sendPaymentFailedEmail(
  params: PaymentFailedParams
): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Problema con tu pago - MiCuento`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 28px; font-weight: bold; color: #EA580C; }
            .content { background: #FEF2F2; padding: 30px; border-radius: 12px; }
            .button { display: inline-block; background: #EA580C; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MiCuento</div>
            </div>
            <div class="content">
              <h1>Hubo un problema con tu pago 😢</h1>
              <p>No pudimos procesar el pago para el cuento de <strong>${params.childName}</strong>.</p>

              <p>Esto puede ocurrir por varias razones:</p>
              <ul>
                <li>Fondos insuficientes</li>
                <li>Tarjeta rechazada por el banco</li>
                <li>Datos incorrectos</li>
              </ul>

              <p>No te preocupes, puedes intentarlo de nuevo:</p>

              <p style="text-align: center;">
                <a href="${params.retryUrl}" class="button">Intentar de nuevo</a>
              </p>

              <p>Si el problema persiste, por favor contáctanos respondiendo a este email.</p>
            </div>
            <div class="footer">
              <p>MiCuento - Estamos aquí para ayudarte</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

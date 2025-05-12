
/**
 * Servicio para enviar datos a webhooks externos
 */

/**
 * Envía la información del chat a un webhook externo
 * @param userData Datos del usuario y sus respuestas
 * @returns Promise con el resultado de la operación
 */
export async function sendUserDataToWebhook(userData: any): Promise<Response> {
  const webhookUrl = 'https://hook.us1.make.com/apcwekw3rgkm0uq5mmx1pmqf9o6j2okq';
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return response;
  } catch (error) {
    console.error('Error al enviar datos al webhook:', error);
    throw error;
  }
}

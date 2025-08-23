export async function getPayment(paymentId: string) {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN_MP}`,
        }
      });

      return response.json(); // aqui estão os dados do pagamento
    } catch (error) {
      console.error("Erro ao buscar pagamento:", error);
      throw error;
    }
  }

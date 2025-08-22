import React, { useEffect, useState } from 'react';
import { loadMercadoPago } from "@mercadopago/sdk-js";
import { User } from '../types/user';

// Importante: Para variáveis de ambiente no frontend em frameworks como Next.js/Create React App,
// elas geralmente precisam de um prefixo como NEXT_PUBLIC_ ou REACT_APP_.
// Ajuste conforme o seu setup de ambiente.
const API_BASE_URL = import.meta.env.VITE_API_URL; // Exemplo para Next.js
const MERCADO_PAGO_PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO; // Sua chave pública do Mercado Pago

interface MercadoPagoButtonProps {
  // Você pode passar propriedades para o componente, se necessário,
  // como um ID de pedido, por exemplo.
  orderId?: string;
  user:User;
}

const MercadoPagoButton: React.FC<MercadoPagoButtonProps> = ({ orderId, user }) => {
  // Estado para controlar o ID da preferência de pagamento
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  // Estado para controlar o estado de carregamento
  const [loading, setLoading] = useState<boolean>(true);
  // Estado para controlar erros
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupMercadoPago = async (user:User) => {
      // Verifica se a chave pública está disponível

      if (!MERCADO_PAGO_PUBLIC_KEY) {
        setError("Chave pública do Mercado Pago não configurada.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Recupere o ID da preferência do seu backend
        // Adaptei o seu fetch para incluir um endpoint mais específico.
        // Certifique-se de que `API_BASE_URL` contém o protocolo (http/https).
        const response = await fetch(`https://${API_BASE_URL}/create-payment-preference`, {
          method: 'POST', // Geralmente a criação de preferência é um POST
          headers: {
            'Content-Type': 'application/json',
          },
          // Você pode enviar dados do pedido para o backend aqui
          body: JSON.stringify({ orderId: orderId, plan: user.plan, planId: user.planId, email:user.email }),
        });
        console.log(response)

        if (!response.ok) {
          throw new Error(`Erro ao buscar preferência: ${response.body}`);
        }

        const data = await response.json();
        if (!data.preferenceId) {
          throw new Error("ID da preferência não encontrado na resposta do backend.");
        }
        setPreferenceId(data.preferenceId);

        // 2. Carregue o SDK do Mercado Pago
        // Certifique-se de que o script do SDK é carregado apenas uma vez
        await loadMercadoPago();

        // 3. Inicialize o SDK com sua public_key
        const mp = new window.MercadoPago(MERCADO_PAGO_PUBLIC_KEY, {
            locale: 'pt-BR' // Opcional: define o idioma do Brick
        });

        // 4. Crie e renderize o botão de pagamento (Brick 'Wallet')
        const bricksBuilder = mp.bricks();
        bricksBuilder.create("wallet", "wallet_container", {
          initialization: {
            preferenceId: data.preferenceId,
          },
          // Opcional: callbacks para o ciclo de vida do Brick
          callbacks: {
            onReady: () => {
              console.log('Wallet Brick pronto para uso!');
            },
            onError: (error:string) => {
              console.error('Erro no Wallet Brick:', error);
              setError("Ocorreu um erro ao carregar o botão de pagamento.");
            },
          },
        });

      } catch (err) {
        console.error("Falha ao configurar o Mercado Pago:", err);
        setError(`Erro: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    // Chama a função de configuração quando o componente é montado
    setupMercadoPago(user);

    // Cleanup: Se o componente for desmontado, você pode querer destruir o Brick.
    // Isso é mais relevante para bricks interativos, mas é uma boa prática para evitar vazamento de memória.
    return () => {
      // Exemplo de como destruir, mas o Wallet Brick geralmente não precisa ser explicitamente destruído assim
      // bricksBuilder.unmount(); // Se existir um método de unmount
    };

  }, [orderId]); // Adicione `orderId` como dependência se a preferência depender dele

  if (loading) {
    return <div className="text-center p-4">Carregando botão de pagamento...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Erro: {error}</div>;
  }

  // A div `wallet_container` é onde o SDK do Mercado Pago vai injetar o botão.
  // Ela deve estar visível no DOM para que o Brick seja renderizado.
  return (
    <div className="flex justify-center p-4">
      <div id="wallet_container" className="w-full max-w-sm rounded-lg shadow-md p-4">
        {/* O botão será inserido aqui pelo SDK do Mercado Pago */}
      </div>
    </div>
  );
};

export default MercadoPagoButton;

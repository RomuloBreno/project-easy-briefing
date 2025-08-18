import { useState } from "react";

interface Props {
  successPay: boolean | null;
  message:string
}
export default function ModalExample({successPay, message}:Props) {
  const [isOpen, setIsOpen] = useState(successPay == null ? true: false);

  return (
    <div className="p-4">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-semibold mb-4">Alerta</h2>
            <p className="mb-4">${message}</p>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
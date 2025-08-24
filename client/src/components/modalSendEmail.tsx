interface Props {
   onClose: (value:number|null) => void;
   onSend: () => void;
  openModalSuccessPay: boolean | null;
  message:string
}
export default function modalSendEmail({onClose, onSend, openModalSuccessPay, message}:Props) {

  return (
    <div className="p-4" style={{position:'absolute',zIndex:'10'}}>
      {openModalSuccessPay && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-semibold mb-4">Alerta</h2>
            <p className="mb-4">{message}</p>
            <button
              onClick={() => onClose(null)}
              className="btn btn-outline"
            >
              Fechar
            </button>
            <button
              onClick={() => onSend()}
              className="btn btn-outline"
            >
              Enviar email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
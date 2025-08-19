interface Props {
   onShop: () => void;
}
export default function SpanUpdatePlan({onShop}:Props) {

  return (
   <div className="p-4">
  <span className="form-hint-pro text-gray-700">
    Assine o plano <strong className="font-semibold text-blue-600">PRO</strong> para acessar mais recursos e análises avançadas.
    <button 
      onClick={onShop} 
      className="ml-2 font-medium text-blue-500 hover:text-blue-700 hover:underline transition-colors duration-200 focus:outline-none"
    >
      Assine!
    </button>
  </span>
</div>
  );
}
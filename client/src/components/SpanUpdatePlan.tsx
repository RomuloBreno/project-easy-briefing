interface Props {
   onShop: () => void;
}
export default function SpanUpdatePlan({onShop}:Props) {

  return (
    <div className="p-4" style={{position:'absolute',zIndex:'10'}}>
       <span className="form-hint-pro">
        Assine o plano <strong>PRO</strong> para acessar mais recursos e análises avançadas <button onClick={onShop} className="btn btn-outline"></button>!
    </span>
    </div>
  );
}
import { CheckCircle, HelpCircle, Lightbulb, AlertTriangle } from "lucide-react";

interface AIResponse {
  analise: string;
  perguntas: string[];
  oportunidades: string[];
  cenarios: string[];
}

interface Props {
  aiResponse: AIResponse | null;
}

export default function AnalysisResults({ aiResponse }: Props) {
  if (aiResponse !== null){
      if(aiResponse.analise==''
        && aiResponse.perguntas.length == 0
        && aiResponse.oportunidades.length == 0
        && aiResponse.cenarios.length == 0
    ){
      return(
          <>
          <span>ERRO NA ANALISE DO TEXTO, TENTE NOVAMENTE MAIS TARDE</span>
          </>
      ) ;
    }

  }
  return (
    <>
    <div className="results-content space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <i className="fas fa-clipboard-check text-primary"></i> Análise Completa
      </h3>

      {/* Validação da Estrutura */}
      <div className="items-center justify-between bg-white shadow rounded-2xl p-4">
        <div className="items-center gap-3">
          <CheckCircle className="text-green-600 w-6 h-6" />
          <span className="font-semibold">Validação da Estrutura</span>
        </div>
        <br/>
        <p className="text-gray-700 text-sm">{aiResponse?.analise}</p>
      </div>

      {/* Perguntas Pertinentes */}
      <div className="bg-white shadow rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="text-blue-600 w-6 h-6" />
          <span className="font-semibold">Perguntas Pertinentes</span>
        </div>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {aiResponse?.perguntas?.map((q, idx) => (
            <li key={idx}>{q}</li>
          ))}
        </ul>
      </div>

      {/* Oportunidades de Novas Demandas */}
      <div className="bg-white shadow rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <Lightbulb className="text-yellow-600 w-6 h-6" />
          <span className="font-semibold">Oportunidades de Novas Demandas</span>
        </div>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {aiResponse?.oportunidades?.map((op, idx) => (
            <li key={idx}>{op}</li>
          ))}
        </ul>
      </div>

      {/* Cenários Não Validados */}
      <div className="bg-white shadow rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="text-red-600 w-6 h-6" />
          <span className="font-semibold">Cenários Não Validados</span>
        </div>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {aiResponse?.cenarios?.map((c, idx) => (
            <li key={idx}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
    </>
  );
}

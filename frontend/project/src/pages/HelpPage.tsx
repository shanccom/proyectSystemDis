import { ChevronDown, ChevronUp, HelpCircle, Mail, Shield } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: '¿Cómo emito mi voto?',
    a: 'Dirígete a "Inicio" o "Mis elecciones", selecciona la elección activa, elige tu candidato preferido y haz clic en "Confirmar voto". El proceso es simple y seguro.',
  },
  {
    q: '¿Puedo cambiar mi voto después de emitirlo?',
    a: 'No. Una vez confirmado, el voto es definitivo. Esto garantiza la integridad y transparencia del proceso electoral.',
  },
  {
    q: '¿Cuándo puedo ver los resultados?',
    a: 'Los resultados preliminares están disponibles en la sección "Resultados" durante el período electoral. Los resultados finales se publican al cierre de la elección.',
  },
  {
    q: '¿Mi voto es anónimo?',
    a: 'Sí. El sistema está diseñado para garantizar el anonimato de tu voto. Solo se registra que participaste, no a quién votaste.',
  },
  {
    q: '¿Qué hago si no puedo iniciar sesión?',
    a: 'Verifica que estés usando el correo correcto. Si olvidaste tu contraseña, usa la opción "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión.',
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ayuda</h1>
        <p className="text-gray-500 text-sm mb-8">Encuentra respuestas a las preguntas más frecuentes.</p>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Preguntas frecuentes</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                  {open === i
                    ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {open === i && (
                  <div className="px-5 pb-4 text-sm text-gray-500 border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Contacto</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">Soporte por correo</p>
                <p className="text-xs text-gray-400">soporte@votoseguro.edu</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">Seguridad</p>
                <p className="text-xs text-gray-400">Plataforma certificada y auditada</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description: "Respuestas a las preguntas más comunes sobre MiCuento",
};

const faqs = [
  {
    question: "¿Cómo funciona la personalización?",
    answer:
      "Subes una foto clara del rostro de tu hijo y nuestro sistema coloca su rostro en cada ilustración del cuento. También personalizamos el nombre del niño en toda la historia.",
  },
  {
    question: "¿Qué tipo de foto debo subir?",
    answer:
      "Necesitas una foto frontal del rostro con buena iluminación, fondo claro y sin obstrucciones (gafas de sol, gorras, etc.). Las fotos de pasaporte funcionan perfectamente.",
  },
  {
    question: "¿Cuánto tiempo tarda en generarse el libro?",
    answer:
      "El libro digital se genera en pocos minutos. Si eliges la opción impresa, el envío tarda entre 5-7 días hábiles dependiendo de tu ubicación.",
  },
  {
    question: "¿Puedo ver una vista previa antes de pagar?",
    answer:
      "Sí, después de subir la foto y personalizar el cuento, podrás ver una vista previa de algunas páginas antes de confirmar tu compra.",
  },
  {
    question: "¿Qué formatos de libro están disponibles?",
    answer:
      "Ofrecemos descarga digital en PDF de alta calidad. También tenemos opción de libro impreso en tapa dura con envío a toda Colombia.",
  },
  {
    question: "¿Puedo personalizar un libro para varios niños?",
    answer:
      "Actualmente cada libro se personaliza para un solo niño. Si tienes varios hijos, puedes crear un libro único para cada uno.",
  },
  {
    question: "¿Cuál es la política de reembolso?",
    answer:
      "Si no estás satisfecho con la calidad de la personalización, te ofrecemos rehacer el libro sin costo o un reembolso completo dentro de los primeros 7 días.",
  },
  {
    question: "¿Mis datos y fotos están seguros?",
    answer:
      "Sí, todas las fotos se procesan de forma segura y se eliminan después de generar el libro. No compartimos información personal con terceros.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h1>
          <p className="text-xl text-muted-foreground">
            Todo lo que necesitas saber sobre MiCuento
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-muted/50 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">
            ¿Tienes otra pregunta?
          </h2>
          <p className="text-muted-foreground">
            Escríbenos a{" "}
            <a
              href="mailto:contacto@micuento.com"
              className="text-primary hover:underline"
            >
              contacto@micuento.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Cuentos Personalizados
              <span className="text-primary block mt-2">
                Donde Tu Hijo Es El Héroe
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Crea libros de cuentos únicos con el rostro de tu hijo como
              protagonista. Personalización mágica con entrega rápida.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/stories">
                <Button size="lg" className="text-lg px-8">
                  Ver Historias
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Cómo Funciona
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por Qué Elegir MiCuento?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="✨"
              title="Personalización Mágica"
              description="El rostro de tu hijo aparece en cada página del cuento, creando una experiencia única e inolvidable."
            />
            <FeatureCard
              icon="📚"
              title="Historias de Calidad"
              description="Cuentos ilustrados profesionalmente con mensajes positivos que fomentan la imaginación y autoestima."
            />
            <FeatureCard
              icon="🚀"
              title="Entrega Rápida"
              description="Recibe tu libro personalizado en formato digital al instante o impreso en pocos días."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Cómo Funciona
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              step={1}
              title="Elige una Historia"
              description="Explora nuestra colección de cuentos y elige el favorito de tu hijo."
            />
            <StepCard
              step={2}
              title="Personaliza"
              description="Ingresa el nombre de tu hijo y sube una foto con buena iluminación."
            />
            <StepCard
              step={3}
              title="Vista Previa"
              description="Revisa cómo quedará el libro antes de confirmar tu pedido."
            />
            <StepCard
              step={4}
              title="Recibe tu Libro"
              description="Descarga el PDF o recibe el libro impreso en tu puerta."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Crea Un Recuerdo Que Durará Para Siempre
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Cada cuento es una aventura única donde tu hijo es el protagonista.
          </p>
          <Link href="/stories">
            <Button size="lg" className="text-lg px-12">
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6 rounded-xl bg-card border">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {step}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

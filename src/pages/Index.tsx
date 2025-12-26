import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Shield,
  Sparkles,
  Cross,
  Star,
  Heart,
  ScrollText,
  MousePointerClick,
  MessageCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans selection:bg-amber-100 dark:selection:bg-amber-900/30">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden pt-20">
          {/* Background Decorations */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/20 dark:bg-amber-700/10 rounded-full blur-3xl animate-pulse delay-700" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 dark:bg-blue-700/10 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-800 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
              <Cross className="w-4 h-4 text-amber-600 dark:text-amber-500" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                La première école numérique de la foi catholique
              </span>
            </div>

            {/* Title */}
            <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tight text-slate-900 dark:text-slate-50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 relative">
              Memoria <span className="text-amber-600 dark:text-amber-500">Fidei</span>
              <Sparkles className="absolute -top-8 -right-8 w-12 h-12 text-amber-300 dark:text-amber-600 opacity-50 hidden md:block" />
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              Ancrez la <strong>Parole de Dieu</strong> dans votre mémoire,<br />
              formez votre intelligence et nourrissez votre prière.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <SignedIn>
                <Link to="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95">
                    <Brain className="mr-2 h-6 w-6" />
                    Reprendre ma formation
                  </Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <Link to="/onboarding">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95">
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
                <Link to="/sign-in">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-2xl border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    J'ai déjà un compte
                  </Button>
                </Link>
              </SignedOut>
            </div>

            {/* Social Proofish */}
            <div className="pt-12 flex flex-wrap justify-center gap-8 text-slate-400 dark:text-slate-600 animate-in fade-in duration-1000 delay-700">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-slate-500 border-slate-300">Gratuit</Badge>
                <span>Pour tous</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-slate-500 border-slate-300">Catholique</Badge>
                <span>Fidèle au Magistère</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-slate-500 border-slate-300">Progressif</Badge>
                <span>À votre rythme</span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section className="py-24 bg-white dark:bg-slate-900 relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-6">
                Les 4 piliers de <span className="text-amber-600">votre croissance</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Une approche intégrale pour unifier votre vie spirituelle et intellectuelle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<BookOpen className="w-8 h-8 text-amber-600" />}
                title="Bible & Tradition"
                description="Redécouvrez l'Écriture Sainte lue dans la Tradition de l'Église. Une lecture suivie et typologique."
                delay={0}
              />
              <FeatureCard
                icon={<Brain className="w-8 h-8 text-blue-600" />}
                title="Mémoire"
                description="Une méthode cognitive unique pour mémoriser durablement les vérités de la foi et les versets clés."
                delay={100}
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8 text-red-600" />}
                title="Apologétique"
                description="Des outils et un Assistant IA pour répondre aux objections et rendre raison de votre espérance."
                delay={200}
              />
              <FeatureCard
                icon={<Heart className="w-8 h-8 text-rose-600" />}
                title="Vie de Prière"
                description="Rosaire interactif, Examen de conscience et Lectio Divina pour nourrir votre âme."
                delay={300}
              />
            </div>
          </div>
        </section>

        {/* DETAILED FEATURES SECTIONS using scroll animations */}
        <FeatureDetailSection
          title="L'Examen de Conscience"
          subtitle="Préparez votre confession"
          description="Un guide pas-à-pas à travers les 10 commandements, avec une génération de prière personnalisée par IA pour vous aider à exprimer votre contrition."
          icon={<ScrollText className="w-12 h-12 text-purple-600" />}
          image="/images/app-preview-confession.png" // Placeholder or we can use a generated image later
          align="left"
          gradient="from-purple-50 to-white dark:from-slate-900 dark:to-slate-950"
        />

        <FeatureDetailSection
          title="Assistant Apologète IA"
          subtitle="Ne restez jamais sans réponse"
          description="Une question sur le Purgatoire, la Vierge Marie ou le Pape ? Notre assistant théologique vous donne instantanément les arguments bibliques, patristiques et logiques."
          icon={<Shield className="w-12 h-12 text-indigo-600" />}
          image="/images/app-preview-apologetics.png"
          align="right"
          gradient="from-white to-indigo-50 dark:from-slate-950 dark:to-slate-900"
        />


        {/* FAQ SECTION */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-slate-900 dark:text-slate-50">
              Questions Fréquentes
            </h2>

            <div className="grid gap-6">
              <FaqItem
                question="Est-ce que l'application est gratuite ?"
                answer="Oui, Memoria Fidei est une initiative bénévole. L'intégralité du contenu (Bible, Catéchisme, Outils) est accessible gratuitement pour tous."
              />
              <FaqItem
                question="Quelle traduction de la Bible est utilisée ?"
                answer="Nous utilisons la traduction catholique officielle (AELF) pour la liturgie, ainsi que la Bible de Jérusalem pour l'étude approfondie."
              />
              <FaqItem
                question="Puis-je suivre ma progression sur plusieurs appareils ?"
                answer="Absolument. Votre compte est synchronisé dans le cloud (sécurisé). Commencez sur votre ordinateur, continuez sur votre tablette ou mobile."
              />
              <FaqItem
                question="L'IA est-elle fiable pour l'Apologétique ?"
                answer="Notre assistant IA est strictement paramétré pour répondre uniquement à partir du Magistère de l'Église, des Écritures et des Pères de l'Église. Il cite toujours ses sources."
              />
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-24 px-4 text-center bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <Star className="w-16 h-16 text-amber-400 mx-auto animate-pulse" />
            <h2 className="text-4xl md:text-6xl font-serif font-bold">
              Commencez votre ascension aujourd'hui
            </h2>
            <p className="text-xl text-slate-300">
              Rejoignez des milliers de catholiques qui redécouvrent la richesse de leur foi.
            </p>
            <div className="pt-4">
              <Link to="/onboarding">
                <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]">
                  Créer mon compte gratuit
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-100">
                <Cross className="w-6 h-6 text-amber-500" />
                <span className="font-serif text-xl font-bold">Memoria Fidei</span>
              </div>
              <p className="text-sm leading-relaxed">
                Former l'intelligence, nourrir la prière et fortifier la mémoire des disciples du XXIe siècle.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/bible" className="hover:text-amber-500 transition-colors">La Bible</Link></li>
                <li><Link to="/parcours" className="hover:text-amber-500 transition-colors">Parcours Annuel</Link></li>
                <li><Link to="/apologetique" className="hover:text-amber-500 transition-colors">Apologétique</Link></li>
                <li><Link to="/priere" className="hover:text-amber-500 transition-colors">Vie de Prière</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-amber-500 transition-colors">Catéchisme (CEC)</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Pères de l'Église</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Encycliques</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Liturgie des Heures</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 mb-4">Restons connectés</h4>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-slate-800 transition-colors"><MessageCircle className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-slate-800 transition-colors"><Heart className="w-5 h-5" /></a>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-900 text-center">
            <p className="text-xs font-medium tracking-widest uppercase text-slate-600">
              © {new Date().getFullYear()} Memoria Fidei — Ad Maiorem Dei Gloriam
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Components

const FaqItem = ({ question, answer }: { question: string, answer: string }) => (
  <Card className="border-none shadow-sm bg-white dark:bg-slate-950">
    <CardContent className="p-6">
      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 flex items-start gap-3">
        <span className="text-amber-500 mt-1"><MessageCircle className="w-5 h-5" /></span>
        {question}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 pl-8 leading-relaxed">
        {answer}
      </p>
    </CardContent>
  </Card>
);

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
  <Card
    className="group hover:scale-105 transition-all duration-300 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <CardContent className="p-6 text-center space-y-4 relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-200 to-transparent dark:from-slate-800 opacity-20 rounded-bl-full transition-all group-hover:scale-150 duration-500" />

      <div className="w-16 h-16 mx-auto rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-serif">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
        {description}
      </p>
    </CardContent>
  </Card>
);

const FeatureDetailSection = ({ title, subtitle, description, icon, image, align = "left", gradient }: any) => (
  <section className={`py-24 bg-gradient-to-b ${gradient}`}>
    <div className="container mx-auto px-4">
      <div className={`flex flex-col ${align === "right" ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-24`}>
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium">
            {icon}
            <span>{subtitle}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-slate-50 leading-tight">
            {title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>
          <div className="pt-4">
            <Link to="/dashboard" className="inline-flex items-center text-amber-600 font-bold hover:gap-4 gap-2 transition-all">
              Découvrir <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Visual Placeholder for now - normally here we would put a screenshot */}
        <div className="flex-1 w-full max-w-lg">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-slate-500/[0.05] dark:bg-grid-slate-400/[0.05]" />
            <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-lg m-8 w-full h-full flex flex-col items-center justify-center text-center space-y-4 group-hover:scale-105 transition-transform duration-500">
              {icon}
              <p className="font-serif text-xl font-bold">{title}</p>
              <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Index;
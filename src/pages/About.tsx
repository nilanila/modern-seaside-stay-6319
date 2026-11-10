import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Leaf, MapPin, Sparkles, User } from "lucide-react";

const valueIcons = [
  <Heart key="heart" />,
  <Leaf key="leaf" />,
  <MapPin key="map-pin" />,
  <Sparkles key="sparkles" />,
];

export default function About() {
  const { t } = useLanguage();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-sea-light to-white dark:from-sea-dark dark:to-background">
          <div className="container relative z-10 pt-20">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-sm text-primary font-medium uppercase tracking-wider">
                MareSereno
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6">
                {t.about.title}
              </h1>
              <p className="text-muted-foreground">
                {t.about.subtitle}
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/50 blur-3xl" />
            <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full bg-sea-light blur-3xl" />
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <span className="text-sm text-primary font-medium uppercase tracking-wider">
                  {t.about.story.subtitle}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                  {t.about.story.title}
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>{t.about.story.paragraph1}</p>
                  <p>{t.about.story.paragraph2}</p>
                  <p>{t.about.story.paragraph3}</p>
                </div>
              </div>

              <div className="relative animate-fade-in" style={{ animationDelay: "200ms" }}>
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=600&fit=crop"
                    alt={t.about.story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-2/3 h-2/3 rounded-2xl bg-primary/10 -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-card">
          <div className="container">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {t.about.stats.map((stat, index) => (
                <div
                  key={index}
                  className="glass-card p-8 rounded-xl text-center animate-fade-in"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-sm text-primary font-medium uppercase tracking-wider">
                {t.about.values.subtitle}
              </span>
              <h2 className="text-3xl font-bold mt-2 mb-4">
                {t.about.values.title}
              </h2>
              <p className="text-muted-foreground">
                {t.about.values.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {t.about.values.items.map((item, index) => (
                <div
                  key={index}
                  className="glass-card p-6 rounded-xl flex flex-col items-center text-center animate-fade-in"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="mb-4 p-3 rounded-full bg-primary/10 text-primary">
                    {valueIcons[index] ?? <Heart />}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-card">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-sm text-primary font-medium uppercase tracking-wider">
                {t.about.team.subtitle}
              </span>
              <h2 className="text-3xl font-bold mt-2 mb-4">
                {t.about.team.title}
              </h2>
              <p className="text-muted-foreground">
                {t.about.team.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {t.about.team.members.map((member, index) => (
                <div
                  key={index}
                  className="glass-card p-6 rounded-xl flex flex-col items-center text-center animate-fade-in"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="mb-4 w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <User className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t.about.cta.title}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t.about.cta.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="btn-primary">
                  <Link to="/booking">{t.about.cta.button}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/contact">{t.about.cta.contact}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

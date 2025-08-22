import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Users, Wifi, Car, Waves, Utensils, Coffee } from "lucide-react";
import { Link } from "react-router-dom";

export default function Prices() {
  const { t } = useLanguage();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pricingPlans = [
    {
      id: "studio",
      name: "Executive Beach Studio",
      description: "Perfect for couples seeking a romantic getaway",
      price: "€120",
      period: "per night",
      guests: 2,
      popular: false,
      features: [
        "Direct beach access",
        "Modern design & premium finishes", 
        "Private balcony with sea view",
        "Complimentary Wi-Fi",
        "Daily housekeeping",
        "Beach towels included"
      ],
      amenities: [
        { icon: <Users className="w-4 h-4" />, text: "Up to 2 guests" },
        { icon: <Wifi className="w-4 h-4" />, text: "High-speed Wi-Fi" },
        { icon: <Waves className="w-4 h-4" />, text: "Sea view" },
        { icon: <Coffee className="w-4 h-4" />, text: "Coffee machine" }
      ]
    },
    {
      id: "suite",
      name: "Deluxe Sea View Suite", 
      description: "Luxurious suite with panoramic views and premium amenities",
      price: "€180",
      period: "per night",
      guests: 4,
      popular: true,
      features: [
        "Panoramic sea views",
        "Separate living area",
        "Premium bathroom amenities",
        "Private balcony",
        "Room service available",
        "Concierge services",
        "Beach chair reservation",
        "Welcome champagne"
      ],
      amenities: [
        { icon: <Users className="w-4 h-4" />, text: "Up to 4 guests" },
        { icon: <Wifi className="w-4 h-4" />, text: "High-speed Wi-Fi" },
        { icon: <Waves className="w-4 h-4" />, text: "Panoramic sea view" },
        { icon: <Utensils className="w-4 h-4" />, text: "Room service" }
      ]
    },
    {
      id: "penthouse",
      name: "Luxury Penthouse Suite",
      description: "Ultimate luxury with expansive terrace and exclusive services",
      price: "€350",
      period: "per night", 
      guests: 6,
      popular: false,
      features: [
        "Exclusive top-floor location",
        "Private terrace with jacuzzi",
        "Personal concierge service",
        "Premium minibar included",
        "Airport transfer included",
        "Private beach area access",
        "Gourmet breakfast included",
        "Spa treatment credits"
      ],
      amenities: [
        { icon: <Users className="w-4 h-4" />, text: "Up to 6 guests" },
        { icon: <Car className="w-4 h-4" />, text: "Airport transfer" },
        { icon: <Waves className="w-4 h-4" />, text: "Private terrace" },
        { icon: <Star className="w-4 h-4" />, text: "VIP services" }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-sea-light to-white dark:from-sea-dark dark:to-background">
          <div className="container relative z-10 pt-20">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-sm text-primary font-medium uppercase tracking-wider">
                Pricing
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6">
                Our Accommodation Rates
              </h1>
              <p className="text-muted-foreground text-lg">
                Discover transparent pricing for luxury beachfront accommodations with premium amenities and breathtaking sea views.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {pricingPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    plan.popular 
                      ? 'border-primary shadow-lg scale-105' 
                      : 'hover:scale-105'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
                      <Badge variant="default" className="bg-primary">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">{plan.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Amenities */}
                    <div className="grid grid-cols-2 gap-3">
                      {plan.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className="text-primary">{amenity.icon}</div>
                          <span>{amenity.text}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        Included Features
                      </h4>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-4">
                    <Button asChild className="w-full btn-primary">
                      <Link to="/booking">
                        Book Now
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Seasonal Pricing Info */}
        <section className="py-16 bg-card">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Seasonal Pricing Information</h2>
                <p className="text-muted-foreground">
                  Our rates vary by season to provide you with the best value throughout the year.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-lg border bg-background">
                  <h3 className="font-semibold mb-2 text-primary">Peak Season</h3>
                  <p className="text-sm text-muted-foreground mb-2">June - September</p>
                  <p className="text-sm">Standard rates apply. Advanced booking recommended.</p>
                </div>
                
                <div className="text-center p-6 rounded-lg border bg-background">
                  <h3 className="font-semibold mb-2 text-primary">Mid Season</h3>
                  <p className="text-sm text-muted-foreground mb-2">April - May, October</p>
                  <p className="text-sm">15% discount on standard rates.</p>
                </div>
                
                <div className="text-center p-6 rounded-lg border bg-background">
                  <h3 className="font-semibold mb-2 text-primary">Low Season</h3>
                  <p className="text-sm text-muted-foreground mb-2">November - March</p>
                  <p className="text-sm">25% discount on standard rates.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">What's Included</h2>
                <p className="text-muted-foreground">
                  Every stay includes access to our premium facilities and services.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wifi className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold mb-2">Free Wi-Fi</h4>
                  <p className="text-sm text-muted-foreground">High-speed internet throughout the property</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold mb-2">Free Parking</h4>
                  <p className="text-sm text-muted-foreground">Complimentary parking for all guests</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Waves className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold mb-2">Beach Access</h4>
                  <p className="text-sm text-muted-foreground">Direct access to pristine private beach</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold mb-2">Daily Service</h4>
                  <p className="text-sm text-muted-foreground">Housekeeping and concierge services</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
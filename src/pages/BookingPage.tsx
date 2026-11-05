
import { useEffect, useState } from "react";
import { format, addDays, differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CalendarIcon, Users, CreditCard, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApartmentProps } from "@/components/ApartmentCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { lookup } from "@/lib/translate";

// Sample apartments data
const apartmentsData: ApartmentProps[] = [
  {
    id: "1",
    name: "Deluxe Sea View Suite",
    description: "Luxurious suite with panoramic sea views, modern amenities, and a private balcony.",
    price: 180,
    capacity: 2,
    size: 45,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
    location: "Beachfront",
    features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "TV", "Balcony"]
  },
  {
    id: "2",
    name: "Premium Family Apartment",
    description: "Spacious apartment ideal for families, with full kitchen and stunning coastal views.",
    price: 250,
    capacity: 4,
    size: 75,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    location: "Second row",
    features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "TV", "Washing Machine"]
  },
  {
    id: "3",
    name: "Executive Beach Studio",
    description: "Elegant studio with direct beach access, modern design, and premium finishes.",
    price: 150,
    capacity: 2,
    size: 35,
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&h=600&fit=crop",
    location: "Beachfront",
    features: ["Wi-Fi", "Kitchenette", "Bathroom", "Air Conditioning", "TV"]
  },
];

export default function BookingPage() {
  const { t, language, dateLocale } = useLanguage();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 7));
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [selectedApartment, setSelectedApartment] = useState<ApartmentProps | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    paymentMethod: "credit-card",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    specialRequests: ""
  });
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  // Calculate nights and total price
  const nightsCount = startDate && endDate ? differenceInDays(endDate, startDate) : 0;
  const totalPrice = selectedApartment ? selectedApartment.price * nightsCount : 0;

  // Localised labels for data-driven content
  const apartmentName = (apt: ApartmentProps) => t.apartmentDescriptions[apt.id]?.name ?? apt.name;
  const apartmentDescription = (apt: ApartmentProps) => t.apartmentDescriptions[apt.id]?.description ?? apt.description;
  const apartmentLocation = (apt: ApartmentProps) => lookup(t.apartments.locations, apt.location);
  const summaryDateFormat = language === "it" ? "EEE d MMM yyyy" : "EEE, MMM d, yyyy";
  const formatSummaryDate = (date?: Date) =>
    date ? format(date, summaryDateFormat, { locale: dateLocale }) : t.booking.summary.notSelected;
  const adultsCount = parseInt(adults);
  const childrenCount = parseInt(children);
  const guestsLabel =
    `${adults} ${adultsCount === 1 ? t.booking.dates.adult : t.booking.dates.adults}` +
    (childrenCount > 0 ? `, ${children} ${childrenCount === 1 ? t.booking.dates.child : t.booking.dates.children}` : "");
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Submit booking
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send the booking data to a server
    console.log("Booking submitted:", {
      apartment: selectedApartment,
      dates: { startDate, endDate },
      guests: { adults, children },
      customerInfo: formData
    });
    
    // Show confirmation
    setIsBookingConfirmed(true);
    
    // Reset form after booking is confirmed
    setTimeout(() => {
      setCurrentStep(1);
      setSelectedApartment(null);
      setStartDate(new Date());
      setEndDate(addDays(new Date(), 7));
      setAdults("2");
      setChildren("0");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zipCode: "",
        country: "",
        paymentMethod: "credit-card",
        cardName: "",
        cardNumber: "",
        cardExpiry: "",
        cardCvc: "",
        specialRequests: ""
      });
      setIsBookingConfirmed(false);
    }, 5000);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        {/* Header Section */}
        <section className="relative py-16 bg-gradient-to-r from-sea-light to-white dark:from-sea-dark dark:to-background overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t.booking.title}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t.booking.subtitle}
              </p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/50 blur-3xl" />
            <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full bg-sea-light blur-3xl" />
          </div>
        </section>
        
        {/* Booking Steps */}
        <section className="container py-8">
          <div className="relative animate-fade-in [animation-delay:200ms]">
            <div className="flex justify-between items-center mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                      currentStep >= step
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{step}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      currentStep >= step
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step === 1 ? t.booking.steps.chooseRoom : step === 2 ? t.booking.steps.guestDetails : t.booking.steps.confirmation}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted z-0">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Step 1: Choose Room */}
          {currentStep === 1 && (
            <div className="animate-fade-in [animation-delay:300ms]">
              <div className="max-w-4xl mx-auto">
                {/* Date and Guests Selection */}
                <div className="glass-card p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">{t.booking.dates.selectDates}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Check-in Date */}
                    <div className="space-y-2">
                      <label htmlFor="check-in" className="block text-sm font-medium">
                        {t.booking.dates.checkIn}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="check-in"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP", { locale: dateLocale }) : <span>{t.booking.dates.selectDate}</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                            locale={dateLocale}
                            disabled={(date) => date < new Date()}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {/* Check-out Date */}
                    <div className="space-y-2">
                      <label htmlFor="check-out" className="block text-sm font-medium">
                        {t.booking.dates.checkOut}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="check-out"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP", { locale: dateLocale }) : <span>{t.booking.dates.selectDate}</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                            locale={dateLocale}
                            disabled={(date) => date < (startDate || new Date())}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {/* Adults */}
                    <div className="space-y-2">
                      <label htmlFor="adults" className="block text-sm font-medium">
                        {t.booking.dates.adults}
                      </label>
                      <Select value={adults} onValueChange={setAdults}>
                        <SelectTrigger id="adults" className="w-full">
                          <SelectValue placeholder={t.booking.dates.select} />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? t.booking.dates.adult : t.booking.dates.adults}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Children */}
                    <div className="space-y-2">
                      <label htmlFor="children" className="block text-sm font-medium">
                        {t.booking.dates.children}
                      </label>
                      <Select value={children} onValueChange={setChildren}>
                        <SelectTrigger id="children" className="w-full">
                          <SelectValue placeholder={t.booking.dates.select} />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? t.booking.dates.child : t.booking.dates.children}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Apartments Selection */}
                <h2 className="text-xl font-semibold mb-4">{t.booking.accommodationSelect.title}</h2>
                <div className="space-y-6">
                  {apartmentsData.map((apartment) => (
                    <div 
                      key={apartment.id}
                      className={cn(
                        "border rounded-xl overflow-hidden transition-all flex flex-col md:flex-row",
                        selectedApartment?.id === apartment.id 
                          ? "border-primary shadow-md" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="md:w-1/3 h-48 md:h-auto relative">
                        <img 
                          src={apartment.image} 
                          alt={apartmentName(apartment)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{apartmentName(apartment)}</h3>
                          <p className="text-muted-foreground mb-4">{apartmentDescription(apartment)}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <div className="text-sm bg-muted px-3 py-1 rounded-full">
                              {apartment.capacity} {t.booking.accommodationSelect.guests}
                            </div>
                            <div className="text-sm bg-muted px-3 py-1 rounded-full">
                              {apartment.size} m²
                            </div>
                            <div className="text-sm bg-muted px-3 py-1 rounded-full">
                              {apartmentLocation(apartment)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div>
                            <span className="text-xl font-bold">${apartment.price}</span>
                            <span className="text-muted-foreground text-sm"> / {t.booking.summary.night}</span>
                          </div>
                          <Button 
                            variant={selectedApartment?.id === apartment.id ? "default" : "outline"}
                            className={selectedApartment?.id === apartment.id ? "btn-primary" : ""}
                            onClick={() => setSelectedApartment(apartment)}
                          >
                            {selectedApartment?.id === apartment.id ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                {t.booking.accommodationSelect.selected}
                              </>
                            ) : (
                              t.booking.accommodationSelect.select
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-8">
                  <Button 
                    className="btn-primary"
                    disabled={!selectedApartment}
                    onClick={() => setCurrentStep(2)}
                  >
                    {t.booking.accommodationSelect.continue} <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Guest Details */}
          {currentStep === 2 && (
            <div className="animate-fade-in [animation-delay:300ms]">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Guest Information Form */}
                  <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">{t.booking.guestInfo.title}</h2>
                    <form className="space-y-6">
                      <div className="glass-card p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">{t.booking.guestInfo.firstName}</Label>
                            <Input 
                              id="firstName" 
                              name="firstName" 
                              value={formData.firstName} 
                              onChange={handleInputChange} 
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">{t.booking.guestInfo.lastName}</Label>
                            <Input 
                              id="lastName" 
                              name="lastName" 
                              value={formData.lastName} 
                              onChange={handleInputChange} 
                              required 
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">{t.booking.guestInfo.email}</Label>
                            <Input 
                              id="email" 
                              name="email" 
                              type="email" 
                              value={formData.email} 
                              onChange={handleInputChange} 
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">{t.booking.guestInfo.phone}</Label>
                            <Input 
                              id="phone" 
                              name="phone" 
                              value={formData.phone} 
                              onChange={handleInputChange} 
                              required 
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address">{t.booking.guestInfo.address}</Label>
                          <Input 
                            id="address" 
                            name="address" 
                            value={formData.address} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">{t.booking.guestInfo.city}</Label>
                            <Input 
                              id="city" 
                              name="city" 
                              value={formData.city} 
                              onChange={handleInputChange} 
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">{t.booking.guestInfo.zipCode}</Label>
                            <Input 
                              id="zipCode" 
                              name="zipCode" 
                              value={formData.zipCode} 
                              onChange={handleInputChange} 
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">{t.booking.guestInfo.country}</Label>
                            <Input 
                              id="country" 
                              name="country" 
                              value={formData.country} 
                              onChange={handleInputChange} 
                              required 
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="specialRequests">{t.booking.guestInfo.specialRequests}</Label>
                          <textarea 
                            id="specialRequests" 
                            name="specialRequests" 
                            value={formData.specialRequests} 
                            onChange={handleInputChange}
                            className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder={t.booking.guestInfo.specialRequestsPlaceholder}
                          />
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-semibold mb-4">{t.booking.payment.title}</h2>
                      <div className="glass-card p-6 space-y-6">
                        <Tabs defaultValue="credit-card" onValueChange={(value) => handleSelectChange("paymentMethod", value)}>
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="credit-card">{t.booking.payment.creditCard}</TabsTrigger>
                            <TabsTrigger value="pay-at-property">{t.booking.payment.payAtProperty}</TabsTrigger>
                          </TabsList>
                          <TabsContent value="credit-card" className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="cardName">{t.booking.payment.nameOnCard}</Label>
                              <Input 
                                id="cardName" 
                                name="cardName" 
                                value={formData.cardName} 
                                onChange={handleInputChange} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cardNumber">{t.booking.payment.cardNumber}</Label>
                              <Input 
                                id="cardNumber" 
                                name="cardNumber" 
                                value={formData.cardNumber} 
                                onChange={handleInputChange}
                                placeholder={t.booking.payment.cardNumberPlaceholder} 
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="cardExpiry">{t.booking.payment.expiryDate}</Label>
                                <Input 
                                  id="cardExpiry" 
                                  name="cardExpiry" 
                                  value={formData.cardExpiry} 
                                  onChange={handleInputChange}
                                  placeholder={t.booking.payment.expiryDatePlaceholder} 
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cardCvc">{t.booking.payment.cvc}</Label>
                                <Input 
                                  id="cardCvc" 
                                  name="cardCvc" 
                                  value={formData.cardCvc} 
                                  onChange={handleInputChange}
                                  placeholder={t.booking.payment.cvcPlaceholder} 
                                />
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="pay-at-property" className="mt-4">
                            <p className="text-muted-foreground">
                              {t.booking.payment.payAtPropertyInfo}
                            </p>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </form>
                  </div>
                  
                  {/* Booking Summary */}
                  <div className="md:col-span-1">
                    <h2 className="text-xl font-semibold mb-4">{t.booking.summary.title}</h2>
                    <div className="glass-card p-6 sticky top-24">
                      {selectedApartment && (
                        <>
                          <div className="pb-4 border-b">
                            <h3 className="font-medium mb-1">{apartmentName(selectedApartment)}</h3>
                            <p className="text-sm text-muted-foreground">{apartmentLocation(selectedApartment)}</p>
                          </div>
                          
                          <div className="py-4 border-b space-y-2">
                            <div className="flex justify-between items-center">
                              <span>{t.booking.summary.checkIn}</span>
                              <span className="font-medium">
                                {formatSummaryDate(startDate)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>{t.booking.summary.checkOut}</span>
                              <span className="font-medium">
                                {formatSummaryDate(endDate)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>{t.booking.summary.guests}</span>
                              <span className="font-medium">
                                {guestsLabel}
                              </span>
                            </div>
                          </div>
                          
                          <div className="py-4 border-b space-y-2">
                            <div className="flex justify-between items-center">
                              <span>
                                ${selectedApartment.price} x {nightsCount} {nightsCount === 1 ? t.booking.summary.night : t.booking.summary.nights}
                              </span>
                              <span className="font-medium">${selectedApartment.price * nightsCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>{t.booking.summary.cleaningFee}</span>
                              <span className="font-medium">$50</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>{t.booking.summary.serviceFee}</span>
                              <span className="font-medium">$30</span>
                            </div>
                          </div>
                          
                          <div className="pt-4">
                            <div className="flex justify-between items-center font-bold">
                              <span>{t.booking.summary.total}</span>
                              <span>${totalPrice + 50 + 30}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    {t.booking.confirmation.back}
                  </Button>
                  <Button 
                    className="btn-primary"
                    onClick={() => setCurrentStep(3)}
                  >
                    {t.booking.confirmation.reviewConfirm} <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="animate-fade-in [animation-delay:300ms]">
              <div className="max-w-4xl mx-auto">
                {!isBookingConfirmed ? (
                  <>
                    <h2 className="text-xl font-semibold mb-6">{t.booking.confirmation.title}</h2>
                    
                    <div className="glass-card p-6 mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Apartment Details */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">{t.booking.confirmation.accommodationDetails}</h3>
                          {selectedApartment && (
                            <div className="space-y-4">
                              <div className="rounded-lg overflow-hidden">
                                <img 
                                  src={selectedApartment.image} 
                                  alt={apartmentName(selectedApartment)}
                                  className="w-full h-48 object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold">{apartmentName(selectedApartment)}</h4>
                                <p className="text-sm text-muted-foreground">{apartmentLocation(selectedApartment)}</p>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>{t.booking.summary.checkIn}:</span>
                                  <span className="font-medium">
                                    {formatSummaryDate(startDate)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>{t.booking.summary.checkOut}:</span>
                                  <span className="font-medium">
                                    {formatSummaryDate(endDate)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>{t.booking.summary.guests}:</span>
                                  <span className="font-medium">
                                    {guestsLabel}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Guest Details */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">{t.booking.confirmation.guestDetails}</h3>
                          <div className="space-y-4">
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>{t.booking.confirmation.name}:</span>
                                <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t.booking.confirmation.email}:</span>
                                <span className="font-medium">{formData.email}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t.booking.confirmation.phone}:</span>
                                <span className="font-medium">{formData.phone}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t.booking.confirmation.address}:</span>
                                <span className="font-medium">{formData.address}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t.booking.confirmation.city}:</span>
                                <span className="font-medium">{formData.city}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t.booking.confirmation.country}:</span>
                                <span className="font-medium">{formData.country}</span>
                              </div>
                            </div>
                            
                            {formData.specialRequests && (
                              <div>
                                <h4 className="font-medium mb-1">{t.booking.confirmation.specialRequests}:</h4>
                                <p className="text-sm text-muted-foreground">{formData.specialRequests}</p>
                              </div>
                            )}
                            
                            <div>
                              <h4 className="font-medium mb-1">{t.booking.confirmation.paymentMethod}:</h4>
                              <p className="text-sm">
                                {formData.paymentMethod === "credit-card" ? (
                                  <span className="flex items-center">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    {t.booking.confirmation.creditCard} ({t.booking.confirmation.endingIn} {formData.cardNumber.slice(-4) || "****"})
                                  </span>
                                ) : (
                                  t.booking.payment.payAtProperty
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Summary */}
                    <div className="glass-card p-6 mb-8">
                      <h3 className="text-lg font-medium mb-4">{t.booking.confirmation.priceSummary}</h3>
                      <div className="space-y-2">
                        {selectedApartment && (
                          <>
                            <div className="flex justify-between items-center">
                              <span>
                                ${selectedApartment.price} x {nightsCount} {nightsCount === 1 ? t.booking.summary.night : t.booking.summary.nights}
                              </span>
                              <span className="font-medium">${selectedApartment.price * nightsCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>{t.booking.summary.cleaningFee}</span>
                              <span className="font-medium">$50</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>{t.booking.summary.serviceFee}</span>
                              <span className="font-medium">$30</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t mt-4">
                              <span className="font-semibold">{t.booking.summary.total}</span>
                              <span className="font-bold text-xl">${totalPrice + 50 + 30}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Terms and Conditions */}
                    <div className="mb-8">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="terms"
                          className="mt-1 mr-3"
                        />
                        <label htmlFor="terms" className="text-sm text-muted-foreground">
                          {t.booking.confirmation.termsAgree} <a href="#" className="text-primary underline">{t.booking.confirmation.termsLink}</a> {t.booking.confirmation.and} <a href="#" className="text-primary underline">{t.booking.confirmation.privacyLink}</a>. {t.booking.confirmation.cancellationInfo}
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                      >
                        {t.booking.confirmation.back}
                      </Button>
                      <Button 
                        className="btn-primary"
                        onClick={handleSubmitBooking}
                      >
                        {t.booking.confirmation.confirmBooking} <Check className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="glass-card p-8 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{t.booking.confirmation.success}</h2>
                    <p className="text-muted-foreground mb-6">
                      {t.booking.confirmation.emailSent} {formData.email}.
                    </p>
                    <p className="font-medium mb-8">
                      {t.booking.confirmation.bookingReference}: <span className="text-primary">MRS-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
                    </p>
                    <Button asChild className="btn-primary">
                      <Link to="/">{t.booking.confirmation.returnToHome}</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

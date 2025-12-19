import { Store, Pill, Smartphone, Utensils, GraduationCap, Briefcase, Home, ShoppingBag, MapPin, Phone } from "lucide-react";

export interface Shop {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  image: string;
  rating: number;
  reviews: number;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  slug: string;
}

export const CATEGORIES: Category[] = [
  { id: "1", name: "Grocery", icon: ShoppingBag, color: "bg-green-100 text-green-600", slug: "grocery" },
  { id: "2", name: "Medical", icon: Pill, color: "bg-blue-100 text-blue-600", slug: "medical" },
  { id: "3", name: "Mobile & Electronics", icon: Smartphone, color: "bg-purple-100 text-purple-600", slug: "electronics" },
  { id: "4", name: "Restaurants & Hotels", icon: Utensils, color: "bg-orange-100 text-orange-600", slug: "restaurants" },
  { id: "5", name: "Coaching & Education", icon: GraduationCap, color: "bg-yellow-100 text-yellow-600", slug: "education" },
  { id: "6", name: "Services", icon: Briefcase, color: "bg-gray-100 text-gray-600", slug: "services" },
  { id: "7", name: "Real Estate", icon: Home, color: "bg-indigo-100 text-indigo-600", slug: "real-estate" },
];

export const SHOPS: Shop[] = [
  {
    id: "1",
    name: "Gupta General Store",
    category: "grocery",
    description: "Best quality pulses, rice, and daily needs at wholesale prices. Serving Shahdol for 20 years.",
    address: "Main Market, Near Clock Tower, Shahdol",
    phone: "919876543210",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    reviews: 120,
    featured: true
  },
  {
    id: "2",
    name: "City Medical Hall",
    category: "medical",
    description: "24/7 Pharmacy with all types of medicines and surgical equipment available.",
    address: "Opposite District Hospital, Shahdol",
    phone: "919876543211",
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    reviews: 85,
    featured: true
  },
  {
    id: "3",
    name: "TechWorld Electronics",
    category: "electronics",
    description: "Latest smartphones, laptops, and accessories. Authorized service center for major brands.",
    address: "Station Road, Shahdol",
    phone: "919876543212",
    image: "https://images.unsplash.com/photo-1596742578443-7682af5251be?auto=format&fit=crop&q=80&w=800",
    rating: 4.2,
    reviews: 45
  },
  {
    id: "4",
    name: "Spicy Tandoor",
    category: "restaurants",
    description: "Authentic North Indian and Chinese cuisine. Best family restaurant in town.",
    address: "New Bus Stand Road, Shahdol",
    phone: "919876543213",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    reviews: 230,
    featured: true
  },
  {
    id: "5",
    name: "Sharma Classes",
    category: "education",
    description: "Coaching for MP Board, CBSE, JEE and NEET preparation. Experienced faculty.",
    address: "Housing Board Colony, Shahdol",
    phone: "919876543214",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    reviews: 90
  },
  {
    id: "6",
    name: "FixIt Home Services",
    category: "services",
    description: "Plumbers, Electricians, and Carpenters available on call. Quick and reliable service.",
    address: "Gandhi Chowk, Shahdol",
    phone: "919876543215",
    image: "https://images.unsplash.com/photo-1581578731117-104f8a3d3df9?auto=format&fit=crop&q=80&w=800",
    rating: 4.3,
    reviews: 30
  },
  {
    id: "7",
    name: "Dream Homes Real Estate",
    category: "real-estate",
    description: "Buy, sell, and rent properties in Shahdol. Best deals on plots and houses.",
    address: "Burhar Road, Shahdol",
    phone: "919876543216",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    reviews: 60
  }
];

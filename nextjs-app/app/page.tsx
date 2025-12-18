import Link from "next/link";
import { ArrowRight, CheckCircle, Search, TrendingUp, Users, Shield, Clock } from "lucide-react";
import { CATEGORIES, MOCK_GIGS } from "@/lib/constants";
import GigCard from "@/components/GigCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "GigStream - Find Perfect Freelance Services",
  description: "Discover talented freelancers and premium services for your business. From web development to graphic design, find the perfect professional for your project.",
};

export default function HomePage() {
  const popularSearches = ["Website Design", "WordPress", "Logo Design", "AI Services", "SEO", "Mobile App"];

  const features = [
    {
      icon: Users,
      title: "The best for every budget",
      description: "Find high-quality services at every price point. No hourly rates, just project-based pricing.",
    },
    {
      icon: Clock,
      title: "Quality work done quickly",
      description: "Find the right freelancer to begin working on your project within minutes.",
    },
    {
      icon: Shield,
      title: "Protected payments, every time",
      description: "Always know what you'll pay upfront. Your payment isn't released until you approve the work.",
    },
    {
      icon: CheckCircle,
      title: "24/7 support",
      description: "Questions? Our round-the-clock support team is available to help anytime, anywhere.",
    },
  ];

  const stats = [
    { label: "Active Freelancers", value: "50,000+" },
    { label: "Projects Completed", value: "1M+" },
    { label: "Countries", value: "150+" },
    { label: "Avg. Rating", value: "4.9/5" },
  ];

  return (
    <>
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-mesh text-white py-20 lg:py-32 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container-custom relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in">
                Find the perfect{" "}
                <span className="italic font-light relative">
                  freelance
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="12"
                    viewBox="0 0 300 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 10C50 2 100 2 150 6C200 10 250 10 298 6"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{" "}
                services for your business
              </h1>
              <p className="text-xl text-white/90 mb-10 leading-relaxed">
                Connect with talented professionals worldwide. Get your projects done faster, better, and more affordably.
              </p>

              {/* Search Bar */}
              <div className="flex items-center gap-3 bg-white rounded-2xl p-2 pl-6 mb-8 shadow-2xl max-w-2xl mx-auto">
                <Search className="text-neutral-400" size={24} />
                <input
                  type="text"
                  placeholder="Try 'logo design' or 'website development'"
                  className="flex-1 bg-transparent text-neutral-900 text-lg outline-none placeholder:text-neutral-400"
                />
                <button className="bg-gradient-primary px-8 py-3.5 rounded-xl font-semibold text-white hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  Search
                </button>
              </div>

              {/* Popular Searches */}
              <div className="flex flex-wrap justify-center gap-3 text-sm font-medium">
                <span className="text-white/80">Popular:</span>
                {popularSearches.map((search) => (
                  <Link
                    key={search}
                    href={`/marketplace?q=${encodeURIComponent(search)}`}
                    className="px-4 py-2 border-2 border-white/30 rounded-full hover:bg-white hover:text-primary-600 transition-all backdrop-blur-sm"
                  >
                    {search}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white border-b border-neutral-200">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">
                    {stat.value}
                  </div>
                  <div className="text-neutral-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-neutral-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">Popular Categories</h2>
              <p className="text-lg text-neutral-600">Explore services by category</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  href={`/marketplace?category=${category.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl p-6 text-center hover-lift border border-neutral-200 hover:border-primary-200 transition-all">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <p className="text-sm font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {category.gigCount.toLocaleString()} services
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all"
              >
                View All Categories <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-neutral-900 mb-8">
                  A whole world of freelance talent at your fingertips
                </h2>
                <div className="space-y-8">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <feature.icon className="text-primary-600" size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2 text-neutral-900">{feature.title}</h4>
                        <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://picsum.photos/seed/marketplace/800/800"
                    alt="Marketplace"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="text-green-500" size={24} />
                    <span className="font-bold text-neutral-900">98% Success Rate</span>
                  </div>
                  <p className="text-sm text-neutral-600">Projects completed on time and on budget</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Gigs Section */}
        <section className="py-20 bg-neutral-50">
          <div className="container-custom">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-bold text-neutral-900 mb-2">Featured Services</h2>
                <p className="text-lg text-neutral-600">Hand-picked services just for you</p>
              </div>
              <Link
                href="/marketplace"
                className="hidden md:inline-flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all"
              >
                View All <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {MOCK_GIGS.slice(0, 4).map((gig) => (
                <GigCard key={gig.id} gig={gig} featured />
              ))}
            </div>

            <div className="text-center mt-10 md:hidden">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all"
              >
                View All Services <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-primary text-white">
          <div className="container-custom text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of businesses and freelancers already using GigStream to grow their success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                Join as a Freelancer
              </Link>
              <Link
                href="/marketplace"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all"
              >
                Browse Services
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

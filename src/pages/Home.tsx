import { Link } from 'react-router-dom';
import { Pill, Search, ShieldCheck, Store, ArrowRight, Clock, MapPin, Package, TrendingDown } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Pill className="w-4 h-4" />
              <span className="text-sm font-medium">Find medicine, fast</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Find which pharmacy has your medicine — before you go.
            </h1>
            <p className="text-lg md:text-xl text-teal-50/90 mt-6 leading-relaxed max-w-2xl">
              Search by brand or generic name, compare prices across nearby pharmacies, and reserve your medicine so it's ready when you arrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-teal-700 rounded-xl font-semibold hover:bg-teal-50 transition-colors shadow-lg"
              >
                <Search className="w-5 h-5" /> Search Medicine
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-500/30 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-teal-500/40 border border-white/20 transition-colors"
              >
                For Pharmacies <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How MedFinder Works</h2>
          <p className="text-gray-500 mt-3 text-lg">Three simple steps from search to pickup</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Search,
              title: 'Search & Compare',
              desc: 'Enter your medicine name and filter by area. See which pharmacies have it, with prices sorted cheapest first.',
              color: 'bg-teal-50 text-teal-600',
            },
            {
              icon: Clock,
              title: 'Reserve Instantly',
              desc: 'Reserve your medicine from the pharmacy that fits you best. No more visiting multiple stores.',
              color: 'bg-blue-50 text-blue-600',
            },
            {
              icon: MapPin,
              title: 'Pick Up Ready',
              desc: 'The pharmacy confirms your reservation. Walk in, show your booking, and pick up your medicine.',
              color: 'bg-amber-50 text-amber-600',
            },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-5`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Built for Everyone</h2>
            <p className="text-gray-500 mt-3 text-lg">Whether you need medicine or sell it</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">For Patients</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2"><span className="text-teal-600 mt-1">•</span> Search by brand or generic name</li>
                <li className="flex items-start gap-2"><span className="text-teal-600 mt-1">•</span> Filter by area and compare prices</li>
                <li className="flex items-start gap-2"><span className="text-teal-600 mt-1">•</span> Reserve and track your bookings</li>
                <li className="flex items-start gap-2"><span className="text-teal-600 mt-1">•</span> Cancel pending reservations anytime</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">For Pharmacists</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2"><span className="text-teal-600 mt-1">•</span> Create and manage your pharmacy profile</li>
                <li className="flex items-start gap-2"><span className="text-teal-600 mt-1">•</span> Add, edit, and track medicine stock</li>
                <li className="flex items-start gap-2"><span className="text-teal-600 mt-1">•</span> Accept or reject reservation requests</li>
                <li className="flex items-start gap-2"><span className="text-teal-600 mt-1">•</span> Low-stock highlighting and expiry alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to find your medicine?</h2>
          <p className="text-teal-50/90 text-lg mb-8 max-w-xl mx-auto">
            Start searching now — no account needed to browse. Sign up to reserve.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-teal-700 rounded-xl font-semibold hover:bg-teal-50 transition-colors shadow-lg"
          >
            <Search className="w-5 h-5" /> Start Searching
          </Link>
        </div>
      </section>
    </div>
  );
}

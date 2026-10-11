import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Pill, LogOut, User, LayoutDashboard, Package, Store, ClipboardList, Users, ShieldCheck, Search } from 'lucide-react';

export default function Header() {
  const { profile, signOut } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-teal-50 text-teal-700'
        : 'text-gray-600 hover:text-teal-700 hover:bg-gray-50'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Pill className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">MedFinder</span>
          </Link>

          {profile ? (
            <nav className="hidden md:flex items-center gap-1">
              {profile.role === 'patient' && (
                <>
                  <NavLink to="/search" className={navLinkClass}>
                    <span className="flex items-center gap-1.5"><Search className="w-4 h-4" /> Search</span>
                  </NavLink>
                  <NavLink to="/my-reservations" className={navLinkClass}>
                    <span className="flex items-center gap-1.5"><ClipboardList className="w-4 h-4" /> My Reservations</span>
                  </NavLink>
                </>
              )}
              {profile.role === 'pharmacist' && (
                <>
                  <NavLink to="/pharmacy" className={navLinkClass}>
                    <span className="flex items-center gap-1.5"><Store className="w-4 h-4" /> Pharmacy</span>
                  </NavLink>
                  <NavLink to="/stock" className={navLinkClass}>
                    <span className="flex items-center gap-1.5"><Package className="w-4 h-4" /> Stock</span>
                  </NavLink>
                  <NavLink to="/incoming" className={navLinkClass}>
                    <span className="flex items-center gap-1.5"><ClipboardList className="w-4 h-4" /> Reservations</span>
                  </NavLink>
                </>
              )}
              {profile.role === 'admin' && (
                <>
                  <NavLink to="/admin/pharmacies" className={navLinkClass}>
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Pharmacies</span>
                  </NavLink>
                  <NavLink to="/admin/users" className={navLinkClass}>
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Users</span>
                  </NavLink>
                  <NavLink to="/admin/reports" className={navLinkClass}>
                    <span className="flex items-center gap-1.5"><LayoutDashboard className="w-4 h-4" /> Reports</span>
                  </NavLink>
                </>
              )}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/search" className={navLinkClass}>
                <span className="flex items-center gap-1.5"><Search className="w-4 h-4" /> Search</span>
              </NavLink>
            </nav>
          )}

          <div className="flex items-center gap-3">
            {profile ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-700" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{profile.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {profile && (
          <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
            {profile.role === 'patient' && (
              <>
                <NavLink to="/search" className={navLinkClass}>
                  <span className="flex items-center gap-1.5 whitespace-nowrap"><Search className="w-4 h-4" /> Search</span>
                </NavLink>
                <NavLink to="/my-reservations" className={navLinkClass}>
                  <span className="flex items-center gap-1.5 whitespace-nowrap"><ClipboardList className="w-4 h-4" /> Reservations</span>
                </NavLink>
              </>
            )}
            {profile.role === 'pharmacist' && (
              <>
                <NavLink to="/pharmacy" className={navLinkClass}>
                  <span className="flex items-center gap-1.5 whitespace-nowrap"><Store className="w-4 h-4" /> Pharmacy</span>
                </NavLink>
                <NavLink to="/stock" className={navLinkClass}>
                  <span className="flex items-center gap-1.5 whitespace-nowrap"><Package className="w-4 h-4" /> Stock</span>
                </NavLink>
                <NavLink to="/incoming" className={navLinkClass}>
                  <span className="flex items-center gap-1.5 whitespace-nowrap"><ClipboardList className="w-4 h-4" /> Reservations</span>
                </NavLink>
              </>
            )}
            {profile.role === 'admin' && (
              <>
                <NavLink to="/admin/pharmacies" className={navLinkClass}>
                  <span className="flex items-center gap-1.5 whitespace-nowrap"><ShieldCheck className="w-4 h-4" /> Pharmacies</span>
                </NavLink>
                <NavLink to="/admin/users" className={navLinkClass}>
                  <span className="flex items-center gap-1.5 whitespace-nowrap"><Users className="w-4 h-4" /> Users</span>
                </NavLink>
                <NavLink to="/admin/reports" className={navLinkClass}>
                  <span className="flex items-center gap-1.5 whitespace-nowrap"><LayoutDashboard className="w-4 h-4" /> Reports</span>
                </NavLink>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

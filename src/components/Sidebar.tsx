'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChefHat,
  Home,
  PlusCircle,
  Bookmark,
  ShoppingCart,
  Compass,
  Menu,
  X,
} from 'lucide-react';
import './Sidebar.css';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: <Home size={20} />, section: 'Main' },
  { href: '/add-recipe', label: 'Add Recipe', icon: <PlusCircle size={20} />, section: 'Main' },
  { href: '/bookmarks', label: 'My Recipes', icon: <Bookmark size={20} />, section: 'Library' },
  { href: '/grocery-list', label: 'Grocery List', icon: <ShoppingCart size={20} />, section: 'Library' },
  { href: '/explore', label: 'Explore', icon: <Compass size={20} />, section: 'Discover', badge: 'AI' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Group nav items by section
  const sections = navItems.reduce((acc, item) => {
    const section = item.section || 'Main';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <ChefHat size={22} />
          </div>
          <div className="sidebar-brand">
            <h2>RecipeAI</h2>
            <span>Smart Kitchen Assistant</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              <div className="sidebar-section-label">{section}</div>
              {items.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <span className="nav-item-icon">{item.icon}</span>
                    {item.label}
                    {item.badge && (
                      <span className="nav-item-badge">{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>RecipeAI v1.0 — Powered by Gemini</p>
        </div>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import {useRouter, usePathname} from "next/navigation";
import { LayoutDashboard, LogOut, Plus, User, ChevronDown, Sun, Moon, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import { useState } from "react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        router.push("/");
        setShowMenu(false);
    };

    const navLinks = [
        { href: "/dashboard",           icon: LayoutDashboard, label: "Dashboard"      },
        { href: "/dashboard/interview", icon: BookOpen,         label: "Interview Prep" },
    ];
    
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16"
            style={{background: "var(--navbar-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}
        >
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                
                {/* Logo and nav links */}
                <div>
                    <Link href='/dashboard' className="flex items-center gap-2">
                        <div className="glow-dot" />
                            <span className="font-dispaly text-xl" style={{color: "var(--text-0)"}}>
                                Resume<span className="shimmer-text">AI</span>
                            </span>
                    </Link>
                </div>
                <div className="hidden md:flex items-center gap-1">
                    {
                        navLinks.map(l => {
                            const active = pathname === l.href;
                            return (
                                <Link key={l.href} href={l.href}
                                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                                    style={{
                                        color:      active ? "var(--gold)"               : "var(--text-2)",
                                        background: active ? "rgba(201,168,76,0.08)"     : "transparent",
                                        border:     active ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
                                    }}>
                                    <l.icon size={13} /> {l.label}
                                </Link>
                            );
                        })
                    }
                </div>
                
                {/* Right */}
                <div className="flex items-center gap-2">
                    <button onClick={toggleTheme}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-2)", cursor: "pointer" }}
                        onMouseEnter={e => {e.currentTarget.style.borderColor = "var(--glod-dim)"; e.currentTarget.style.color = "var(--glod)"; }}
                        onMouseLeave={e => {e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
                    >
                        {isDark ? <Sun size={15} /> : <Moon size={15} />}
                    </button>

                    <Link href="/dashboard/resume/new" className="btn-primary gap-1.5 text-xs py-2! py-4!"
                    >
                        <Plus size={13} />
                        <span>New Resume</span>
                    </Link>

                    {/* User menu */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowMenu(!showMenu)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                            style={{ background: showMenu ? "rgba(201,168,76,0.08)" : "var(--input-bg)", border: "1px solid var(--border)", cursor: "pointer" }}
                        >
                            <div className="w-7 h-7 rounded-full flex items-center justify-center"
                                style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)" }}>
                                <User size={12} style={{ color: "var(--gold)" }} />
                            </div>
                            <span className="hidden md:block text-xs font-medium" style={{ color: "var(--text-1)" }}>
                                {user?.name?.split(" ")[0]}
                            </span>
                            <ChevronDown size={12} style={{ color: "var(--text-3)", transform: showMenu ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                        </button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
                                style={{ background: "var(--bg-2)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                                    <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                                        <p className="text-xs font-semibold truncate" style={{ color: "var(--text-0)" }}>{user?.name}</p>
                                        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-3)" }}>{user?.email}</p>
                                    </div>
                                    {/* Moblie Nav */}
                                    <div className="md:hidden" style={{ borderBottom: "1px solid var(--border)" }}>
                                        {navLinks.map(l => (
                                        <Link key={l.href} href={l.href} onClick={() => setShowMenu(false)}
                                            className="flex items-center gap-2.5 px-4 py-3 text-xs transition-colors"
                                            style={{ color: "var(--text-1)" }}>
                                            <l.icon size={13} /> {l.label}
                                        </Link>
                                        ))}
                                    </div>
                                    <button onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs text-left"
                                        style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.06)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                        <LogOut size={13} /> Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )

}
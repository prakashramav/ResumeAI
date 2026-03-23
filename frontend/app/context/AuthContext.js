"use client";

import {createContext, useContext, useState, useEffect} from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;


axios.defaults.withCredentials = true; // send cookies with every request

const AuthContext = createContext(null);

export function AuthProvider({ children}){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = async () => {
    try{
      const res = await axios.get(`${API_URL}/auth/me`);
      setUser(res.data.user);
    } catch{
      setUser(null);
    } finally{
      setLoading(false);
    }
  }

  const login = async (email, password) => {
    try{
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      setUser(res.data.user);
      return res.data.user;
    }catch(err){
      throw new Error(err.response?.data?.error || "Login failed");
    }
  }

  const register = async (name, email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
    setUser(res.data.user);
    return res.data.user;
  } catch (err) {
    console.error("Registration error:", err);
    throw new Error(err.response?.data?.error || "Registration failed");
  }
};

  const logout = async () => {
    try{
      await axios.post(`${API_URL}/auth/logout`);
    }catch{}
    setUser(null);
  }

  return(
    <AuthContext.Provider value={{user, loading, login, register, logout}}>
      {children}
    </AuthContext.Provider>
  )

}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};


"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import { useRouter } from "next/navigation";
import { db } from "../database/db";
import { AuthProvider } from "../context/AuthContext";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSidebarOpen } = useSidebar();
  const router = useRouter();
  const [theme, setTheme] = useState<string>("light");

  const handleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleCloseSession = async () => {
    // Establecer isAuthenticated a false en la base de datos
    await db.auth.put({ id: 1, isAuthenticated: false });

    // Redirigir al login
    router.push("/login");
  };

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await db.theme.get(1);
      if (savedTheme) {
        setTheme(savedTheme.value);
      } else {
        document.documentElement.classList.add("light");
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    const saveTheme = async () => {
      await db.theme.put({ id: 1, value: theme });
    };
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    saveTheme();
  }, [theme]);

  return (
    <AuthProvider>
      <div
        className={`max-h-[calc(100vh-80px)] bg-white dark:bg-black text-gray_b dark:text-white`}
      >
        <Navbar
          theme={theme}
          handleTheme={handleTheme}
          handleCloseSession={handleCloseSession}
        />
        <div>
          <Sidebar />
          <main
            className={`${
              isSidebarOpen ? "ml-64" : "ml-30"
            } flex-1 flex-grow min-h-[calc(100vh-80px)] bg-gray_xl dark:bg-gray_b transition-all duration-200 overflow-y-auto`}
          >
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}

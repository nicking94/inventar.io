"use client";
import { useEffect, useState } from "react";
import { db } from "../database/db";

const TrialNotification = () => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const checkAuthState = async () => {
    try {
      const auth = await db.auth.get(1);
      const authenticated = auth?.isAuthenticated ?? false;
      setIsAuthenticated(authenticated);

      if (authenticated && auth?.userId) {
        const user = await db.users.get(auth.userId);

        if (!user) {
          console.error("Usuario no encontrado");
          setUserId(null);
          setIsDemoUser(false);
          return;
        }

        setUserId(auth.userId);
        setIsDemoUser(user.username === "demo");
      } else {
        setUserId(null);
        setIsDemoUser(false);
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      setUserId(null);
      setIsDemoUser(false);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthState();

    const interval = setInterval(checkAuthState, 1000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!isAuthenticated || !userId || !isDemoUser) {
      setDaysLeft(null);
      return;
    }

    const calculateRemainingDays = async () => {
      try {
        let trialRecord = await db.trialPeriods.get(userId);
        const user = await db.users.get(userId);

        if (!user || user.username !== "demo") {
          setDaysLeft(null);
          return;
        }

        const now = new Date();

        if (!trialRecord) {
          const newRecord = {
            userId: userId,
            firstAccessDate: now,
          };
          await db.trialPeriods.put(newRecord);
          trialRecord = newRecord;
        }

        const startDate = new Date(trialRecord.firstAccessDate);
        if (isNaN(startDate.getTime())) {
          await db.trialPeriods.put({
            userId: userId,
            firstAccessDate: now,
          });
          setDaysLeft(7);
          return;
        }

        const diffTime = now.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const remainingDays = Math.max(0, 7 - diffDays);

        setDaysLeft(remainingDays);

        await db.appState.put({ id: 1, lastActiveDate: now });
      } catch (error) {
        console.error("Error calculando días:", error);
        setDaysLeft(null);
      }
    };

    calculateRemainingDays();
    const interval = setInterval(calculateRemainingDays, 3600000);

    return () => clearInterval(interval);
  }, [userId, isDemoUser, isAuthenticated]);

  if (daysLeft === null || !isDemoUser || !isAuthenticated) return null;

  return (
    <div
      className={`animate-pulse fixed top-0 left-1/2 transform -translate-x-1/2 px-4 2xl:px-6 py-1 rounded-md shadow-lg z-50 text-xs font-medium ${
        daysLeft > 4
          ? "bg-green-100 text-green-800"
          : daysLeft > 1
          ? "bg-yellow-100 text-yellow-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      {daysLeft > 0 ? (
        <span>
          Días restantes de prueba: <strong>{daysLeft}</strong>
        </span>
      ) : (
        <span>¡Periodo de prueba finalizado!</span>
      )}
    </div>
  );
};

export default TrialNotification;

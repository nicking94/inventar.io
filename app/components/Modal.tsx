"use client";
import { ModalProps } from "../lib/types/types";
import { useEffect } from "react";

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title = "Confirmación",
  children,
  bgColor = "bg-white dark:bg-gray_b",
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    window.scrollTo({ top: 0 });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm?.();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full bg-gray_m/40 dark:bg-gray_l/40 flex justify-center items-center ">
        <div
          className={`${bgColor} min-h-[10rem] w-[64rem] rounded-sm shadow-lg shadow-gray_b p-6 text-gray_b dark:text-white flex flex-col justify-between space-y-10`}
        >
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="overflow-y-auto max-h-[66vh]  space-y-10 pr-4 ">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;

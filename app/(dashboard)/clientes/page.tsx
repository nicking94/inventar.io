"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/database/db";
import { Customer } from "@/app/lib/types/types";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Modal from "@/app/components/Modal";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import Notification from "@/app/components/Notification";
import Pagination from "@/app/components/Pagination";
import { Plus, Users } from "lucide-react";
import SearchBar from "@/app/components/SearchBar";

const ClientesPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<
    Omit<Customer, "id" | "createdAt" | "updatedAt">
  >({
    name: "",
    phone: "",
  });
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "info"
  >("success");
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage, setCustomersPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      const allCustomers = await db.customers.toArray();
      setCustomers(allCustomers);
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setIsNotificationOpen(true);
    setTimeout(() => setIsNotificationOpen(false), 3000);
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim()) {
      showNotification("El nombre del cliente es requerido", "error");
      return;
    }

    try {
      const existingCustomer = customers.find(
        (c) => c.name.toLowerCase() === newCustomer.name.toLowerCase().trim()
      );

      if (existingCustomer) {
        showNotification("Ya existe un cliente con este nombre", "error");
        return;
      }

      const customerToAdd: Customer = {
        ...newCustomer,
        id: generateCustomerId(newCustomer.name),
        name: newCustomer.name.toUpperCase().trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.customers.add(customerToAdd);
      setCustomers([...customers, customerToAdd]);
      setNewCustomer({ name: "", phone: "" });
      setIsModalOpen(false);
      showNotification("Cliente agregado correctamente", "success");
    } catch (error) {
      console.error("Error al agregar cliente:", error);
      showNotification("Error al agregar cliente", "error");
    }
  };

  const generateCustomerId = (name: string): string => {
    const cleanName = name
      .toUpperCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "");
    const timestamp = Date.now().toString().slice(-5);
    return `${cleanName}-${timestamp}`;
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const customerSales = await db.sales
        .where("customerId")
        .equals(customerId)
        .toArray();

      if (customerSales.length > 0) {
        showNotification(
          "No se puede eliminar el cliente porque tiene fiados pendientes de pago",
          "error"
        );
        return;
      }

      await db.customers.delete(customerId);
      setCustomers(customers.filter((c) => c.id !== customerId));
      showNotification("Cliente eliminado correctamente", "success");
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      showNotification("Error al eliminar cliente", "error");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <ProtectedRoute>
      <div className="px-10 2xl:px-10 py-4 text-gray_l dark:text-white h-[calc(100vh-80px)]">
        <h1 className="text-xl 2xl:text-2xl font-semibold mb-2">Clientes</h1>

        <div className="flex justify-between mb-2">
          <div className="w-full max-w-md">
            <SearchBar onSearch={handleSearch} />
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            text="Nuevo Cliente"
            colorText="text-white"
            colorTextHover="text-white"
            onClick={() => setIsModalOpen(true)}
          />
        </div>

        <div className="flex flex-col justify-between h-[calc(100vh-200px)]">
          <table className="w-full text-center border-collapse">
            <thead className="text-white bg-blue_b">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Teléfono</th>
                <th className="px-4 py-2">Fecha de Registro</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white text-gray_b divide-y divide-gray_l">
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-4 py-2">{customer.name}</td>
                    <td className="px-4 py-2">{customer.phone || "-"}</td>
                    <td className="px-4 py-2">
                      {new Date(customer.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="flex justify-center px-4 py-2">
                      <Button
                        text="Eliminar"
                        colorText="text-white"
                        colorTextHover="text-white"
                        colorBg="bg-red-500"
                        colorBgHover="hover:bg-red-700"
                        onClick={() => handleDeleteCustomer(customer.id)}
                        disabled={customer.name === "CLIENTE OCASIONAL"}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="h-[50vh] 2xl:h-[calc(63vh-2px)]">
                  <td colSpan={4} className="py-4 text-center">
                    <div className="flex flex-col items-center justify-center text-gray_m dark:text-white">
                      <Users size={64} className="mb-4 text-gray_m" />
                      <p className="text-gray_m">
                        {searchQuery
                          ? "No se encontraron clientes"
                          : "No hay clientes registrados"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredCustomers.length > 0 && (
            <Pagination
              text="Clientes por página"
              text2="Total de clientes"
              currentPage={currentPage}
              totalItems={filteredCustomers.length}
              itemsPerPage={customersPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setCustomersPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Nuevo Cliente"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                label="Nombre del cliente"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                placeholder="Ingrese el nombre completo..."
              />
              <Input
                label="Teléfono (opcional)"
                value={newCustomer.phone || ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                placeholder="Ingrese el número de teléfono..."
              />
            </div>
            <div className="flex justify-end space-x-2 mt-10">
              <Button
                text="Guardar"
                colorText="text-white"
                colorTextHover="text-white"
                onClick={handleAddCustomer}
              />
              <Button
                text="Cancelar"
                colorText="text-gray_b dark:text-white"
                colorTextHover="hover:text-white hover:dark:text-white"
                colorBg="bg-gray_xl dark:bg-gray_m"
                colorBgHover="hover:bg-blue_m hover:dark:bg-gray_l"
                onClick={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </Modal>

        <Notification
          isOpen={isNotificationOpen}
          message={notificationMessage}
          type={notificationType}
        />
      </div>
    </ProtectedRoute>
  );
};

export default ClientesPage;

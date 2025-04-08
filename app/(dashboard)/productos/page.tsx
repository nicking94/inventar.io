"use client";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import Modal from "@/app/components/Modal";
import Notification from "@/app/components/Notification";
import { Product } from "@/app/lib/types/types";
import {
  Edit,
  Trash,
  PackageX,
  AlertTriangle,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/app/database/db";
import SearchBar from "@/app/components/SearchBar";
import { parseISO, format, differenceInDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import CustomDatePicker from "@/app/components/CustomDatePicker";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Pagination from "@/app/components/Pagination";
import Select from "react-select";
import BarcodeScanner from "@/app/components/BarcodeScanner";

type UnitOption = {
  value: Product["unit"];
  label: string;
};

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Product>({
    id: Date.now(),
    name: "",
    stock: 0,
    costPrice: 0,
    price: 0,
    expiration: "",
    quantity: 0,
    unit: "Unid.",
    barcode: "",
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "info">("success");
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(5);

  const unitOptions: UnitOption[] = [
    { value: "Unid.", label: "Unidad" },
    { value: "Kg", label: "Kg" },
    { value: "gr", label: "gr" },
    { value: "L", label: "L" },
    { value: "ml", label: "Ml" },
  ];

  const selectedUnit =
    unitOptions.find((opt) => opt.value === newProduct.unit) ?? null;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(value);
  };
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };
  const sortedProducts = useMemo(() => {
    const filtered = products.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchQuery) ||
        product.barcode?.includes(searchQuery)
    );
    return [...filtered].sort((a, b) => {
      const expirationA = a.expiration
        ? parseISO(a.expiration).getTime()
        : Infinity;
      const expirationB = b.expiration
        ? parseISO(b.expiration).getTime()
        : Infinity;
      const today = startOfDay(new Date()).getTime();
      const isExpiredA = expirationA < today;
      const isExpiredB = expirationB < today;
      const isExpiringSoonA =
        expirationA >= today && expirationA <= today + 7 * 24 * 60 * 60 * 1000;
      const isExpiringSoonB =
        expirationB >= today && expirationB <= today + 7 * 24 * 60 * 60 * 1000;

      if (isExpiredA !== isExpiredB)
        return Number(isExpiredB) - Number(isExpiredA);
      if (isExpiringSoonA !== isExpiringSoonB)
        return Number(isExpiringSoonB) - Number(isExpiringSoonA);

      return sortOrder === "asc"
        ? Number(a.stock) - Number(b.stock)
        : Number(b.stock) - Number(a.stock);
    });
  }, [products, searchQuery, sortOrder]);

  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase());
  };
  const hasChanges = (originalProduct: Product, updatedProduct: Product) => {
    return (
      originalProduct.name !== updatedProduct.name ||
      originalProduct.stock !== updatedProduct.stock ||
      originalProduct.costPrice !== updatedProduct.costPrice ||
      originalProduct.price !== updatedProduct.price ||
      originalProduct.expiration !== updatedProduct.expiration ||
      originalProduct.unit !== updatedProduct.unit
    );
  };
  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setType(type);
    setNotificationMessage(message);

    setIsNotificationOpen(true);
    setTimeout(() => {
      setIsNotificationOpen(false);
    }, 2000);
  };
  const handleAddProduct = () => {
    setIsOpenModal(true);
  };

  const handleConfirmAddProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.stock ||
      !newProduct.costPrice ||
      !newProduct.price ||
      !newProduct.unit
    ) {
      showNotification("Por favor, complete todos los campos", "error");
      return;
    }
    try {
      if (editingProduct) {
        await db.products.update(editingProduct.id, newProduct);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? newProduct : p))
        );
        showNotification(`Producto ${newProduct.name} actualizado`, "success");
        setEditingProduct(null);
      } else {
        // Agregar nuevo producto
        const id = await db.products.add(newProduct);
        setProducts([...products, { ...newProduct, id }]);
        showNotification(`Producto ${newProduct.name} agregado`, "success");
      }
    } catch (error) {
      showNotification("Error al guardar el producto", "error");
      console.error(error);
    }

    // Resetear valores
    setNewProduct({
      id: Date.now(),
      name: "",
      stock: 0,
      costPrice: 0,
      price: 0,
      expiration: "",
      quantity: 0,
      unit: "Unid.",
      barcode: "",
    });
    setIsOpenModal(false);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await db.products.delete(productToDelete.id);
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      showNotification(`Producto ${productToDelete.name} eliminado`, "success");
      setProductToDelete(null);
    }
    setIsConfirmModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setNewProduct({
      id: Date.now(),
      name: "",
      stock: 0,
      costPrice: 0,
      price: 0,
      expiration: "",
      quantity: 0,
      unit: "Unid.",
      barcode: "",
    });
    setEditingProduct(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setNewProduct({
      ...newProduct,
      [name]:
        name === "costPrice" || name === "price" || name === "stock"
          ? Number(value) || 0
          : value,
    });
  };
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setIsOpenModal(true);
  };
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsConfirmModalOpen(true);
  };
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\./g, "").replace(",", ".");
    const numericValue = parseFloat(value);
    setNewProduct({
      ...newProduct,
      price: isNaN(numericValue) ? 0 : numericValue,
    });
  };

  useEffect(() => {
    if (editingProduct) {
      setIsSaveDisabled(!hasChanges(editingProduct, newProduct));
    } else {
      setIsSaveDisabled(
        !newProduct.name ||
          !newProduct.stock ||
          !newProduct.costPrice ||
          !newProduct.price
      );
    }
  }, [newProduct, editingProduct]);
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const storedProducts = await db.products.toArray();
        if (isMounted) {
          setProducts(
            storedProducts
              .map((p) => ({ ...p, id: Number(p.id) }))
              .sort((a, b) => b.id - a.id)
          );
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        showNotification("Error al cargar los productos", "error"); // <-- Agrega esto
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(sortedProducts.length / productsPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }

  return (
    <ProtectedRoute>
      <div className="px-10 2xl:px-10 py-4 text-gray_l dark:text-white h-[calc(100vh-80px)]">
        <h1 className="text-xl 2xl:text-2xl font-semibold mb-2">Productos</h1>

        <div className="flex justify-between mb-2">
          <div className="w-full">
            <SearchBar onSearch={handleSearch} />
          </div>
          <div className="w-full flex justify-end gap-2 ">
            <Button
              text="Ver Precio [F5]"
              colorText="text-white"
              colorTextHover="text-white"
              onClick={handleAddProduct}
              hotkey="F5"
            />
            <Button
              text="Añadir Producto [F2]"
              colorText="text-white"
              colorTextHover="text-white"
              onClick={handleAddProduct}
              hotkey="F2"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between h-[calc(100vh-200px)] ">
          <table className="table-auto w-full text-center border-collapse overflow-y-auto shadow-sm shadow-gray_l">
            <thead className="text-white bg-blue_b">
              <tr>
                <th className="px-4 py-2 text-start ">Producto</th>
                <th
                  onClick={toggleSortOrder}
                  className=" cursor-pointer flex justify-center items-center px-4 py-2"
                >
                  Stock
                  <button className="ml-2 cursor-pointer">
                    {sortOrder === "asc" ? (
                      <SortAsc size={20} />
                    ) : (
                      <SortDesc size={20} />
                    )}
                  </button>
                </th>
                <th className="text-sm xl:text-lg px-4 py-2 ">
                  Precio de costo
                </th>
                <th className="text-sm xl:text-lg px-4 py-2 ">
                  Precio de venta
                </th>
                <th className="text-sm xl:text-lg px-4 py-2 ">Vencimiento</th>
                <th className="text-sm xl:text-lg px-4 py-2 xl:w-[12rem] ">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className=" divide-y divide-gray_l ">
              {sortedProducts.length > 0 ? (
                sortedProducts
                  .slice(indexOfFirstProduct, indexOfLastProduct)
                  .map((product, index) => {
                    const expirationDate = product.expiration
                      ? startOfDay(parseISO(product.expiration))
                      : null;
                    const today = startOfDay(new Date());

                    let daysUntilExpiration = null;
                    if (expirationDate) {
                      daysUntilExpiration = differenceInDays(
                        expirationDate,
                        today
                      );
                    }

                    const expiredToday = daysUntilExpiration === 0;
                    const isExpired =
                      daysUntilExpiration !== null && daysUntilExpiration < 0;
                    const isExpiringSoon =
                      daysUntilExpiration !== null &&
                      daysUntilExpiration > 0 &&
                      daysUntilExpiration <= 7;

                    return (
                      <tr
                        key={index}
                        className={` text-xs 2xl:text-[.9rem] border-b border-gray_l ${
                          isExpired
                            ? "border-l-2 border-l-red-500 text-gray_b bg-gray_xl"
                            : expiredToday
                            ? "border-l-2 border-l-red-500 text-white bg-red-500"
                            : isExpiringSoon
                            ? "border-l-2 border-l-red-500 text-gray_b bg-red-200 "
                            : "text-gray_b bg-white"
                        }`}
                      >
                        <td className="font-semibold px-2 text-start uppercase">
                          <div className="flex items-center gap-1 h-full">
                            {expiredToday && (
                              <AlertTriangle
                                className="text-yellow-300 dark:text-yellow-500"
                                size={18}
                              />
                            )}
                            {isExpiringSoon && (
                              <AlertTriangle
                                className="text-yellow-800"
                                size={18}
                              />
                            )}
                            {isExpired && (
                              <AlertTriangle
                                className="text-red-400 dark:text-yellow-500"
                                size={18}
                              />
                            )}
                            <span className="leading-tight">
                              {product.name}
                            </span>
                          </div>
                        </td>

                        <td
                          className={`${
                            !isNaN(Number(product.stock)) &&
                            Number(product.stock) > 0
                              ? ""
                              : "text-red-900"
                          } font-normal px-4 py-2 border border-gray_l`}
                        >
                          {!isNaN(Number(product.stock)) &&
                          Number(product.stock) > 0
                            ? `${product.stock} ${product.unit}`
                            : "Agotado"}
                        </td>
                        <td className="font-semibold px-4 py-2 border border-gray_l">
                          {formatPrice(product.costPrice)}
                        </td>
                        <td className="font-semibold px-4 py-2 border border-gray_l">
                          {formatPrice(product.price)}
                        </td>
                        <td className="font-semibold px-4 py-2 border border-gray_l">
                          {expirationDate
                            ? format(expirationDate, "dd/MM/yyyy", {
                                locale: es,
                              })
                            : "Sin fecha"}
                          {expirationDate && expiredToday && (
                            <span className="animate-pulse ml-2 text-white">
                              (Vence Hoy)
                            </span>
                          )}
                          {expirationDate && isExpired && (
                            <span className="ml-2 text-red-500">(Vencido)</span>
                          )}
                        </td>
                        <td className="px-4 py-2 flex justify-center gap-4">
                          <Button
                            icon={<Edit size={20} />}
                            colorText="text-gray_b"
                            colorTextHover="hover:text-white"
                            colorBg="bg-transparent"
                            px="px-1"
                            py="py-1"
                            minwidth="min-w-0"
                            onClick={() => handleEditProduct(product)}
                          />
                          <Button
                            icon={<Trash size={20} />}
                            colorText="text-gray_b"
                            colorTextHover="hover:text-white"
                            colorBg="bg-transparent"
                            colorBgHover="hover:bg-red-500"
                            px="px-1"
                            py="py-1"
                            minwidth="min-w-0"
                            onClick={() => handleDeleteProduct(product)}
                          />
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr className="h-[50vh] 2xl:h-[calc(63vh-2px)]">
                  <td colSpan={6} className="py-4 text-center">
                    <div className="flex flex-col items-center justify-center text-gray_m dark:text-white">
                      <PackageX size={64} className="mb-4" />
                      <p>Todavía no hay productos.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalItems={sortedProducts.length}
            itemsPerPage={productsPerPage}
            onPageChange={paginate}
            onItemsPerPageChange={(newItemsPerPage) => {
              setProductsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        </div>

        <Modal
          isOpen={isOpenModal}
          onConfirm={handleConfirmAddProduct}
          onClose={handleCloseModal}
          title={editingProduct ? "Editar Producto" : "Añadir Producto"}
          bgColor="bg-white dark:bg-gray_b"
        >
          <form className="flex flex-col gap-4">
            <div>
              <label className="block text-gray_m dark:text-white text-sm font-semibold mb-1">
                Código de Barras
              </label>
              <BarcodeScanner
                value={newProduct.barcode || ""}
                onChange={(value) =>
                  setNewProduct({ ...newProduct, barcode: value })
                }
                onScanComplete={(code) => {
                  const existingProduct = products.find(
                    (p) => p.barcode === code
                  );
                  if (existingProduct) {
                    setNewProduct({
                      ...existingProduct,
                      id: editingProduct ? existingProduct.id : Date.now(),
                    });
                    setEditingProduct(existingProduct);
                    showNotification(
                      "Producto encontrado, puedes editar los datos",
                      "success"
                    );
                  }
                }}
              />
            </div>
            <Input
              label="Nombre del producto"
              type="text"
              name="name"
              placeholder="Nombre del producto..."
              value={newProduct.name}
              onChange={handleInputChange}
            />
            <Input
              label="Stock"
              type="number"
              name="stock"
              placeholder="Stock..."
              value={newProduct.stock.toString()}
              onChange={handleInputChange}
            />
            <div>
              <label
                htmlFor="unit"
                className="block text-sm font-medium text-gray-700"
              >
                Unidad
              </label>
              <Select
                inputId="unit"
                options={unitOptions}
                value={selectedUnit}
                onChange={(selectedOption) => {
                  setNewProduct({
                    ...newProduct,
                    unit: selectedOption?.value as Product["unit"],
                  });
                }}
                className="mt-1"
                classNames={{
                  control: () =>
                    "text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
                }}
                isSearchable={false}
              />
            </div>
            <Input
              label="Precio de costo"
              type="number"
              name="costPrice"
              placeholder="Precio de costo..."
              value={newProduct.costPrice.toString()}
              onChange={handleInputChange}
            />

            <Input
              label="Precio de venta"
              type="number"
              name="price"
              placeholder="Precio de venta..."
              value={newProduct.price.toString()}
              onChange={handlePriceChange}
            />

            <CustomDatePicker
              value={newProduct.expiration}
              onChange={(newDate) => {
                setNewProduct({ ...newProduct, expiration: newDate });
              }}
              isClearable={true}
            />
          </form>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              text={editingProduct ? "Actualizar" : "Guardar"}
              colorText="text-white"
              colorTextHover="text-white"
              onClick={handleConfirmAddProduct}
              disabled={editingProduct ? isSaveDisabled : false}
            />
            <Button
              text="Cancelar"
              colorText="text-gray_b dark:text-white"
              colorTextHover="hover:text-white hover:dark:text-white"
              colorBg="bg-gray_xl dark:bg-gray_m"
              colorBgHover="hover:bg-blue_m hover:dark:bg-gray_l"
              onClick={handleCloseModal}
            />
          </div>
        </Modal>
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="Eliminar Producto"
          bgColor="bg-white dark:bg-gray_b"
        >
          <p>¿Desea eliminar el producto {productToDelete?.name}?</p>
          <div className="flex justify-end space-x-2">
            <Button
              text="Si"
              colorText="text-white"
              colorTextHover="text-white"
              onClick={handleConfirmDelete}
            />
            <Button
              text="No"
              colorText="text-gray_b dark:text-white"
              colorTextHover="hover:text-white hover:dark:text-white"
              colorBg="bg-gray_xl dark:bg-gray_m"
              colorBgHover="hover:bg-blue_m hover:dark:bg-gray_l"
              onClick={() => setIsConfirmModalOpen(false)}
            />
          </div>
        </Modal>

        <Notification
          isOpen={isNotificationOpen}
          message={notificationMessage}
          type={type}
        />
      </div>
    </ProtectedRoute>
  );
};

export default ProductsPage;

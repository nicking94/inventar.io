export type Theme = {
  id: number;
  value: string;
};

export type AuthData = {
  username: string;
  password: string;
};

export type ButtonProps = {
  onClick?: () => void;
  children?: React.ReactNode;
  px?: string;
  py?: string;
  width?: string;
  minwidth?: string;
  height?: string;
  text?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  type?: "button" | "submit" | "reset";
  colorText?: string;
  colorBg?: string;
  colorBgHover?: string;
  colorTextHover?: string;
  disabled?: boolean;
  hotkey?: string;
};

export type NavbarProps = {
  theme: string;
  handleTheme: () => void;
  handleCloseSession: () => void;
};
export type SidebarProps = {
  items?: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
};
export type MenuItemProps = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};
export type SidebarContextProps = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};
export type NotificationProps = {
  isOpen: boolean;
  message: string;
  type: "success" | "error" | "info";
};

export type ModalProps = {
  onConfirm?: () => void;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
  children?: React.ReactNode;
  bgColor?: string;
};

export type PersonalData = {
  name: string;
  age: string | number;
  phone: string;
  email: string;
};

export type InputProps = {
  label?: string;
  colorLabel?: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  border?: string;
  readOnly?: boolean;
  className?: string;
  accept?: string;
  ref?: React.Ref<HTMLInputElement>;
  autoFocus?: boolean;
  step?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
};
export type UserMenuProps = {
  theme: string;
  handleTheme: () => void;
  handleCloseSession: () => void;
};

export type ProductTableProps = {
  products: Product[];
  onAdd: (product: Product) => void;
  onDelete: (id: number) => void;
  onEdit: (product: Product) => void;
};

export type Product = {
  id: number;
  name: string;
  stock: number;
  costPrice: number;
  price: number;
  expiration?: string;
  quantity: number;
  unit: "Unid." | "gr" | "Kg" | "ml" | "L";
  barcode?: string;
  description?: string;
};

export type UnitOption = {
  value: Product["unit"];
  label: string;
};

export type ProductCardProps = {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
  };
  onDelete: (id: number) => void;
};
export type SearchBarProps = {
  onSearch: (query: string) => void;
};

export type Sale = {
  id: number;
  products: Product[];
  paymentMethod: "Efectivo" | "Transferencia" | "Tarjeta";
  total: number;
  date: string;
  barcode?: string;
  manualAmount?: number;
  credit?: boolean;
  paid?: boolean;
};

export type SaleItem = {
  product: Product;
  quantity: number;
};

export type PaginationProps = {
  text?: string;
  text2?: string;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
};
export type Option = {
  value: string;
  label: string;
};

export type ProductOption = {
  value: number;
  label: string;
  isDisabled?: boolean;
};

export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA";

export type MovementType = "INGRESO" | "EGRESO";

export type DailyCashMovement = {
  id: number;
  amount: number;
  description: string;
  type: "INGRESO" | "EGRESO";
  date: string;
  paymentMethod?: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA";
  productId?: number;
  productName?: string;
  costPrice?: number;
  sellPrice?: number;
  quantity?: number;
  profit?: number;
  unit?: "Unid." | "gr" | "Kg" | "ml" | "L";
  isCreditPayment?: boolean;
  originalSaleId?: number;
  supplierId?: number;
  supplierName?: string;
};
export type DailyCash = {
  id: number;
  date: string;
  initialAmount: number;
  movements: DailyCashMovement[];
  closed: boolean;
  closingAmount?: number;
  closingDate?: string;
  closingDifference?: number;
  cashIncome?: number;
  cashExpense?: number;
  otherIncome?: number;
  totalIncome?: number;
  totalCashIncome?: number;
  totalExpense?: number;
  totalProfit?: number;
  comments?: string;
  openedBy?: string;
  closedBy?: string;
};

export interface CreditSale extends Sale {
  credit: boolean;
  customerName: string;
  customerPhone?: string;
  customerId?: string;
  paid?: boolean;
  products: Product[];
}

export interface Payment {
  id: number;
  saleId: number;
  amount: number;
  date: string;
}
export type Customer = {
  id: string;
  name: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
};

export type SupplierContact = {
  name: string;
  phone?: string;
};

export type Supplier = {
  id: number;
  companyName: string;
  contacts: SupplierContact[];
  lastVisit?: string;
  nextVisit?: string;
  createdAt: string;
  updatedAt: string;
};
export type DatepickerProps = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  error?: string | null;
  isClearable?: boolean;
  label?: string;
  placeholderText?: string;
};

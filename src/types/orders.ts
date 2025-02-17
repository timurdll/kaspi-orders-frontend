export interface KaspiAddress {
  streetName: string;
  streetNumber: string;
  town: string;
  district: string | null;
  building: string | null;
  apartment: string | null;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export interface KaspiCity {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

export interface KaspiOriginAddress {
  id: string;
  displayName: string;
  address: KaspiAddress;
  city: KaspiCity;
}

export interface KaspiCustomer {
  id: string;
  name: string | null;
  cellPhone: string;
  firstName: string;
  lastName: string;
}

export interface KaspiDelivery {
  waybill: string;
  courierTransmissionDate: number;
  courierTransmissionPlanningDate: number;
  waybillNumber: string;
  express: boolean;
  returnedToWarehouse: boolean;
  firstMileCourier: string | null;
}

export interface KaspiOrderAttributes {
  code: string;
  totalPrice: number;
  paymentMode: string;
  originAddress: KaspiOriginAddress;
  plannedDeliveryDate: number;
  creationDate: number;
  deliveryCostForSeller: number;
  isKaspiDelivery: boolean;
  deliveryMode: string;
  deliveryAddress: KaspiAddress;
  signatureRequired: boolean;
  creditTerm?: number;
  kaspiDelivery: KaspiDelivery;
  preOrder: boolean;
  pickupPointId: string;
  state: string;
  assembled: boolean;
  approvedByBankDate: number;
  status: string;
  customer: KaspiCustomer;
  deliveryCost: number;
}

export interface KaspiOrder {
  type: string;
  id: string;
  attributes: KaspiOrderAttributes;
  relationships: {
    user: {
      links: {
        self: string;
        related: string;
      };
      data: {
        type: string;
        id: string;
      };
    };
    entries: {
      links: {
        self: string;
        related: string;
      };
    };
  };
  links: {
    self: string;
  };
  products: {
    name: string;
    quantity: number;
  }[];
}

export interface Store {
  id: string;
  storeName: string;
  orders?: KaspiOrder[];
  error?: string;
  meta?: {
    totalElements?: number;
    totalPages?: number;
  };
}

export interface OrdersResponse {
  stores: Store[];
  totalStats: {
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: Record<string, number>;
  };
}

export type OrderStatus =
  | "new"
  | "invoice"
  | "assembled"
  | "code_sent"
  | "completed"
  | "transferred";

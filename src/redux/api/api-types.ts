// api-types.ts
// Базовые типы для API

export interface OrdersResponse {
  stores: Store[];
  totalStats: {
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: Record<string, number>;
  };
}

export interface Order {
  id: string;
  // Добавьте здесь поля для заказа
}

export interface OrderComment {
  id: string;
  orderId: string;
  text: string;
  createdAt: string;
  userId: string;
  userName: string;
}

export interface Store {
  id: string;
  name: string;
  kaspiToken: string;
}

export interface CreateStoreDto {
  name: string;
  apiKey: string;
}

export interface UpdateOrderStatusResponse {
  waybill: string;
}

export interface UpdateOrderStatusDto {
  orderId: string;
  storeName: string;
}

// Интерфейсы для операций с кодом безопасности
export interface SendSecurityCodeDto {
  orderId: string;
  storeName: string;
  orderCode: string;
}

export interface CompleteOrderDto extends SendSecurityCodeDto {
  securityCode: string;
}

export interface CompleteOrderResponse {
  data: {
    type: string;
    id: string;
    attributes: {
      code: string;
      status: string;
    };
    relationships: {
      user: {
        links: {
          self: string;
          related: string;
        };
        data: null;
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
  };
  included: any[];
}

// Типы для административных функций
export interface AdminCreateUserDto {
  username: string;
  name: string;
  password: string;
  allowedStatuses: string[];
  allowedCities: string[];
}

export interface AdminUpdateCitiesDto {
  userId: string;
  allowedCities: string[];
}

export interface AdminUpdateStatusesDto {
  userId: string;
  allowedStatuses: string[];
}

export interface User {
  id: string;
  username: string;
  name: string;
  allowedStatuses: string[];
}

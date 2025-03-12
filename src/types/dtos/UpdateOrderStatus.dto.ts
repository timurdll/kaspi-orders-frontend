// src/types/orderStatus.dto.ts

export interface UpdateOrderStatusResponse {
  waybill: string;
}

export interface UpdateOrderStatusDto {
  orderId: string;
  code: string;
  storeName: string; // теперь передаём название магазина
}

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

export interface OrderComment {
  id: string;
  orderId: string;
  text: string;
  createdAt: number; // timestamp в миллисекундах
  updatedAt: number; // timestamp в миллисекундах
}

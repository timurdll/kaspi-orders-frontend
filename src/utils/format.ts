export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KZT",
    minimumFractionDigits: 0,
  }).format(price);
};

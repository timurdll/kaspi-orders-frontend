// // src/pages/SelfDeliveryOrderPage.tsx
// import React from "react";
// import { useParams } from "react-router-dom";
// import { OrderCard } from "./OrderCard";
// import { useGetOrderQuery } from "../redux/api";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// const SelfDeliveryOrderPage: React.FC = () => {
//   const { orderId } = useParams<{ orderId: string }>();
//   const {
//     data: order,
//     isLoading,
//     error,
//   } = useGetOrderQuery({
//     orderId: orderId || "",
//     storeName: "your-store-name", // Replace with your store name or make it dynamic
//   });

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <Card className="max-w-2xl mx-auto mt-8">
//         <CardContent className="p-6">
//           <div className="text-center text-red-600">
//             Произошла ошибка при загрузке заказа
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (!order || order.attributes.deliveryMode !== "SELF_PICKUP") {
//     return (
//       <Card className="max-w-2xl mx-auto mt-8">
//         <CardContent className="p-6">
//           <div className="text-center">
//             Заказ не найден или не является заказом на самовывоз
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <Card className="max-w-2xl mx-auto">
//         <CardHeader>
//           <CardTitle>Заказ на самовывоз #{order.attributes.code}</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <OrderCard
//             order={order}
//             storeName={order} // Replace with your store name
//             isReturnedOrder={false}
//           />
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default SelfDeliveryOrderPage;

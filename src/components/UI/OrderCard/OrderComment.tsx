// import React, { useState, useEffect } from "react";
// import { MessageSquare } from "lucide-react";
// import { KaspiOrder } from "../../../types/orders";
// import { CommentModal } from "./CommentModal";
// import {
//   useGetUnreadCommentsCountQuery,
//   useMarkCommentsAsReadMutation,
// } from "../../../redux/api/api";

// interface OrderCommentProps {
//   order: KaspiOrder;
// }

// export const OrderComment: React.FC<OrderCommentProps> = ({ order }) => {
//   const [showCommentModal, setShowCommentModal] = useState(false);
//   // Получаем количество непрочитанных комментариев
//   const { data: unreadCount } = useGetUnreadCommentsCountQuery(order.id);
//   console.log(unreadCount);

//   const [markAsRead] = useMarkCommentsAsReadMutation();

//   // Когда модалка открывается, вызываем мутацию для отметки комментариев как прочитанных
//   useEffect(() => {
//     if (showCommentModal && unreadCount && unreadCount > 0) {
//       markAsRead(order.id);
//     }
//   }, [showCommentModal, unreadCount, markAsRead, order.id]);

//   return (
//     <>
//       <button
//         onClick={() => setShowCommentModal(true)}
//         className="flex items-center text-gray-600 relative"
//       >
//         <MessageSquare size={16} />
//         <span className="ml-1">Добавить комментарий</span>
//         {unreadCount && unreadCount > 0 && (
//           <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
//             {unreadCount}
//           </span>
//         )}
//       </button>
//       {showCommentModal && (
//         <CommentModal
//           orderId={order.id}
//           onClose={() => setShowCommentModal(false)}
//         />
//       )}
//     </>
//   );
// };

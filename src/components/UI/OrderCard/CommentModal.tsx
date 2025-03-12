import React, { useState } from "react";
import {
  useAddCommentMutation,
  useGetCommentsQuery,
} from "../../../redux/api/api";

interface CommentModalProps {
  orderId: string;
  onClose: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  orderId,
  onClose,
}) => {
  const { data: commentsData, isLoading } = useGetCommentsQuery(orderId);
  const [addComment] = useAddCommentMutation();
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addComment({ orderId, text: newComment }).unwrap();
      setNewComment("");
    } catch (error) {
      console.error("Ошибка при добавлении комментария:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/30 backdrop-blur-sm transition-opacity animate-fadeIn">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full transform scale-95 transition-transform animate-zoomIn">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Комментарии к заказу
        </h2>

        <div className="max-h-64 overflow-y-auto mb-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300">
          {isLoading ? (
            <p className="text-gray-500 text-sm">Загрузка...</p>
          ) : commentsData?.comments && commentsData.comments.length > 0 ? (
            commentsData.comments.map((comment: any) => (
              <div key={comment.id} className="bg-gray-100 p-3 rounded-md">
                {/* Отображаем имя пользователя */}
                <p className="text-sm font-medium text-gray-800">
                  {comment.userName}
                </p>
                <p className="text-sm text-gray-700">{comment.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Комментариев нет</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Добавить комментарий..."
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md mt-2 hover:bg-blue-700 transition"
          >
            Отправить
          </button>
        </form>

        <button
          onClick={onClose}
          className="w-full bg-gray-300 text-gray-800 p-2 rounded-md hover:bg-gray-400 transition"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

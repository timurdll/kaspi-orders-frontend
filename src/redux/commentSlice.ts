// src/redux/commentSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  orderId: string;
  createdAt: number;
  updatedAt: number;
  isRead: boolean;
}

interface CommentState {
  comments: {
    [orderKaspiId: string]: Comment[];
  };
  unreadCounts: {
    [orderKaspiId: string]: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: {},
  unreadCounts: {},
  loading: false,
  error: null,
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    // Fetch comments
    fetchCommentsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCommentsSuccess(
      state,
      action: PayloadAction<{ orderKaspiId: string; comments: Comment[] }>
    ) {
      const { orderKaspiId, comments } = action.payload;
      state.comments[orderKaspiId] = comments;
      state.loading = false;

      // Подсчет непрочитанных комментариев
      state.unreadCounts[orderKaspiId] = comments.filter(
        (comment) => !comment.isRead
      ).length;
    },
    fetchCommentsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Add a new comment
    addComment(
      state,
      action: PayloadAction<{ orderKaspiId: string; comment: Comment }>
    ) {
      const { orderKaspiId, comment } = action.payload;

      if (!state.comments[orderKaspiId]) {
        state.comments[orderKaspiId] = [];
      }

      // Проверка, что комментарий с таким id еще не добавлен
      const existingComment = state.comments[orderKaspiId].find(
        (c) => c.id === comment.id
      );

      if (!existingComment) {
        state.comments[orderKaspiId].push(comment);

        // Обновление счетчика непрочитанных комментариев
        if (!comment.isRead) {
          state.unreadCounts[orderKaspiId] =
            (state.unreadCounts[orderKaspiId] || 0) + 1;
        }
      }
    },

    // Mark comments as read
    // markCommentsAsRead(state, action: PayloadAction<{ orderKaspiId: string }>) {
    //   const { orderKaspiId } = action.payload;

    //   if (state.comments[orderKaspiId]) {
    //     state.comments[orderKaspiId] = state.comments[orderKaspiId].map(
    //       (comment) => ({
    //         ...comment,
    //         isRead: true,
    //       })
    //     );

    //     // Обнуление счетчика непрочитанных комментариев
    //     state.unreadCounts[orderKaspiId] = 0;
    //   }
    // },

    // Set unread count directly
    setUnreadCount(
      state,
      action: PayloadAction<{ orderKaspiId: string; count: number }>
    ) {
      const { orderKaspiId, count } = action.payload;
      state.unreadCounts[orderKaspiId] = count;
    },
  },
});

export const {
  fetchCommentsStart,
  fetchCommentsSuccess,
  fetchCommentsFailure,
  addComment,
  //   markCommentsAsRead,
  setUnreadCount,
} = commentSlice.actions;

export default commentSlice.reducer;

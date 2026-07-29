import { CommentForm } from "./CommentForm";
import { CommentLists } from "./CommentLists";

type TComment = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhotoUrl: string;
  comment: string;
  buildId: string;
  createdAt: string;
  updatedAt: string;
};

type TCommentWithoutId = Omit<TComment, "id">;

export { CommentLists, CommentForm, type TComment, type TCommentWithoutId };

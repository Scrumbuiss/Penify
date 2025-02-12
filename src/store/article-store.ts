import { create } from "zustand";

type ArticleComments = {
  replayCommentHeight: number;
  setReplayCommentHeight: (height: number) => void;
};

export const useArticleCommentsStore = create<ArticleComments>()((set) => ({
  replayCommentHeight: 0,
  setReplayCommentHeight: (height: number) =>
    set(() => ({ replayCommentHeight: height })),
}));

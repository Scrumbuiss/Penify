"use client";

import { useLoginStore } from "@/store/login-store";
import { api } from "@/trpc/react";
import { cn } from "@/utils";
import {
  Avatar,
  AvatarIcon,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from "@nextui-org/react";
import { type Session } from "next-auth";
import { useState, type ChangeEvent, type LegacyRef, Fragment } from "react";
import { useForm } from "react-hook-form";
import { useArticleCommentsStore } from "@/store/article-store";
import { useClickOutside } from "@mantine/hooks";
import { useLocale, useTranslations } from "next-intl";
import { type commentsType } from "@/server/db/schema";

type Inputs = {
  textarea: string;
};

type ArticleCommentsProps = {
  id: string;
  articleId: string;
  content: string;
  isHidden: boolean;
  createdBy: { name: string | null; image: string | null };
  createdAt: Date;
  replies: commentsType[];
  session: Session | null;
};

const ArticleComments = ({
  articleId,
  session,
}: {
  articleId: string;
  session: Session | null;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    mode: "onChange",
  });
  const t = useTranslations("BlogPost");

  const utils = api.useUtils();

  const onLoginPopupChange = useLoginStore((state) => state.onChange);

  const { data: comments } = api.articles.getArticleComments.useQuery({
    articleId: articleId,
  });

  const { mutate: addComment } =
    api.articles.createArticleComment.useMutation();

  const onSubmit = (data: Inputs) => {
    try {
      addComment(
        {
          articleId: articleId,
          content: data.textarea,
        },
        {
          async onSuccess() {
            await utils.articles.getArticleComments.invalidate();
            reset();
          },
        },
      );
    } catch (error) {
      throw new Error("Error adding comment");
    }
  };

  return (
    <section className="px-0">
      <div className="wrapper">
        <div>
          <h2 className="h2 mb-4">{t("comments")}</h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={cn("relative mb-4", {
              "after:absolute after:inset-0 after:bg-black after:opacity-80":
                !session,
            })}
          >
            <div
              className={cn(
                "flex h-auto min-h-[54px] gap-2 rounded-md border border-grey-dark p-2",
                {
                  "border-red-600": !!errors.textarea,
                },
              )}
            >
              {!session && (
                <Button
                  onClick={onLoginPopupChange}
                  variant="flat"
                  color="warning"
                  className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform"
                >
                  {t("login-to-comment")}
                </Button>
              )}
              <Textarea
                {...register("textarea", {
                  onChange: (e: ChangeEvent<HTMLInputElement>) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  },
                  required: {
                    value: true,
                    message: t("require-comment"),
                  },
                  maxLength: {
                    value: 1000,
                    message: t("comment-too-long"),
                  },
                })}
                isDisabled={!session}
                classNames={{
                  input:
                    "min-h-[54px] w-full resize-none overflow-hidden bg-black !text-grey-soft",
                  inputWrapper:
                    "bg-black data-[hover=true]:bg-black data-[focus=true]:!bg-black",
                }}
                placeholder={t("write-comment")}
              />
              <Button type="submit" className="self-end bg-orange text-white">
                {t("send")}
              </Button>
            </div>
            {errors.textarea && (
              <p className=" mt-2 text-sm text-red-600">
                {errors.textarea.message}
              </p>
            )}
          </form>
          {comments && comments.length > 0 ? (
            <>
              {comments?.map((props, index) => (
                <Fragment key={`${props.articleId}-${index}`}>
                  {!props.commentId && (
                    <ArticleComment
                      key={props.commentId}
                      {...props}
                      depth={1}
                      articleId={articleId}
                      session={session}
                    />
                  )}
                </Fragment>
              ))}
            </>
          ) : (
            <div className="rounded-[24px] bg-black-dark p-4">
              <h3 className="h3 text-center text-white">
                {t("first-comment-info")}
              </h3>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ArticleComments;

const ArticleComment = ({
  id,
  content,
  createdBy,
  createdAt,
  replies,
  session,
  depth,
  isHidden,
  articleId,
}: ArticleCommentsProps & {
  depth: number;
}) => {
  const t = useTranslations("BlogPost");

  const locale = useLocale();

  const [openReplayTextarea, setOpenReplayTextarea] = useState<string | null>(
    null,
  );

  if (isHidden) {
    return null;
  }

  return (
    <div
      key={id}
      className={cn(
        "flex flex-col rounded-[24px] bg-black-dark p-4 text-sm text-white [&:not(:last-child)]:mb-4",
        {
          relative: openReplayTextarea === id,
          "bg-black": depth % 2 === 0,
        },
      )}
    >
      <div className="mb-2 flex justify-between">
        <div className="flex items-center gap-2">
          <Avatar
            size="sm"
            icon={createdBy?.image ? undefined : <AvatarIcon />}
            color="default"
            src={createdBy?.image ?? ""}
          />
          <h4 className="h4">{createdBy?.name}</h4>
        </div>
        <p className="text-grey-dark">
          {new Date(createdAt).toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <p
        className={cn("", {
          "pb-4": !session,
        })}
      >
        {content}
      </p>
      {session && (
        <div className="-mx-4 flex justify-between">
          <HideArticleCommentButton
            createdBy={createdBy}
            session={session}
            id={id}
          />
          {depth < 6 && (
            <Button
              isDisabled={!session}
              onClick={() => {
                if (openReplayTextarea === id) {
                  setOpenReplayTextarea(null);
                } else {
                  setOpenReplayTextarea(id);
                }
              }}
              variant="flat"
              className="ml-auto h-10 w-[unset] min-w-0 bg-transparent p-2 px-4 leading-none text-white"
            >
              {t("reply")}
            </Button>
          )}
        </div>
      )}
      {openReplayTextarea === id && (
        <ArticleCommentsReplay
          articleId={articleId}
          setOpenReplayTextarea={setOpenReplayTextarea}
          replayCommentId={id}
        />
      )}
      {depth < 6 && (
        <>
          {replies?.map((props) => (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            <ArticleComment
              key={`${props.id}-${depth}`}
              {...props}
              depth={depth + 1}
              session={session}
              articleId={articleId}
            />
          ))}
        </>
      )}
    </div>
  );
};

const HideArticleCommentButton = ({
  id,
  session,
  createdBy,
}: {
  id: string;
  session: Session;
  createdBy: { name: string | null };
}) => {
  const { data: userRole } = api.dashboard.getUserRole.useQuery();

  return (
    <>
      {userRole?.role === "ADMIN" ? (
        <EditPopover id={id} session={session} />
      ) : (
        <>
          {session.user?.name === createdBy.name && (
            <EditPopover id={id} session={session} />
          )}
        </>
      )}
    </>
  );
};

const EditPopover = ({ id, session }: { id: string; session: Session }) => {
  const t = useTranslations("BlogPost");

  const utils = api.useUtils();

  const { mutate: hideComment } = api.articles.hideComment.useMutation();

  const onCommentHide = (commentId: string) => {
    try {
      hideComment(
        {
          id: commentId,
        },
        {
          async onSuccess() {
            await utils.articles.getArticleComments.invalidate();
          },
        },
      );
    } catch (error) {
      throw new Error("Error deleting comment");
    }
  };

  return (
    <Popover placement="bottom" showArrow offset={10}>
      <PopoverTrigger>
        <Button
          color="primary"
          className=" h-10 w-[unset] min-w-0 bg-transparent p-2 px-4 leading-none text-white"
        >
          {t("edit")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] bg-black-secondary">
        <div className="w-full px-1 py-2">
          <p className="text-small font-bold text-foreground text-white">
            {t("edit-options")}
          </p>
          <ul className="mt-2">
            <li>
              <Button
                onClick={() => onCommentHide(id)}
                isDisabled={!session}
                variant="flat"
                className="h-10 w-full min-w-0 justify-start bg-transparent p-2 px-4 text-left leading-none text-white transition-all duration-250 hover:bg-red-200 hover:text-red-400"
              >
                <span>{t("delete")}</span>
              </Button>
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ArticleCommentsReplay = ({
  articleId,
  replayCommentId,
  setOpenReplayTextarea,
}: {
  articleId: string;
  replayCommentId: string;
  setOpenReplayTextarea: (value: string | null) => void;
}) => {
  const t = useTranslations("BlogPost");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    mode: "onChange",
  });

  const utils = api.useUtils();

  const { mutate: addReplayComment } =
    api.articles.createReplayComment.useMutation();

  const setCommentHeight = useArticleCommentsStore(
    (state) => state.setReplayCommentHeight,
  );

  const onSubmit = (data: Inputs) => {
    try {
      addReplayComment(
        {
          articleId: articleId,
          content: data.textarea,
          commentId: replayCommentId,
        },
        {
          async onSuccess() {
            await utils.articles.getArticleComments.invalidate();
            setOpenReplayTextarea(null);
            reset();
          },
        },
      );
    } catch (error) {
      throw new Error("Error adding comment");
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const ref = useClickOutside(() => setOpenReplayTextarea(null));

  return (
    <form
      ref={ref as LegacyRef<HTMLFormElement> | undefined}
      onSubmit={handleSubmit(onSubmit)}
      className="mb-2"
    >
      <div
        className={cn(
          "flex h-auto min-h-[54px] gap-2 rounded-md border border-grey-dark p-2",
          {
            "border-red-600": !!errors.textarea,
          },
        )}
      >
        <Textarea
          {...register("textarea", {
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
              setCommentHeight(e.target.scrollHeight);
            },
            required: {
              value: true,
              message: t("require-comment"),
            },
            maxLength: {
              value: 1000,
              message: t("comment-too-long"),
            },
          })}
          classNames={{
            input:
              "min-h-[54px] w-full resize-none overflow-hidden bg-black !text-grey-soft",
            inputWrapper:
              "bg-black data-[hover=true]:bg-black data-[focus=true]:!bg-black",
          }}
          placeholder={t("write-reply-comment")}
        />
        <Button type="submit" className="self-end bg-orange text-white">
          Send
        </Button>
      </div>
      {errors.textarea && (
        <p className=" mt-2 text-sm text-red-600">{errors.textarea.message}</p>
      )}
    </form>
  );
};

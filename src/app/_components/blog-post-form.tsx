"use client";

import { cn } from "@/utils";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Image,
  CircularProgress,
  Textarea,
  Switch,
  Tabs,
  Tab,
  Avatar,
  Link,
} from "@nextui-org/react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FileUploadIcon } from "./svg";
import { useEffect, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { useUploadThing } from "@/utils/upload-thing";
import { type Value } from "@udecode/plate-common";
import { PlateEditorEditable } from "./plate-editor";
import CreatableSelect from "react-select/creatable";
import toast from "react-hot-toast";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import NextImage from "next/image";
import { useSearchParams } from "next/navigation";
import { resetEditor } from "@udecode/plate-common";
import { Transforms } from "slate";
import { languagesValuesExtended } from "@/server/db/schema";
import BlogPostFormDeletePopup from "./blog-post-form-delete-popup";
import { deleteUploadthingImage } from "../[locale]/uploadthing-action";
import InfoBox from "./info-box";

const loadingStates = {
  create: "Create",
  update: "Update",
} as const;

type ObjectValues<T> = T[keyof T];

export type LoadingStates = ObjectValues<typeof loadingStates>;

type Inputs = {
  image: File;
  title: string;
  category: string;
  description: string;
  subTags?: string[];
};

export const ArticleTopics = [
  "programming",
  "business",
  "finance-accounting",
  "IT",
  "health",
  "ergonomics",
  "personal-development",
  "design",
  "marketing",
  "lifestyle",
  "photography",
  "fitness",
  "music",
  "teaching-and-studying",
];

const BlogPostForm = ({
  isAdmin,
  articleId,
  searchParams,
  languageEnumFromPrisma,
}: {
  isAdmin: boolean;
  articleId?: string;
  searchParams?: Record<string, string | [] | undefined>;
  languageEnumFromPrisma?: string;
}) => {
  const t = useTranslations("BlogPost");
  const tCommon = useTranslations("Common");

  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  const { data: currentUserBlogPost } =
    api.dashboard.currentUserArticle.useQuery({
      articleId: articleId,
      language: languageEnumFromPrisma as "PL" | "EN" | "DE",
    });
  const { data: userOriginalArticle } =
    api.dashboard.currentUserOriginalArticle.useQuery({
      articleId: articleId,
    });

  const router = useRouter();
  const minArticleLength = 1000;
  const maxArticleLength = 20000;

  const utils = api.useUtils();

  const [customTags, setCustomTags] = useState<unknown>(
    currentUserBlogPost
      ? [
          ...currentUserBlogPost?.ArticleTags?.map((tag) => {
            return { label: tag.tag, value: tag.tag };
          }),
        ]
      : [],
  );

  const [editorValue, setEditorValue] = useState<Value | undefined>(
    currentUserBlogPost?.content
      ? (JSON.parse(currentUserBlogPost?.content) as Value)
      : undefined,
  );
  const [image, setTImage] = useState<File | string | undefined>(
    currentUserBlogPost?.image,
  );

  const [loadingState, setLoadingState] = useState<LoadingStates | null>(null);
  const [languageValue, setLanguageValue] = useState<string>("EN");
  const editor = useRef(null);

  const { mutate: createArticle } = api.dashboard.createArticle.useMutation();
  const { mutate: updateArticle } =
    api.dashboard.updateCurrentUserArticle.useMutation();
  const { mutate: createTranslatedArticle } =
    api.dashboard.createTranslatedArticle.useMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Inputs>();

  useEffect(() => {
    setValue("title", currentUserBlogPost?.title ?? "");
    setValue(
      "category",
      currentUserBlogPost
        ? currentUserBlogPost.category
        : userOriginalArticle
          ? userOriginalArticle.category
          : "",
    );
    setCustomTags(
      currentUserBlogPost
        ? [
            ...currentUserBlogPost?.ArticleTags?.map((tag) => {
              return { label: tag.tag, value: tag.tag };
            }),
          ]
        : [],
    );
    setValue("description", currentUserBlogPost?.description ?? "");
    setEditorValue(
      currentUserBlogPost?.content
        ? (JSON.parse(currentUserBlogPost?.content) as Value)
        : undefined,
    );
    if (editor !== null) {
      if (currentUserBlogPost?.content) {
        resetEditor(editor.current!);
        Transforms.insertNodes(
          editor.current!,
          JSON.parse(currentUserBlogPost?.content) as Value,
        );
        Transforms.removeNodes(editor.current!, { at: [0] });
      } else {
        resetEditor(editor.current!);
        Transforms.insertNodes(editor.current!, []);
      }
    }
  }, [currentUserBlogPost, setEditorValue]);

  const { startUpload } = useUploadThing("imageUploader", {
    onUploadError: () => {
      setLoadingState(null);
    },
  });

  const onSubmitUpdate: SubmitHandler<Inputs> = async (data) => {
    try {
      setIsLoadingUpdate(true);

      const { title, category, description } = data;
      let uploadedImage: { url: string }[] | undefined = undefined;
      const currentUserImage = userOriginalArticle?.image;

      if (
        !editorValue ||
        getCharactersLengthFromEditorValue(editorValue) < minArticleLength ||
        getCharactersLengthFromEditorValue(editorValue) > maxArticleLength ||
        !searchParams
      )
        return;

      const readTime = getReadingTime(JSON.stringify(editorValue));

      let extractedTags: string[] | null = null;

      if (customTags) {
        extractedTags = (customTags as { label: string; value: string }[]).map(
          (tag) => tag.value,
        );
      }

      if (currentUserBlogPost?.image !== image && image !== undefined) {
        setLoadingState(loadingStates.update);
        uploadedImage = await startUpload([image as File]);
      }

      if (!currentUserBlogPost && searchParams.language && articleId) {
        createTranslatedArticle(
          {
            articleId: articleId,
            image: uploadedImage?.[0]?.url ?? userOriginalArticle!.image,
            title,
            content: JSON.stringify(editorValue),
            description,
            category,
            readingTime: readTime.toString(),
            tags: extractedTags,
            language: (searchParams.language as string).toUpperCase() as
              | "PL"
              | "EN"
              | "DE",
          },
          {
            async onError(error) {
              if (error.data?.stack?.includes("Article.Article_title_unique")) {
                toast.error(t("title-exists"), {
                  position: "bottom-center",
                  className: "text-center",
                });
                return;
              }

              toast.error(
                "Something went wrong. Please try again later or contact us",
                {
                  position: "bottom-center",
                  className: "text-center",
                },
              );
            },
            async onSuccess() {
              if (image !== undefined && currentUserImage) {
                await deleteUploadthingImage(currentUserImage);
              }

              await utils.articles.getAllArticles.invalidate();
              await utils.articles.getFeaturedArticle.invalidate();
              await utils.dashboard.getUserOnReviewArticles.invalidate();
              await utils.dashboard.currentUserArticle.invalidate();

              setLoadingState(null);
              setIsLoadingUpdate(false);

              toast.success(
                "Your blog post has been successfully created in new Language!",
                {
                  position: "bottom-center",
                  className: "text-center",
                },
              );
            },
          },
        );
        return;
      }

      updateArticle(
        {
          articleId: currentUserBlogPost?.id ?? "",
          originalArticleId: userOriginalArticle?.id ?? "",
          image: uploadedImage?.[0]?.url ?? userOriginalArticle!.image,
          title,
          content: JSON.stringify(editorValue),
          description,
          category,
          readingTime: readTime.toString(),
          tags: extractedTags,
          language: searchParams.language
            ? ((searchParams.language as string).toUpperCase() as
                | "PL"
                | "EN"
                | "DE")
            : undefined,
        },
        {
          async onError(error) {
            if (error.data?.stack?.includes("Article.Article_title_unique")) {
              toast.error(t("title-exists"), {
                position: "bottom-center",
                className: "text-center",
              });
              return;
            }

            toast.error(
              "Something went wrong. Please try again later or contact us",
              {
                position: "bottom-center",
                className: "text-center",
              },
            );
          },
          async onSuccess() {
            if (image !== undefined && currentUserImage) {
              await deleteUploadthingImage(currentUserImage);
            }

            await utils.articles.getAllArticles.invalidate();
            await utils.articles.getFeaturedArticle.invalidate();
            await utils.dashboard.getUserOnReviewArticles.invalidate();

            await utils.dashboard.currentUserArticle.invalidate({
              articleId: articleId,
            });
            await utils.dashboard.currentUserOriginalArticle.invalidate({
              articleId: articleId,
            });

            setLoadingState(null);
            setIsLoadingUpdate(false);
            router.refresh();

            toast.success("Your blog post has been successfully updated!", {
              position: "bottom-center",
              className: "text-center",
            });
          },
        },
      );
    } catch (error) {
      throw new Error(error as string);
    }
  };

  const onSubmitCreate: SubmitHandler<Inputs> = async (data) => {
    try {
      const { title, category, description } = data;

      if (
        !image ||
        !editorValue ||
        getCharactersLengthFromEditorValue(editorValue) < minArticleLength ||
        getCharactersLengthFromEditorValue(editorValue) > maxArticleLength
      )
        return;

      setLoadingState(loadingStates.create);
      const readTime = getReadingTime(JSON.stringify(editorValue));

      const uploadedImage = await startUpload([image as File]);

      let extractedTags: string[] | null = null;

      if (customTags) {
        extractedTags = (customTags as { label: string; value: string }[]).map(
          (tag) => tag.value,
        );
      }

      createArticle(
        {
          image: uploadedImage?.[0]?.url ?? "",
          title,
          content: JSON.stringify(editorValue),
          description,
          category,
          langageExtended: languageValue as "PL" | "EN" | "DE",
          readingTime: readTime.toString(),
          tags: extractedTags,
        },
        {
          async onError(error) {
            if (error.data?.stack?.includes("Article.Article_title_unique")) {
              toast.error(t("title-exists"), {
                position: "bottom-center",
                className: "text-center",
              });
              return;
            }

            toast.error(
              "Something went wrong. Please try again later or contact us",
              {
                position: "bottom-center",
                className: "text-center",
              },
            );
          },
          async onSuccess() {
            await utils.dashboard.getUserOnReviewArticles.invalidate();
            await utils.dashboard.currentUserOriginalArticle.invalidate();

            router.push("/dashboard");
            setLoadingState(null);

            reset();
            router.refresh();

            toast.success("Your blog post has been successfully created!", {
              position: "bottom-center",
              className: "text-center",
            });
          },
        },
      );
    } catch (error) {
      throw new Error(error as string);
    }
  };

  const getCharactersLengthFromEditorValue = (value: Value | undefined) => {
    let charactersLength = 0;

    if (!value) return charactersLength;

    value.forEach((node) => {
      if (node.type === "p" && node.children[0]) {
        if (node.children[0].text)
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          charactersLength += node.children[0].text.length;
      }
    });

    return charactersLength;
  };

  const inputWrapperStyles =
    "border-transparent !bg-white data-[hover=true]:border-black group-data-[focus=true]:border-black group-data-[data-focus-within=true]:border-black";

  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const noOfWords = text.split(/\s/g).length;
    const minutes = noOfWords / wordsPerMinute;
    const readTime = Math.ceil(minutes);

    return readTime;
  };

  const disabledCheck = currentUserBlogPost?.isAccepted && !isAdmin;

  console.log(disabledCheck);

  return (
    <section>
      <div className="wrapper">
        <div>
          {loadingState && (
            <HandleLoadingSkeleton loadingState={loadingState} />
          )}
          {isAdmin && userOriginalArticle && (
            <OptionsPanel
              imageUrl={userOriginalArticle.image}
              articleId={userOriginalArticle.id}
              acceptedState={userOriginalArticle.isAccepted}
            />
          )}
          {disabledCheck && (
            <InfoBox text={t("you-cannot-edit-accepted-article")} />
          )}
          <h2 className="h2 mb-4 text-black">
            {articleId ? "Edit your blog post" : "Create blog post"}
          </h2>
          {articleId && userOriginalArticle?.isAccepted && (
            <LanguageTabs
              articleId={articleId}
              articleLanguage={
                currentUserBlogPost?.languageExtended
                  ? currentUserBlogPost?.languageExtended
                  : userOriginalArticle?.languageExtended
              }
            />
          )}
          <form
            onSubmit={handleSubmit(
              currentUserBlogPost
                ? onSubmitUpdate
                : articleId
                  ? onSubmitUpdate
                  : onSubmitCreate,
            )}
            className="flex flex-col"
            noValidate
          >
            <div className="flex flex-col gap-4">
              <div>
                {!articleId && (
                  <Select
                    label={t("select-language")}
                    isRequired
                    disallowEmptySelection
                    isDisabled={disabledCheck}
                    defaultSelectedKeys={["EN"]}
                    onChange={(e) => setLanguageValue(e.target.value)}
                    classNames={{
                      trigger:
                        "!bg-white hover:border-black border-transparent border-2 transition-all duration-250",
                      label: "!text-black",
                      value: "!text-black",
                    }}
                  >
                    {Object.values(languagesValuesExtended).map((language) => (
                      <SelectItem
                        key={language}
                        value={language}
                        className="!text-black"
                      >
                        {language}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              </div>
              <div className="flex gap-4">
                <Select
                  label={t("select-category")}
                  isRequired
                  isDisabled={disabledCheck}
                  isInvalid={!!errors.category}
                  disallowEmptySelection
                  selectedKeys={[watch("category")]}
                  classNames={{
                    trigger:
                      "!bg-white hover:border-black border-transparent border-2 transition-all duration-250",
                    label: "!text-black",
                    value: "!text-black",
                  }}
                  errorMessage={
                    !!errors.category && t("require-select-category")
                  }
                  {...register("category", { required: true })}
                >
                  {ArticleTopics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {tCommon(topic)}
                    </SelectItem>
                  ))}
                </Select>
                <CreatableSelect
                  isClearable
                  isMulti
                  placeholder={t("create-own-tags")}
                  isDisabled={disabledCheck}
                  name="tags"
                  value={customTags}
                  onChange={setCustomTags}
                  className="multi-select"
                  classNamePrefix="select"
                />
              </div>
              <div>
                <Button
                  className={cn(
                    "group relative w-full border-2 border-dotted border-grey-soft bg-transparent py-32 text-center transition-all duration-250 hover:border-black",
                    {
                      "border-danger data-[hover=true]:border-danger":
                        errors.image,
                      "hover:bg-black [&::before]:absolute [&::before]:inset-0 [&::before]:z-10 [&::before]:bg-transparent":
                        image,
                    },
                  )}
                >
                  {(currentUserBlogPost?.image ??
                    image ??
                    userOriginalArticle?.image) && (
                    <Image
                      as={NextImage}
                      width={680}
                      height={300}
                      src={
                        image instanceof File
                          ? URL.createObjectURL(image)
                          : currentUserBlogPost?.image ??
                            userOriginalArticle?.image
                      }
                      alt="preview"
                      className=" h-full w-full object-cover"
                      classNames={{
                        wrapper:
                          "absolute !max-w-[unset] w-full inset-0 object-cover group-hover:opacity-30",
                      }}
                    />
                  )}
                  <div
                    className={cn("flex gap-2", {
                      "z-10 text-white opacity-0 transition-all duration-250 group-data-[hover=true]:opacity-100":
                        image,
                      "opacity-100": !image,
                    })}
                  >
                    <FileUploadIcon />
                    <span>{t("upload-image")}</span>
                  </div>
                  <input
                    type={"file"}
                    accept="image/*"
                    disabled={disabledCheck}
                    {...register("image", {
                      required: currentUserBlogPost?.image
                        ? false
                        : articleId
                          ? false
                          : true,
                    })}
                    className="absolute inset-0 cursor-pointer text-transparent [&::-webkit-file-upload-button]:invisible"
                    onChange={(event) => setTImage(event.target.files![0])}
                  />
                  {!!errors.image && (
                    <span className="text-danger">
                      {t("require-upload-image")}
                    </span>
                  )}
                </Button>
              </div>
              <div>
                <Input
                  type="text"
                  variant={"bordered"}
                  label={t("title")}
                  isRequired
                  disabled={disabledCheck}
                  isInvalid={!!errors.title}
                  value={watch("title")}
                  className="data-[hover=true]:!border-black"
                  classNames={{
                    inputWrapper: cn(inputWrapperStyles),
                    label: "!text-black",
                  }}
                  {...register("title", { required: true, maxLength: 120 })}
                />
                {errors.title && (
                  <span className="text-danger">
                    {errors.title.type === "maxLength"
                      ? t("title-max-length")
                      : t("require-title")}
                  </span>
                )}
              </div>
              <div>
                <Textarea
                  label={t("description")}
                  isRequired
                  isInvalid={!!errors.description}
                  placeholder={t("blog-post-description")}
                  value={watch("description")}
                  disabled={disabledCheck}
                  classNames={{
                    inputWrapper:
                      "bg-white data-[hover=true]:border-black border-2 border-transparent data-[hover=true]:bg-white data-[focus=true]:!bg-white",
                    label: "!text-black",
                    input: "!text-black",
                  }}
                  {...register("description", {
                    required: true,
                    maxLength: 250,
                  })}
                />
                {errors.description && (
                  <span className="text-danger">
                    {errors.description.type === "maxLength"
                      ? t("description-max-length")
                      : t("description-required")}
                  </span>
                )}
              </div>
              <div>
                <PlateEditorEditable
                  editor={editor as unknown as null}
                  value={editorValue}
                  setValue={setEditorValue}
                  readOnly={disabledCheck ?? false}
                />
                <span className="mt-4 text-danger">
                  {getCharactersLengthFromEditorValue(editorValue) <
                  minArticleLength
                    ? t("article-min-length")
                    : getCharactersLengthFromEditorValue(editorValue) >
                        maxArticleLength
                      ? t("article-max-length")
                      : ""}
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <Button
                type="button"
                className="bg-orange bg-gradient-to-t text-black"
                onClick={() => router.back()}
              >
                {t("back-to-overview")}
              </Button>
              <Button
                isLoading={isLoadingUpdate}
                disabled={disabledCheck}
                type="submit"
                className={cn("bg-lime-400 bg-gradient-to-t text-black", {
                  "pointer-events-none bg-grey-soft": disabledCheck,
                })}
              >
                {currentUserBlogPost
                  ? t("update")
                  : articleId
                    ? t("update")
                    : t("create")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

const HandleLoadingSkeleton = ({
  loadingState,
}: {
  loadingState: LoadingStates;
}) => {
  const t = useTranslations("BlogPost");

  return (
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center backdrop-blur-xl before:absolute before:inset-0 before:h-full before:w-full before:bg-black before:opacity-30 ">
      <div className="flex flex-col items-center justify-center">
        <h2 className="h2 z-20 mb-2 text-blue">
          {loadingState === "Create"
            ? t("blog-is-almost-done")
            : t("blog-is-updating")}
        </h2>
        <CircularProgress size="lg" color="default" aria-label="Loading..." />
      </div>
    </div>
  );
};

const OptionsPanel = ({
  articleId,
  acceptedState,
  imageUrl,
}: {
  articleId: string;
  acceptedState: boolean;
  imageUrl: string;
}) => {
  const t = useTranslations("BlogPost");

  const utils = api.useUtils();
  const router = useRouter();

  const { mutate: acceptArticle } = api.dashboard.acceptArticle.useMutation();

  const [isAccepted, setIsAccepted] = useState(acceptedState);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

  const handleAcceptArticle = async (value: boolean) => {
    acceptArticle(
      {
        articleId,
        value,
      },
      {
        onSettled() {
          setIsAccepted(value);
        },
        async onSuccess() {
          await utils.articles.getAllArticles.invalidate();
          await utils.dashboard.getUserAcceptedArticles.invalidate();
          await utils.dashboard.getUserOnReviewArticles.invalidate();

          router.refresh();
        },
      },
    );
  };

  return (
    <>
      <div className="mb-4 rounded-md bg-primary-main p-2">
        <h2 className="h2">{t("options-panel")}</h2>
        <div className="mt-2 flex justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="h4">{t("publish")}:</h3>
            <Switch
              isSelected={isAccepted}
              onValueChange={handleAcceptArticle}
              color="success"
            />
          </div>
          <Button color="danger" onClick={() => setIsDeletePopupOpen(true)}>
            Delete Article
          </Button>
        </div>
      </div>
      <BlogPostFormDeletePopup
        isOpen={isDeletePopupOpen}
        setIsOpen={setIsDeletePopupOpen}
        articleId={articleId}
        imageUrl={imageUrl}
      />
    </>
  );
};

const LanguageTabs = ({
  articleId,
  articleLanguage,
}: {
  articleId: string;
  articleLanguage: string | undefined;
}) => {
  const params = useSearchParams();

  return (
    <div className="mb-4 flex w-full flex-col">
      <Tabs
        aria-label="Options"
        selectedKey={params.get("language")?.toUpperCase() ?? articleLanguage}
        color="primary"
        variant="bordered"
      >
        {Object.values(languagesValuesExtended).map((language) => (
          <Tab
            key={language}
            href={`/dashboard/${articleId}?language=${language.toLowerCase()}`}
            as={Link}
            title={
              <div className="flex items-center space-x-2">
                <Avatar
                  alt={language}
                  className="h-6 w-6"
                  src={`https://flagcdn.com/${language === "EN" ? "us" : language.toLocaleLowerCase()}.svg`}
                />
                <span>{language}</span>
              </div>
            }
          />
        ))}
      </Tabs>
    </div>
  );
};

export default BlogPostForm;

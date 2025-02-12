import { PlateEditorReadOnly } from "./plate-editor";
import { type Value } from "@udecode/plate-common";
import ArticleComments from "./article-comments";
import { type Session } from "next-auth";
import ArticleContentTags from "./article-content-tags";
import ArticleContentAuthor from "./article-content-author";
import { type articlesTagsType } from "@/server/db/schema";

const ArticleContent = async ({
  article,
  session,
}: {
  article:
    | {
        id: string;
        title: string;
        content: string;
        description: string;
        image: string;
        category: string;
        readingTime: string;
        createdAt: Date;
        updatedAt: Date | null;
        isAccepted: boolean;
        isRejected: boolean;
        ArticleTags: articlesTagsType[];
        createdBy: {
          image: string | null;
          about: string | null;
          name: string | null;
          keywords: string | null;
        };
      }
    | undefined;
  session: Session | null;
}) => {
  return (
    <section className="pt-0">
      <div className="wrapper">
        <div>
          <h2 className="h1 mb-4">{article?.title}</h2>
          <PlateEditorReadOnly
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            initialValue={JSON.parse(article?.content ?? "") as Value}
          />
          <ArticleContentAuthor createdBy={article?.createdBy} />
          <ArticleContentTags articleTags={article?.ArticleTags} />
          <ArticleComments session={session} articleId={article?.id ?? ""} />
        </div>
      </div>
    </section>
  );
};
export default ArticleContent;

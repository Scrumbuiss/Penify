import { getTranslations } from "next-intl/server";
import ArticleAsideWrapper from "./article-aside-wrapper";

import AsideOtherArticles from "./aside-other-articles";
// import AdSenseAsideArticle from "./google-adsense/ad-sense-aside-article";

const ArticleAside = async ({ articleId }: { articleId: string }) => {
  const t = await getTranslations("BlogPost");

  return (
    <aside className="section min-w-[340px] max-w-[340px] py-0 pl-0 lg:hidden">
      <ArticleAsideWrapper>
        <h3 className="h4 text-grey-soft">{t("other-articles")}</h3>
        <AsideOtherArticles articleId={articleId} />
        {/* <AdSenseAsideArticle /> */}
      </ArticleAsideWrapper>
    </aside>
  );
};

export default ArticleAside;

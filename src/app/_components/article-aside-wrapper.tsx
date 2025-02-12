const ArticleAsideWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border-1 border-grey-soft p-6">
      {children}
    </div>
  );
};

export default ArticleAsideWrapper;

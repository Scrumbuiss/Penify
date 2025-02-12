const BlogPostsItemsWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ul className="grid grid-cols-3 gap-4 lg:grid-cols-2 sm:grid-cols-1">
      {children}
    </ul>
  );
};
export default BlogPostsItemsWrapper;

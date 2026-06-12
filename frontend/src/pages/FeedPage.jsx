import { useInfiniteQuery } from '@tanstack/react-query';
import { getPosts } from '../api/posts';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import DarkModeToggle from '../components/DarkModeToggle';
import PostSkeleton from '../components/PostSkeleton';

export default function FeedPage() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => getPosts(pageParam).then((r) => r.data),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.meta?.next_cursor ?? undefined,
  });

  const posts = data?.pages.flatMap((p) => p.data) || [];

  return (
    <div className="_layout _layout_main_wrapper">
      <DarkModeToggle />
      <div className="_main_layout">
        <Navbar />

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row justify-content-center">
              {/* Feed */}
              <div className="col-xl-7 col-lg-8 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner" style={{ height: 'auto', display: 'block' }}>
                    <CreatePost />

                    {isLoading && <PostSkeleton />}

                    {isError && (
                      <div className="alert alert-danger">Failed to load posts.</div>
                    )}

                    {!isLoading && posts.length === 0 && (
                      <div className="_feed_inner_area _b_radious6 _mar_b16" style={{ padding: 40, textAlign: 'center' }}>
                        <p style={{ color: '#888', margin: 0 }}>No posts yet. Be the first to post!</p>
                      </div>
                    )}

                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}

                    {/* Load more */}
                    {hasNextPage && (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                        <button
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                          className="_btn1"
                          style={{ padding: '8px 20px', opacity: isFetchingNextPage ? 0.6 : 1 }}
                        >
                          {isFetchingNextPage ? 'Loading...' : 'Load more'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

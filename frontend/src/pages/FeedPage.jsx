import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getPosts } from '../api/posts';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import DarkModeToggle from '../components/DarkModeToggle';
import PostSkeleton from '../components/PostSkeleton';

export default function FeedPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => getPosts(page).then((r) => r.data),
    placeholderData: keepPreviousData,
  });

  const posts = data?.data || [];
  const meta = data?.meta || {};
  const hasNextPage = meta.current_page < meta.last_page;
  const hasPrevPage = meta.current_page > 1;

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

                    {/* Pagination */}
                    {(hasPrevPage || hasNextPage) && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '16px 0' }}>
                        <button
                          onClick={() => setPage((p) => p - 1)}
                          disabled={!hasPrevPage}
                          className="_btn1"
                          style={{ padding: '8px 20px', opacity: hasPrevPage ? 1 : 0.4 }}
                        >
                          ← Prev
                        </button>
                        <span style={{ padding: '8px 12px', fontSize: 13, color: '#666' }}>
                          Page {meta.current_page} of {meta.last_page}
                        </span>
                        <button
                          onClick={() => setPage((p) => p + 1)}
                          disabled={!hasNextPage}
                          className="_btn1"
                          style={{ padding: '8px 20px', opacity: hasNextPage ? 1 : 0.4 }}
                        >
                          Next →
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

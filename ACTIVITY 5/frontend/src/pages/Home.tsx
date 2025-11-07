import { useQuery } from '@tanstack/react-query';
import { api, type Post, type Paginated } from '../api/client';
import { Card, CardContent, Typography, Stack, Pagination, Skeleton, Box } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

export function Home() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') || 1);
  const { data, isLoading } = useQuery({
    queryKey: ['posts', page],
    queryFn: async () => (await api.get<Paginated<Post>>(`/posts?page=${page}&limit=6`)).data,
  });
  return (
    <Stack spacing={3} sx={{ flex: 1, minHeight: 0 }}>
      <Typography variant="h4" fontWeight={700}>Latest Posts</Typography>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} sx={{ minHeight: 380 }}>
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={180} />
        ))}
        {!isLoading && data?.items.length === 0 && (
          <Box display="flex" alignItems="center" justifyContent="center" gridColumn={{ xs: '1', sm: '1 / span 2' }} sx={{ py: 6 }}>
            <Typography color="text.secondary">No posts yet. Be the first to create one.</Typography>
          </Box>
        )}
        {data?.items.map((post) => (
          <Card key={post.id} component={Link} to={`/posts/${post.id}`} sx={{ textDecoration: 'none', ':hover': { boxShadow: 6 } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>{post.title}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{post.body}</Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>By {post.author.username} • {dayjs(post.createdAt).format('MMM D, YYYY')}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Box sx={{ position: 'sticky', bottom: 16, mt: 'auto', display: 'flex', justifyContent: 'center', py: 1, bgcolor: 'transparent' }}>
        {data && (
          <Pagination page={data.page} count={data.pages} onChange={(_, p) => setParams({ page: String(p) })} />
        )}
      </Box>
    </Stack>
  );
}

import { useQuery } from '@tanstack/react-query';
import { api, type Post, type Paginated } from '../api/client';
import { Card, CardContent, Typography, Stack, Pagination, Skeleton, Box, Chip } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export function Home() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') || 1);
  const { data, isLoading } = useQuery({
    queryKey: ['posts', page],
    queryFn: async () => (await api.get<Paginated<Post>>(`/posts?page=${page}&limit=6`)).data,
  });

  return (
    <Stack spacing={4} sx={{ flex: 1, minHeight: 0 }}>
      <Box sx={{ mb: 2 }}>
        <Typography 
          variant="h3" 
          fontWeight={800} 
          sx={{ 
            color: '#3E3530', 
            letterSpacing: '-1px',
            mb: 1
          }}
        >
          Latest Stories
        </Typography>
        <Box sx={{ height: '4px', width: '60px', bgcolor: '#8B6F47', borderRadius: '2px' }} />
      </Box>

      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }} 
        gap={3} 
        sx={{ minHeight: 380 }}
      >
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <Skeleton 
            key={i} 
            variant="rectangular" 
            height={240} 
            sx={{ borderRadius: '12px', bgcolor: '#E8DED3' }} 
          />
        ))}

        {!isLoading && data?.items.length === 0 && (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            gridColumn={{ xs: '1', sm: '1 / span 2', lg: '1 / span 3' }} 
            sx={{ py: 8 }}
          >
            <Typography 
              color="text.secondary" 
              sx={{ fontSize: '1.1rem', fontWeight: 500 }}
            >
              No posts yet. Be the first to create one.
            </Typography>
          </Box>
        )}

        {data?.items.map((post) => (
          <Card 
            key={post.id} 
            component={Link} 
            to={`/posts/${post.id}`} 
            sx={{ 
              textDecoration: 'none',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              ':hover': { 
                boxShadow: '0 12px 32px rgba(139, 111, 71, 0.2)',
                transform: 'translateY(-8px)',
              },
              cursor: 'pointer',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ height: '4px', bgcolor: '#8B6F47' }} />
            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700, 
                  color: '#3E3530', 
                  mb: 1.5,
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {post.title}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2.5,
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  flexGrow: 1
                }}
              >
                {post.body}
              </Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 'auto' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#8B7D77', 
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}
                >
                  By <strong>{post.author.username}</strong>
                </Typography>
                <ArrowForwardIcon sx={{ fontSize: '18px', color: '#8B6F47', opacity: 0.6 }} />
              </Stack>
              <Typography 
                variant="caption" 
                display="block" 
                sx={{ 
                  color: '#8B7D77', 
                  fontSize: '0.75rem',
                  mt: 0.5
                }}
              >
                {dayjs(post.createdAt).format('MMM D, YYYY')}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ position: 'sticky', bottom: 16, mt: 'auto', display: 'flex', justifyContent: 'center', py: 2, bgcolor: 'transparent' }}>
        {data && (
          <Pagination 
            page={data.page} 
            count={data.pages} 
            onChange={(_, p) => setParams({ page: String(p) })} 
            sx={{ 
              '& .MuiPaginationItem-root': { 
                color: '#8B6F47',
                fontSize: '0.95rem',
                fontWeight: 600
              }, 
              '& .Mui-selected': { 
                backgroundColor: '#8B6F47 !important', 
                color: '#FFFCF9',
                fontWeight: 700
              },
              '& .MuiPaginationItem-root:hover': {
                bgcolor: '#D4C5B9'
              }
            }} 
          />
        )}
      </Box>
    </Stack>
  );
}

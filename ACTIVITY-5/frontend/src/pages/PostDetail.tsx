import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Comment as Cmt, type Post } from '../api/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Divider, TextField, Button, Stack, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';

export function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  const { data } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => (await api.get<Post>(`/posts/${id}`)).data,
    enabled: !!id,
  });

  useEffect(() => {
    if (data) { setEditTitle(data.title); setEditBody(data.body); }
  }, [data]);

  const addComment = useMutation({
    mutationFn: async () => (await api.post(`/posts/${id}/comments`, { content })).data,
    onSuccess: () => { setContent(''); qc.invalidateQueries({ queryKey: ['post', id] }); },
  });

  const deletePost = useMutation({
    mutationFn: async () => api.delete(`/posts/${id}`),
    onSuccess: () => { enqueueSnackbar('Post deleted', { variant: 'success' }); nav('/'); },
  });

  const updatePost = useMutation({
    mutationFn: async () => (await api.put(`/posts/${id}`, { title: editTitle, body: editBody })).data,
    onSuccess: () => { enqueueSnackbar('Post updated', { variant: 'success' }); qc.invalidateQueries({ queryKey: ['post', id] }); setEditing(false); },
  });

  const isAuthor = !!(user && data && data.author.id === user.id);

  if (!data) return null;
  return (
    <Stack spacing={4} sx={{ maxWidth: '900px' }}>
      {/* Header Section */}
      <Box sx={{ pb: 3, borderBottom: '2px solid #EBE3DB' }}>
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h3" 
              fontWeight={800} 
              sx={{ 
                color: '#3E3530',
                lineHeight: 1.3,
                letterSpacing: '-0.5px'
              }}
            >
              {data.title}
            </Typography>
          </Box>
          {isAuthor && (
            <Stack direction="row" spacing={0.5}>
              <IconButton 
                size="small" 
                sx={{ 
                  color: '#8B6F47',
                  bgcolor: '#F5F1ED',
                  '&:hover': { bgcolor: '#EBE3DB' }
                }} 
                onClick={() => { setEditing(true); setEditTitle(data.title); setEditBody(data.body); }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ 
                  color: '#C85450',
                  bgcolor: '#FFE8E8',
                  '&:hover': { bgcolor: '#FFD6D6' }
                }} 
                onClick={() => deletePost.mutate()}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#8B7D77', 
                fontSize: '0.95rem',
                fontWeight: 500,
                mb: 0.5
              }}
            >
              By <strong>{data.author.username}</strong>
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#8B7D77',
                fontSize: '0.85rem'
              }}
            >
              Published on {dayjs(data.createdAt).format('MMMM D, YYYY')}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Content Section */}
      <Typography 
        sx={{ 
          color: '#3E3530', 
          lineHeight: 1.9, 
          fontSize: '1.1rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {data.body}
      </Typography>

      {/* Edit Form */}
      {editing && isAuthor && (
        <Box 
          component="form" 
          onSubmit={(e) => { e.preventDefault(); updatePost.mutate(); }} 
          sx={{ 
            p: 3, 
            bgcolor: '#FFFCF9', 
            borderRadius: 2, 
            border: '2px solid #D4C5B9',
            my: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3E3530', mb: 2 }}>
            Edit Post
          </Typography>
          <TextField 
            label="Title" 
            value={editTitle} 
            onChange={(e) => setEditTitle(e.target.value)} 
            fullWidth 
            sx={{ mb: 2 }}
          />
          <TextField 
            label="Body" 
            value={editBody} 
            onChange={(e) => setEditBody(e.target.value)} 
            multiline 
            minRows={8} 
            fullWidth 
            sx={{ mb: 2 }} 
          />
          <Stack direction="row" spacing={1}>
            <Button 
              variant="contained" 
              type="submit"
              startIcon={<SaveIcon />}
              sx={{ bgcolor: '#8B6F47' }}
            >
              Save Changes
            </Button>
            <Button 
              onClick={() => setEditing(false)}
              startIcon={<CancelIcon />}
              sx={{ color: '#8B6F47' }}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      )}

      {/* Comments Section */}
      <Box sx={{ pt: 3, borderTop: '2px solid #EBE3DB' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700, 
            color: '#3E3530',
            mb: 3,
            fontSize: '1.4rem'
          }}
        >
          Comments {(data as any).comments?.length > 0 && `(${(data as any).comments.length})`}
        </Typography>

        {((data as any).comments?.length ?? 0) === 0 ? (
          <Typography 
            sx={{ 
              color: '#8B7D77',
              fontStyle: 'italic',
              py: 2
            }}
          >
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          <Stack spacing={2.5} sx={{ mb: 4 }}>
            {(data as any).comments?.map((c: Cmt) => (
              <Paper 
                key={c.id} 
                sx={{ 
                  p: 3, 
                  bgcolor: '#FFFCF9',
                  borderLeft: '4px solid #8B6F47',
                  borderRadius: '8px'
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#3E3530'
                    }}
                  >
                    {c.author.username}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#8B7D77',
                      fontSize: '0.8rem'
                    }}
                  >
                    {dayjs(c.createdAt).format('MMM D, YYYY')}
                  </Typography>
                </Stack>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#3E3530',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {c.content}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      {/* Add Comment Form */}
      {user && !isAuthor && (
        <Box 
          component="form" 
          onSubmit={(e) => { e.preventDefault(); addComment.mutate(); }} 
          sx={{ 
            p: 3,
            bgcolor: '#FFFCF9',
            borderRadius: 2,
            border: '2px solid #D4C5B9',
            mt: 3
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3E3530', mb: 2 }}>
            Leave a Comment
          </Typography>
          <Stack spacing={2}>
            <TextField 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              fullWidth 
              multiline
              minRows={3}
              placeholder="Share your thoughts..." 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ bgcolor: '#8B6F47', alignSelf: 'flex-start' }}
            >
              Post Comment
            </Button>
          </Stack>
        </Box>
      )}

      {user && isAuthor && (
        <Typography 
          sx={{ 
            color: '#8B7D77',
            fontStyle: 'italic',
            textAlign: 'center',
            py: 2
          }}
        >
          You cannot comment on your own post
        </Typography>
      )}

      {!user && (
        <Box 
          sx={{ 
            p: 3,
            bgcolor: '#F5F1ED',
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography sx={{ color: '#8B7D77', mb: 1 }}>
            Sign in to leave a comment
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

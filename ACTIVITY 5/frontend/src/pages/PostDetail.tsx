import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Comment as Cmt, type Post } from '../api/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Divider, TextField, Button, Stack, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h4" fontWeight={700}>{data.title}</Typography>
        {isAuthor && (
          <>
            <IconButton color="primary" onClick={() => { setEditing(true); setEditTitle(data.title); setEditBody(data.body); }}><EditIcon /></IconButton>
            <IconButton color="error" onClick={() => deletePost.mutate()}><DeleteIcon /></IconButton>
          </>
        )}
      </Stack>
      <Typography color="text.secondary">By {data.author.username} • {dayjs(data.createdAt).format('MMM D, YYYY')}</Typography>
      <Typography>{data.body}</Typography>
      {editing && isAuthor && (
        <Box component="form" onSubmit={(e) => { e.preventDefault(); updatePost.mutate(); }} sx={{ my: 2 }}>
          <TextField value={editTitle} onChange={(e) => setEditTitle(e.target.value)} fullWidth sx={{ mb: 1 }} />
          <TextField value={editBody} onChange={(e) => setEditBody(e.target.value)} multiline minRows={6} fullWidth sx={{ mb: 2 }} />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" type="submit">Save</Button>
            <Button onClick={() => setEditing(false)}>Cancel</Button>
          </Stack>
        </Box>
      )}
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Comments</Typography>
      <Stack spacing={1}>
        {(data as any).comments?.map((c: Cmt) => (
          <Paper key={c.id} sx={{ p: 2 }}>
            <Typography variant="body2">{c.content}</Typography>
            <Typography variant="caption" color="text.secondary">{c.author.username} • {dayjs(c.createdAt).format('MMM D, YYYY')}</Typography>
          </Paper>
        ))}
      </Stack>
      {user && !isAuthor && (
        <Box component="form" onSubmit={(e) => { e.preventDefault(); addComment.mutate(); }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField value={content} onChange={(e) => setContent(e.target.value)} fullWidth placeholder="Write a comment..." />
            <Button type="submit" variant="contained">Post</Button>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

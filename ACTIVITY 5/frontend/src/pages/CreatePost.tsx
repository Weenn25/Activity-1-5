import { Box, Paper, TextField, Button, Typography, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const schema = z.object({ title: z.string().min(1), body: z.string().min(1) });
type FormData = z.infer<typeof schema>;

export function CreatePost() {
  const nav = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await api.post('/posts', data);
      enqueueSnackbar('Post published', { variant: 'success' });
      nav('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to publish post';
      enqueueSnackbar(Array.isArray(msg) ? msg.join(', ') : msg, { variant: 'error' });
      console.error('Create post error:', err);
    }
  });

  return (
    <Box maxWidth={800} mx="auto">
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }} elevation={3}>
        <Typography variant="h5" fontWeight={700}>Write a new post</Typography>
        <Stack component="form" gap={2} onSubmit={onSubmit}>
          <TextField label="Title" {...register('title')} error={!!errors.title} helperText={errors.title?.message} fullWidth />
          <TextField label="Body" multiline minRows={8} {...register('body')} error={!!errors.body} helperText={errors.body?.message} fullWidth />
          <Button type="submit" variant="contained" disabled={isSubmitting}>Publish</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Paper, TextField, Button, Typography, Stack } from '@mui/material';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const schema = z.object({ email: z.string().email(), username: z.string().min(3), password: z.string().min(6) });
type FormData = z.infer<typeof schema>;

export function AuthRegister() {
  const nav = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <Box maxWidth={480} mx="auto">
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }} elevation={3}>
        <Typography variant="h5" fontWeight={700}>Create Account</Typography>
        <Stack component="form" gap={2} onSubmit={handleSubmit(async (data) => { await api.post('/users', data); enqueueSnackbar('Account created. Please login.', { variant: 'success' }); nav('/login'); })}>
          <TextField label="Email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} fullWidth />
            <TextField label="Username" {...register('username')} error={!!errors.username} helperText={errors.username?.message} fullWidth />
          <TextField label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} fullWidth />
          <Button type="submit" variant="contained" disabled={isSubmitting}>Register</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

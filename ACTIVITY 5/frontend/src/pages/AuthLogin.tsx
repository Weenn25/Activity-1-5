import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Paper, TextField, Button, Typography, Stack, Alert } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const schema = z.object({ emailOrUsername: z.string().min(1), password: z.string().min(6) });
type FormData = z.infer<typeof schema>;

export function AuthLogin() {
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <Box maxWidth={420} mx="auto">
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }} elevation={3}>
        <Typography variant="h5" fontWeight={700}>Login</Typography>
        <Stack component="form" gap={2} onSubmit={handleSubmit(async (data) => { 
          try { 
            await login(data.emailOrUsername, data.password); 
            enqueueSnackbar('Logged in', { variant: 'success' }); 
            nav('/'); 
          } catch { 
            enqueueSnackbar('Invalid credentials', { variant: 'error' }); 
          } 
        })}>
          <TextField label="Email or Username" {...register('emailOrUsername')} error={!!errors.emailOrUsername} helperText={errors.emailOrUsername?.message} fullWidth />
          <TextField label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} fullWidth />
          {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
          <Button type="submit" variant="contained" disabled={isSubmitting}>Login</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

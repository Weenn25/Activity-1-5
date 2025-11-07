import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Paper, TextField, Button, Typography, Stack, Divider, Link as MuiLink } from '@mui/material';
import { api } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

const schema = z.object({ 
  email: z.string().email('Invalid email address'), 
  username: z.string().min(3, 'Username must be at least 3 characters'), 
  password: z.string().min(6, 'Password must be at least 6 characters') 
});
type FormData = z.infer<typeof schema>;

export function AuthRegister() {
  const nav = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <Box 
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        py: 4
      }}
    >
      <Box maxWidth={480} sx={{ width: '100%' }}>
        <Paper 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3,
            bgcolor: '#FFFCF9', 
            border: '2px solid #EBE3DB',
            borderRadius: '12px'
          }} 
          elevation={2}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              fontWeight={800} 
              sx={{ 
                color: '#3E3530',
                mb: 1,
                letterSpacing: '-0.5px'
              }}
            >
              Join Us
            </Typography>
            <Box sx={{ height: '3px', width: '40px', bgcolor: '#8B6F47', borderRadius: '2px', mx: 'auto' }} />
          </Box>

          <Stack 
            component="form" 
            gap={2.5} 
            onSubmit={handleSubmit(async (data) => {
              try {
                await api.post('/users', data);
                enqueueSnackbar('Account created successfully! 🎉 Please login.', { variant: 'success' });
                nav('/login');
              } catch (err: any) {
                const msg = err?.response?.data?.message || 'Failed to create account';
                enqueueSnackbar(Array.isArray(msg) ? msg.join(', ') : msg, { variant: 'error' });
              }
            })}
          >
            <TextField 
              label="Email" 
              placeholder="your.email@example.com"
              {...register('email')} 
              error={!!errors.email} 
              helperText={errors.email?.message} 
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
            <TextField 
              label="Username" 
              placeholder="Choose a unique username"
              {...register('username')} 
              error={!!errors.username} 
              helperText={errors.username?.message} 
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
            <TextField 
              label="Password" 
              type="password" 
              placeholder="At least 6 characters"
              {...register('password')} 
              error={!!errors.password} 
              helperText={errors.password?.message} 
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
            <Button 
              type="submit" 
              variant="contained"
              size="large"
              disabled={isSubmitting}
              startIcon={<AppRegistrationIcon />}
              sx={{ 
                bgcolor: '#8B6F47',
                '&:hover': { bgcolor: '#6B5537' },
                fontWeight: 700,
                py: 1.5,
                mt: 1
              }}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Stack>

          <Divider sx={{ borderColor: '#EBE3DB' }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#8B7D77', mb: 1 }}>
              Already have an account?
            </Typography>
            <MuiLink 
              component={Link} 
              to="/login"
              sx={{ 
                color: '#8B6F47',
                fontWeight: 700,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Login here
            </MuiLink>
          </Box>
        </Paper>

        <Typography 
          variant="caption" 
          display="block"
          sx={{ 
            color: '#8B7D77',
            textAlign: 'center',
            mt: 3
          }}
        >
          🔐 We respect your privacy
        </Typography>
      </Box>
    </Box>
  );
}

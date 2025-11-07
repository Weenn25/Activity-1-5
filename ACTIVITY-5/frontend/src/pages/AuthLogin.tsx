import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Paper, TextField, Button, Typography, Stack, Alert, Divider, Link as MuiLink } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';

const schema = z.object({ emailOrUsername: z.string().min(1, 'Email or username is required'), password: z.string().min(6, 'Password must be at least 6 characters') });
type FormData = z.infer<typeof schema>;

export function AuthLogin() {
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const nav = useNavigate();
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
      <Box maxWidth={420} sx={{ width: '100%' }}>
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
              Welcome!
            </Typography>
            <Box sx={{ height: '3px', width: '50px', bgcolor: '#8B6F47', borderRadius: '2px', mx: 'auto' }} />
          </Box>

          <Stack 
            component="form" 
            gap={2.5} 
            onSubmit={handleSubmit(async (data) => { 
              try { 
                await login(data.emailOrUsername, data.password); 
                enqueueSnackbar('Logged in successfully!', { variant: 'success' }); 
                nav('/'); 
              } catch { 
                enqueueSnackbar('Invalid credentials. Please try again.', { variant: 'error' }); 
              } 
            })}
          >
            <TextField 
              label="Email or Username" 
              placeholder="Enter your email or username"
              {...register('emailOrUsername')} 
              error={!!errors.emailOrUsername} 
              helperText={errors.emailOrUsername?.message} 
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
              placeholder="Enter your password"
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
              startIcon={<LoginIcon />}
              sx={{ 
                bgcolor: '#8B6F47',
                '&:hover': { bgcolor: '#6B5537' },
                fontWeight: 700,
                py: 1.5,
                mt: 1
              }}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </Stack>

          <Divider sx={{ borderColor: '#EBE3DB' }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#8B7D77', mb: 1 }}>
              Don't have an account?
            </Typography>
            <MuiLink 
              component={Link} 
              to="/register"
              sx={{ 
                color: '#8B6F47',
                fontWeight: 700,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Create one here
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
          🔒 Your credentials are secure
        </Typography>
      </Box>
    </Box>
  );
}

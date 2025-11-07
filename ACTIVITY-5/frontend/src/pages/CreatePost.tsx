import { Box, Paper, TextField, Button, Typography, Stack, LinearProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import PublishIcon from '@mui/icons-material/Publish';

const schema = z.object({ title: z.string().min(1, 'Title is required'), body: z.string().min(1, 'Content is required') });
type FormData = z.infer<typeof schema>;

export function CreatePost() {
  const nav = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>({ resolver: zodResolver(schema) });
  
  const titleValue = watch('title');
  const bodyValue = watch('body');
  const totalChars = (titleValue?.length || 0) + (bodyValue?.length || 0);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await api.post('/posts', data);
      enqueueSnackbar('Post published successfully! ', { variant: 'success' });
      nav('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to publish post';
      enqueueSnackbar(Array.isArray(msg) ? msg.join(', ') : msg, { variant: 'error' });
      console.error('Create post error:', err);
    }
  });

  return (
    <Box maxWidth={900} mx="auto" sx={{ width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          fontWeight={800} 
          sx={{ 
            color: '#3E3530',
            mb: 1,
            letterSpacing: '-0.5px'
          }}
        >
          Write a Story
        </Typography>
        <Box sx={{ height: '4px', width: '80px', bgcolor: '#8B6F47', borderRadius: '2px' }} />
      </Box>

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
        <Stack component="form" gap={3} onSubmit={onSubmit}>
          {/* Title Field */}
          <Box>
            <TextField 
              label="Post Title" 
              placeholder="Give your post a compelling title..."
              {...register('title')} 
              error={!!errors.title} 
              helperText={errors.title?.message} 
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontSize: '1.1rem'
                },
                '& .MuiOutlinedInput-input': {
                  padding: '16px'
                }
              }}
            />
          </Box>

          {/* Body Field */}
          <Box>
            <TextField 
              label="Post Content" 
              placeholder="Write your story here... (markdown supported)"
              multiline 
              minRows={12}
              maxRows={20}
              {...register('body')} 
              error={!!errors.body} 
              helperText={errors.body?.message} 
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontFamily: 'monospace'
                },
                '& .MuiOutlinedInput-input': {
                  padding: '16px'
                }
              }}
            />
          </Box>

          {/* Character Count */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#8B7D77',
                fontWeight: 500
              }}
            >
              Characters: <strong>{totalChars.toLocaleString()}</strong>
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: totalChars > 5000 ? '#C85450' : '#8B7D77',
                fontWeight: 500
              }}
            >
              {totalChars > 5000 ? '⚠️ Long post' : '✓ Good'}
            </Typography>
          </Stack>

          {/* Submit Button */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <Button 
              type="submit" 
              variant="contained"
              size="large"
              disabled={isSubmitting}
              startIcon={<PublishIcon />}
              sx={{ 
                bgcolor: '#8B6F47',
                '&:hover': { bgcolor: '#6B5537' },
                fontWeight: 700,
                py: 1.5,
                fontSize: '1rem'
              }}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </Button>
            <Button 
              onClick={() => nav('/')}
              variant="outlined"
              size="large"
              sx={{ 
                color: '#8B6F47',
                borderColor: '#8B6F47',
                fontWeight: 700,
                py: 1.5,
                fontSize: '1rem',
                '&:hover': { bgcolor: '#F5F1ED' }
              }}
            >
              Cancel
            </Button>
          </Stack>

          {isSubmitting && (
            <Box>
              <LinearProgress 
                sx={{ 
                  height: '4px',
                  borderRadius: '2px',
                  bgcolor: '#E8DED3',
                  '& .MuiLinearProgress-bar': { bgcolor: '#8B6F47' }
                }}
              />
            </Box>
          )}
        </Stack>
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
        💡 Tip: Write engaging content to get more comments and engagement
      </Typography>
    </Box>
  );
}

import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Stack, Container, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import WriteIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';

export function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [isNavHovered, setIsNavHovered] = useState(false);

  const handleLogout = () => {
    logout();
    nav('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F5F1ED' }}>
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: '#FFFCF9', 
          color: '#3E3530',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          borderBottom: '2px solid #EBE3DB'
        }}
      >
        <Toolbar
          onMouseEnter={() => setIsNavHovered(true)}
          onMouseLeave={() => setIsNavHovered(false)}
        >
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              textDecoration: 'none', 
              color: isNavHovered ? '#1a1a1a' : '#8B6F47',
              fontWeight: 700,
              fontSize: '1.5rem',
              letterSpacing: '-0.5px',
              flex: 1,
              transition: 'color 0.3s ease',
              '&:visited': { color: isNavHovered ? '#1a1a1a' : '#8B6F47' }
            }}
          >
            ✦ Blog
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {user ? (
              <>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: isNavHovered ? '#1a1a1a' : '#8B7D77', 
                    fontWeight: 500,
                    transition: 'color 0.3s ease'
                  }}
                >
                  {user.username}
                </Typography>
                <Button
                  component={Link}
                  to="/posts/new"
                  startIcon={<WriteIcon />}
                  sx={{ 
                    color: '#FFFCF9',
                    bgcolor: '#8B6F47',
                    '&:hover': { bgcolor: '#6B5537', color: '#FFFCF9' },
                    textTransform: 'none',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Write
                </Button>
                <Button
                  onClick={handleLogout}
                  endIcon={<LogoutIcon />}
                  sx={{ 
                    color: isNavHovered ? '#1a1a1a' : '#8B6F47',
                    backgroundColor: 'transparent',
                    '&:hover': { 
                      backgroundColor: 'transparent',
                      color: '#1a1a1a'
                    },
                    textTransform: 'none',
                    fontWeight: 600,
                    transition: 'color 0.3s ease'
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  component={Link} 
                  to="/login"
                  sx={{ 
                    color: isNavHovered ? '#1a1a1a' : '#8B6F47',
                    backgroundColor: 'transparent',
                    '&:hover': { 
                      backgroundColor: 'transparent',
                      color: '#1a1a1a'
                    },
                    textTransform: 'none',
                    fontWeight: 600,
                    transition: 'color 0.3s ease'
                  }}
                >
                  Login
                </Button>
                <Button 
                  component={Link} 
                  to="/register"
                  sx={{ 
                    color: '#FFFCF9',
                    bgcolor: '#8B6F47',
                    '&:hover': { bgcolor: '#6B5537', color: '#FFFCF9' },
                    textTransform: 'none',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 4, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Container>

      <Box 
        component="footer"
        sx={{ 
          bgcolor: '#FFFCF9',
          borderTop: '2px solid #EBE3DB',
          py: 3,
          mt: 'auto'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ color: '#8B7D77', fontWeight: 500 }}
          >
            © 2025 Blog Space.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

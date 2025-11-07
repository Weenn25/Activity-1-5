import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ background: 'linear-gradient(90deg,#ffffffcc,#f5f7fa)', backdropFilter: 'blur(6px)', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', flexGrow: 1, fontWeight: 700 }}>
            Blog Platform
          </Typography>
          {user ? (
            <>
              <Button component={Link} to="/posts/new" variant="contained">New Post</Button>
              <Typography variant="body2" sx={{ mx: 1 }}>{user.username}</Typography>
              <Button onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/login">Login</Button>
              <Button component={Link} to="/register">Register</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }} maxWidth="md">
        <Outlet />
      </Container>
    </Box>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AuthLogin } from './pages/AuthLogin';
import { AuthRegister } from './pages/AuthRegister';
import { CreatePost } from './pages/CreatePost';
import { PostDetail } from './pages/PostDetail';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';

const qc = new QueryClient();
const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#3f51b5' }, background: { default: '#f5f7fa' } },
  typography: { fontFamily: 'Inter, system-ui, Roboto, sans-serif' },
  shape: { borderRadius: 12 },
  components: { MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } } },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <QueryClientProvider client={qc}>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="" element={<Layout />}> 
                  <Route index element={<Home />} />
                  <Route path="login" element={<AuthLogin />} />
                  <Route path="register" element={<AuthRegister />} />
                  <Route element={<ProtectedRoute />}> 
                    <Route path="posts/new" element={<CreatePost />} />
                  </Route>
                  <Route path="posts/:id" element={<PostDetail />} />
                </Route>
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

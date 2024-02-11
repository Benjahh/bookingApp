import { useLocation, Route, Routes, Outlet, Navigate } from 'react-router-dom';
import { Home, Login, Profile, Register, ResetPassword } from './pages';
import { useSelector } from 'react-redux';

const Layout = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();

  return user?.token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

function App() {
  const { theme } = useSelector((state) => state.theme);

  return (
    <main data-theme={theme} className="w-max-9xl h-full w-full">
      <Routes>
        <Route element={<Layout />}>
          <Route path={'/'} element={<Home />} />
          <Route path={'/profile/:id'} element={<Profile />} />
        </Route>
        <Route path={'/register'} element={<Register />} />
        <Route path={'/login'} element={<Login />} />
        <Route path={'/reset-password'} element={<ResetPassword />} />
      </Routes>
    </main>
  );
}

export default App;

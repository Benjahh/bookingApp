import { useLocation, Route, Routes, Outlet, Navigate } from 'react-router-dom';
import { Home, Login, Profile, Register, ResetPassword } from './pages';

const Layout = () => {
  const user = null;
  const location = useLocation();

  return user?.token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

function App() {
  return (
    <main clas sName="w-max-9xl w-full">
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

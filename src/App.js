import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { BrowsePage } from './pages/BrowsePage';
import { CreateEditPage } from './pages/CreateEditPage';
import { ViewDetailPage } from './pages/ViewDetailPage';
import { FTRPage } from './pages/FTRPage';
const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsx("p", { className: "text-gray-500", children: "Loading..." }) }));
    }
    if (!currentUser) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
const AppRoutes = () => {
    const { currentUser, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsx("p", { className: "text-gray-500", children: "Loading..." }) }));
    }
    return (_jsx(Routes, { children: currentUser ? (_jsxs(_Fragment, { children: [_jsx(Route, { path: "/dashboard", element: _jsx(BrowsePage, {}) }), _jsx(Route, { path: "/create", element: _jsx(CreateEditPage, {}) }), _jsx(Route, { path: "/edit/:id", element: _jsx(CreateEditPage, {}) }), _jsx(Route, { path: "/view/:id", element: _jsx(ViewDetailPage, {}) }), _jsx(Route, { path: "/ftr", element: _jsx(FTRPage, {}) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/login", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] })) : (_jsxs(_Fragment, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/login", replace: true }) })] })) }));
};
function App() {
    return (_jsx(Router, { children: _jsx(AuthProvider, { children: _jsx(AppRoutes, {}) }) }));
}
export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDetails from './pages/GroupDetails';
import PrivateRoutes from './utils/PrivateRoutes';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<PrivateRoutes />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/groups/:id" element={<GroupDetails />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;

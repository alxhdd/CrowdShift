import { HashRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AttendeeForm from "./pages/AttendeeForm";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendee" element={<AttendeeForm />} />
      </Routes>
    </HashRouter>
  );
}

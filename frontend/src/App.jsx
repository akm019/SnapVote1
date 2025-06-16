import { useSelector } from "react-redux";
import LandingPage from "./components/LandingPage";
import StudentPage from "./components/StudentPage";
import TeacherPage from "./components/TeacherPage";

export default function App() {
  const { role } = useSelector(state => state.user);

  if (!role) return <LandingPage />;
  if (role === "teacher") return <TeacherPage />;
  if (role === "student") return <StudentPage />;
  return null;
}
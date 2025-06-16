import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

export default function LandingPage() {
  const dispatch = useDispatch();
  const handleClick = (role) => {
    dispatch(setUser({ role, name: "", id: null }));
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-purple-800 to-gray-950 text-white">
      <div className="text-4xl font-extrabold mb-10 tracking-tight shadow-lg">SnapPole</div>
      <div className="flex gap-16">
        <button
          onClick={() => handleClick("teacher")}
          className="bg-gradient-to-tr from-purple-600 to-purple-800 shadow-xl rounded-xl px-16 py-10 text-3xl font-bold transition transform hover:scale-105 border-4 border-purple-400 hover:border-purple-200"
        >
          <span className="block mb-2">👩‍🏫</span>
          Teacher
        </button>
        <button
          onClick={() => handleClick("student")}
          className="bg-gradient-to-tr from-purple-600 to-purple-800 shadow-xl rounded-xl px-16 py-10 text-3xl font-bold transition transform hover:scale-105 border-4 border-purple-400 hover:border-purple-200"
        >
          <span className="block mb-2">🧑‍🎓</span>
          Student
        </button>
      </div>
      <div className="text-purple-300 mt-12 font-medium opacity-70 tracking-wide text-lg">
        The fastest way to run interactive live polls in class.
      </div>
    </div>
  );
}
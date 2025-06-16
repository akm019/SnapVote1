import { useSelector } from "react-redux";
import { getSocket } from "../socket/socket";

export default function StudentsList() {
  const students = useSelector(state => state.poll.studentList) || [];

  function kick(studentName) {
    getSocket().emit("teacher:kick", { name: studentName });
  }

  return (
    <div>
      <div className="font-bold mb-2 text-blue-800">Students</div>
      <ul>
        {students.map((name, idx) => (
          <li key={idx} className="flex justify-between text-blue-700 items-center mb-1">
            {name}
            <button className="text-red-400 text-xs underline ml-2"
              onClick={() => kick(name)}>Kick</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
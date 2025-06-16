import { useSelector, useDispatch } from "react-redux";
import { useRef, useEffect, useState } from "react";
import { addMessage } from "../redux/chatSlice";
import { getSocket } from "../socket/socket";

export default function ChatBox() {
  const dispatch = useDispatch();
  const role = useSelector(state => state.user.role);
  const name = useSelector(state => state.user.name);
  const chat = useSelector(state => state.chat.messages);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const socket = getSocket();
  const bottomRef = useRef();

  useEffect(() => {
    if (!socket) return;
    const handleMsg = (msg) => {
      dispatch(addMessage(msg));
    }
    socket.on("chat:message", handleMsg);
    return () => socket.off("chat:message", handleMsg);
  }, [socket, dispatch]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chat, open]);

  function sendMsg(e) {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit("chat:message", { from: role, name, content: input.trim() });
    setInput("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-80 bg-white shadow-lg rounded-t-xl rounded-b-xl flex flex-col">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-t-xl flex justify-between items-center">
            <span className="font-bold">Chat</span>
            <button onClick={() => setOpen(false)} className="text-lg">&times;</button>
          </div>
          <div className="h-64 overflow-y-auto px-4 py-2 flex-1">
            {chat.map((msg, i) => (
              <div key={i} className={`mb-2 ${msg.from === role && msg.name === name ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-2 py-1 rounded 
                  ${msg.from === "teacher" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                  <span className="font-semibold">{msg.from === "teacher" ? "Teacher" : msg.name}: </span>
                  <span>{msg.content}</span>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form className="flex border-t" onSubmit={sendMsg}>
            <input
              className="flex-1 px-3 py-2 outline-none rounded-bl-xl"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-br-xl font-bold hover:bg-blue-600 transition">
              Send
            </button>
          </form>
        </div>
      ) : (
        <button
          className="bg-gradient-to-r from-purple-500 to-blue-600 px-5 py-3 rounded-full shadow-lg text-white font-bold text-lg hover:scale-105 transition"
          onClick={() => setOpen(true)}
        >
          Chat
        </button>
      )}
    </div>
  );
}
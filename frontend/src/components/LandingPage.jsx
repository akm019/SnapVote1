import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { motion } from "framer-motion"; // Optional - adds subtle animations

export default function LandingPage() {
  const dispatch = useDispatch();
  const handleClick = (role) => {
    dispatch(setUser({ role, name: "", id: null }));
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-900 text-white overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/6 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="z-10 w-full max-w-5xl px-6 flex flex-col items-center">
        {/* Logo/Title */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-extrabold mb-6 tracking-tighter"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-white to-purple-200">
            SnapPole
          </span>
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent mt-2"></div>
        </motion.div>

        {/* Tagline */}
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-purple-100 mb-14 text-center max-w-2xl font-light"
        >
          Transform your classroom experience with instant, interactive polling that engages every student in real-time.
        </motion.p>

        {/* Role selection */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-8 md:gap-16 w-full justify-center"
        >
          <button
            onClick={() => handleClick("teacher")}
            className="group bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl px-8 py-8 md:px-12 md:py-10 text-2xl md:text-3xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] border border-purple-400/30 hover:border-purple-300/80 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-5xl mb-4">👩‍🏫</span>
              <span className="tracking-wide">Teacher</span>
              <span className="text-xs font-normal text-purple-200 mt-2">Create and manage polls</span>
            </div>
          </button>
          
          <button
            onClick={() => handleClick("student")}
            className="group bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl px-8 py-8 md:px-12 md:py-10 text-2xl md:text-3xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(192,38,211,0.5)] border border-fuchsia-400/30 hover:border-fuchsia-300/80 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/20 to-purple-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-5xl mb-4">🧑‍🎓</span>
              <span className="tracking-wide">Student</span>
              <span className="text-xs font-normal text-purple-200 mt-2">Join and respond to polls</span>
            </div>
          </button>
        </motion.div>

        {/* Features list */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
            <div className="text-purple-300 font-semibold text-lg mb-2">⚡ Instant Results</div>
            <p className="text-sm text-purple-100/80">See responses in real-time as students participate</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
            <div className="text-purple-300 font-semibold text-lg mb-2">🔄 No Refresh Needed</div>
            <p className="text-sm text-purple-100/80">Live updates without disrupting the flow</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
            <div className="text-purple-300 font-semibold text-lg mb-2">📊 Beautiful Charts</div>
            <p className="text-sm text-purple-100/80">Visualize responses with clear, engaging graphics</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-purple-300/70 mt-16 font-medium text-center max-w-lg">
          <p className="text-sm">
            Join thousands of educators who are transforming classroom engagement with SnapPole.
            No setup required, start polling in seconds.
          </p>
          <div className="mt-6 text-xs text-purple-400/50">
            © 2023 SnapPole | The fastest way to run interactive live polls in class
          </div>
        </div>
      </div>
    </div>
  );
}
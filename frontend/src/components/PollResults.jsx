import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

export default function PollResults({end}) {
  const { activePoll, results } = useSelector(state => state.poll);
  const [animatedCounts, setAnimatedCounts] = useState([]);

  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  
  // Animate the vote counts - moved before early return
  useEffect(() => {
    if (results && results.counts) {
      const timer = setTimeout(() => {
        setAnimatedCounts(results.counts);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [results?.counts]); // Safe optional chaining

  // ✅ Early return AFTER all hooks
  if (!activePoll || !results || !results.counts) return null;

  const totalVotes = results.counts.reduce((a,b) => a+b, 0);

  const getGradientColor = (index) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500'
    ];
    return gradients[index % gradients.length];
  };

  const getOptionLetter = (index) => String.fromCharCode(65 + index);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          {end ? (
            <>
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Poll Ended - Final Results
              </h3>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Live Poll Results
              </h3>
            </>
          )}
        </div>
        
        <div className="flex items-center justify-center space-x-4 text-sm text-slate-400">
          <span>Total Votes: <span className="font-bold text-white">{totalVotes}</span></span>
          {!end && (
            <>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Live Updates</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {activePoll.options.map((opt, i) => {
          const count = results.counts[i] ?? 0;
          const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          const isWinner = end && count > 0 && count === Math.max(...results.counts);
          
          return (
            <div 
              key={i} 
              className={`relative bg-slate-700/40 rounded-2xl p-5 border transition-all duration-300 hover:scale-105 ${
                isWinner 
                  ? 'border-yellow-400/50 shadow-lg' 
                  : 'border-slate-600/50 hover:border-slate-500/70'
              }`}
            >
              {/* Winner Badge */}
              {isWinner && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${getGradientColor(i)} rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg`}>
                    {getOptionLetter(i)}
                  </div>
                  <span className="font-semibold text-white text-lg">{opt}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-white">{count}</span>
                  <span className="text-sm text-slate-400">
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-slate-800/60 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getGradientColor(i)} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                  >
                  </div>
                </div>
                
                {/* Percentage label on bar */}
                {percentage > 15 && (
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-white text-xs font-bold">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      {end && totalVotes > 0 && (
        <div className="mt-6 p-4 bg-slate-700/30 rounded-2xl border border-slate-600/50">
          <div className="text-center">
            <h4 className="font-bold text-slate-300 mb-3">Poll Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {Math.max(...results.counts)}
                </div>
                <div className="text-slate-400">Highest Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {activePoll.options.length}
                </div>
                <div className="text-slate-400">Total Options</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/*
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

export default function PollResults({end}) {
  const { activePoll, results } = useSelector(state => state.poll);
  const [animatedCounts, setAnimatedCounts] = useState([]);

  // ✅ Move all hooks BEFORE any conditional returns
  useEffect(() => {
    if (results && results.counts) {
      const timer = setTimeout(() => {
        setAnimatedCounts(results.counts);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [results?.counts]);

  // ✅ Instead of returning null, render a loading state or empty div
  if (!activePoll || !results || !results.counts) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
          <p className="text-slate-400">Loading poll results...</p>
        </div>
      </div>
    );
  }

  const totalVotes = results.counts.reduce((a,b) => a+b, 0);

  const getGradientColor = (index) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500'
    ];
    return gradients[index % gradients.length];
  };

  const getOptionLetter = (index) => String.fromCharCode(65 + index);

  return (
    <div className="space-y-6">
      
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          {end ? (
            <>
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Poll Ended - Final Results
              </h3>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Live Poll Results
              </h3>
            </>
          )}
        </div>
        
        <div className="flex items-center justify-center space-x-4 text-sm text-slate-400">
          <span>Total Votes: <span className="font-bold text-white">{totalVotes}</span></span>
          {!end && (
            <>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Live Updates</span>
              </div>
            </>
          )}
        </div>
      </div>

   
      <div className="space-y-4">
        {activePoll.options.map((opt, i) => {
          const count = results.counts[i] ?? 0;
          const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          const isWinner = end && count > 0 && count === Math.max(...results.counts);
          
          return (
            <div 
              key={i} 
              className={`relative bg-slate-700/40 rounded-2xl p-5 border transition-all duration-300 hover:scale-105 ${
                isWinner 
                  ? 'border-yellow-400/50 shadow-lg' 
                  : 'border-slate-600/50 hover:border-slate-500/70'
              }`}
            >
           
              {isWinner && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${getGradientColor(i)} rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg`}>
                    {getOptionLetter(i)}
                  </div>
                  <span className="font-semibold text-white text-lg">{opt}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-white">{count}</span>
                  <span className="text-sm text-slate-400">
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-slate-800/60 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getGradientColor(i)} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                  >
                  </div>
                </div>
                
               
                {percentage > 15 && (
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-white text-xs font-bold">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {end && totalVotes > 0 && (
        <div className="mt-6 p-4 bg-slate-700/30 rounded-2xl border border-slate-600/50">
          <div className="text-center">
            <h4 className="font-bold text-slate-300 mb-3">Poll Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {Math.max(...results.counts)}
                </div>
                <div className="text-slate-400">Highest Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {activePoll.options.length}
                </div>
                <div className="text-slate-400">Total Options</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
*/ 
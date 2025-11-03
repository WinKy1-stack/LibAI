export default function HeroSection() {
  return (
    <div className="text-center max-w-4xl mx-auto">
      {/* Title với Avatar */}
      <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          TRỢ LÝ ẢO THƯ VIỆN
        </h1>
        
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full p-[3px] bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 shadow-[0_4px_20px_rgba(251,146,60,0.4)] animate-pulse" style={{ animationDuration: '3s' }}>
          <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-pink-400 flex items-center justify-center">
            <svg className="w-3/5 h-3/5 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          TƯƠNG TÁC
        </h2>
      </div>

      {/* Second Line */}
      <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
        THÔNG MINH, TIẾP CẬN TRI THỨC
      </h2>
    </div>
  );
}


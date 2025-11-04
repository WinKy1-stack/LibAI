export default function HeroSection() {
  return (
    <div className="text-center max-w-4xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight
                       bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600
                       bg-clip-text text-transparent">
          TRỢ LÝ ẢO THƯ VIỆN
        </h1>
        
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full p-1.5 bg-background-tertiary">
          <svg className="w-full h-full text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-extrabold
                       bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600
                       bg-clip-text text-transparent">
          TƯƠNG TÁC
        </h2>
      </div>

      <h2 className="text-3xl md:text-4xl font-extrabold
                     bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600
                     bg-clip-text text-transparent">
        THÔNG MINH, TIẾP CẬN TRI THỨC
      </h2>
    </div>
  );
}
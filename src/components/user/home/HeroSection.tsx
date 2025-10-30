export default function HeroSection() {
  return (
    <div className="hero-container">
      {/* First Line: Title + Avatar + Text */}
      <div className="hero-title-wrapper">
        <h1 className="hero-title">
          TRỢ LÝ ẢO THƯ VIỆN
        </h1>
        
        <div className="hero-avatar">
          <div className="hero-avatar-inner">
            <svg style={{ width: "60%", height: "60%" }} className="hero-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
        
        <h2 className="hero-title-secondary">
          TƯƠNG TÁC
        </h2>
      </div>

      {/* Second Line */}
      <h2 className="hero-title-tertiary">
        THÔNG MINH, TIẾP CẬN TRI THỨC
      </h2>

      {/* Subtitle */}
      <p className="hero-subtitle">
        Hỏi đáp tự do, AI sẽ giúp bạn tìm kiếm tài liệu và giải đáp mọi thắc mắc về thư viện một cách nhanh chóng và chính xác
      </p>
    </div>
  );
}


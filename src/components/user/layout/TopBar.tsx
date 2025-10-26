import { Link } from "react-router-dom";
import { useChatContext } from "../../../contexts/ChatContext";

interface TopBarProps {
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

export default function TopBar({ mode, onToggleTheme }: TopBarProps) {
  const { setIsChatting } = useChatContext();

  return (
    <header style={{
      padding: "16px 24px",
      borderBottom: mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(0, 0, 0, 0.08)",
      background: mode === "dark"
        ? "rgba(10, 10, 10, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        {/* Logo */}
        <Link 
          to="/" 
          onClick={() => setIsChatting(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
          }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "linear-gradient(135deg, #ec4899 0%, #9333ea 100%)",
            boxShadow: "0 4px 12px rgba(236, 72, 153, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg style={{ width: 24, height: 24 }} fill="white" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
          </div>
          <span style={{
            fontSize: 24,
            fontWeight: 700,
            color: mode === "dark" ? "#fff" : "#000",
          }}>
            LibAI
          </span>
        </Link>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Admin Button */}
          <Link
            to="/admin/dashboard"
            style={{
              background: "transparent",
              border: mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
              padding: "8px 16px",
              cursor: "pointer",
              color: mode === "dark" ? "#fff" : "#000",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";
              e.currentTarget.style.borderColor = "#9333ea";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
            }}
          >
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            style={{
              background: "transparent",
              border: "none",
              padding: 8,
              cursor: "pointer",
              color: mode === "dark" ? "#fff" : "#000",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {mode === "dark" ? (
              <svg style={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg style={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Login Button */}
          <Link
            to="/login"
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "linear-gradient(135deg, #ec4899 0%, #9333ea 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(147, 51, 234, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(147, 51, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(147, 51, 234, 0.3)";
            }}
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </header>
  );
}

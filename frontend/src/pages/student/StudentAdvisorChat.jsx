import { useState } from "react";
import api from "../../services/axiosInstance";

function StudentAdvisorChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi 👋 I'm your Study Advisor. Ask me anything about studies, attendance, marks, or courses.",
    },
  ]);
  

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await api.post("/advisor-chat", {
        message,
        studentId: localStorage.getItem("student_id"),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.reply,
        },
      ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
  err.response?.data?.error ||
  "Sorry, something went wrong.",
        },
      ]);
    }

    setMessage("");
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "15px",
        padding: "20px",
        marginTop: "30px",
        height: "500px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2>🤖 Study Advisor Chat</h2>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginTop: "15px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign:
                msg.role === "user"
                  ? "right"
                  : "left",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "10px 15px",
                borderRadius: "15px",
                background:
                  msg.role === "user"
                    ? "#4f46e5"
                    : "#e5e7eb",
                color:
                  msg.role === "user"
                    ? "white"
                    : "black",
                maxWidth: "70%",
              }}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "15px",
        }}
      >
        <input
          type="text"
          value={message}
          placeholder="Ask your advisor..."
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={(e) =>
            e.key === "Enter" &&
            handleSend()
          }
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
          }}
        />

        <button
          onClick={handleSend}
          style={{
            background: "#4f46e5",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default StudentAdvisorChat;
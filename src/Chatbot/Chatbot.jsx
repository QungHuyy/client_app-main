import React, { useState } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const handleSend = () => {
    if (!userInput.trim()) return;

    const newMessage = { text: userInput, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);

    // Giả lập phản hồi từ chatbot (có thể thay bằng API thực)
    const botReply = {
      text: `Bạn vừa hỏi: "${userInput}". Đây là phản hồi demo từ chatbot.`,
      sender: "bot",
    };
    setMessages((prev) => [...prev, botReply]);

    setUserInput("");
  };

  return (
    <div className="chat-container">
      <div id="chatbox" className="chatbox">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          id="user-input"
          placeholder="Nhập câu hỏi về sản phẩm..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button id="send-btn" onClick={handleSend}>
          Gửi
        </button>
      </div>
    </div>
  );
};

export default Chatbot;

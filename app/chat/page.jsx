"use client"; // Next.js directive to enable client-side rendering

import React, { useState, useEffect } from "react";
import io from "socket.io-client";

// Initialize Socket.IO client connection
const socket = io("http://localhost:3000"); // Update this to your backend server URL

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Append message utility function
  const appendMessage = (message, position) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: message, position },
    ]);
  };

  useEffect(() => {
    // Prompt for username and notify the server
    console.log("why ");
  
    const name = prompt("Enter your name to join");
    if(!name) return
    socket.emit("new-user-joined", name);

    // Socket.IO event listeners
    socket.on("user-joined", (name) => {
      appendMessage(`${name} joined the chat`, "right");
    });

    socket.on("receive", (data) => {
      appendMessage(`${data.user}: ${data.message}`, "left");
    });

    return () => {
      socket.off("user-joined");
      socket.off("receive");
    };
  }, []);

  useEffect(() => {
    // Fetch existing messages from the backend
    const fetchMessages = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/messages"); // API endpoint to get messages
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  // Handle sending a new message
  const sendMessage = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (input.trim()) {
      appendMessage(`You: ${input}`, "right"); // Append message to the chat
      socket.emit("send", input); // Emit the message to the server via Socket.IO
      setInput(""); // Clear input field
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg text-white ${
              msg.position === "right"
                ? "bg-blue-500 text-right"
                : "bg-gray-500 text-left"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <form className="flex p-4 border-t bg-white" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          placeholder="Type a message"
        />
        <button
          type="submit" // Ensure the button type is submit to handle form submission
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
}

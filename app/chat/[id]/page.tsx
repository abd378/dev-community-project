"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  major: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  file_url: string | null;
  file_type: string | null;
  audio_url: string | null;
};

type Presence = {
  user_id: string;
  is_online: boolean;
  is_typing: boolean;
  typing_to: string | null;
  last_seen: string;
};

export default function DirectChatPage() {
  const params = useParams();
  const router = useRouter();
  const receiverId = params.id as string;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [currentUserId, setCurrentUserId] = useState("");
  const [receiver, setReceiver] = useState<Profile | null>(null);
  const [receiverPresence, setReceiverPresence] = useState<Presence | null>(null);

  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupChat();

    return () => {
      setOffline();
    };
  }, []);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    loadMessages(conversationId);

    const messagesChannel = supabase
      .channel(`room-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async () => {
          await loadMessages(conversationId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (!receiverId) return;

    loadReceiverPresence();

    const presenceChannel = supabase
      .channel(`presence-${receiverId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
          filter: `user_id=eq.${receiverId}`,
        },
        async () => {
          await loadReceiverPresence();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [receiverId]);

  const setupChat = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUserId(user.id);

    await supabase.from("user_presence").upsert({
      user_id: user.id,
      is_online: true,
      is_typing: false,
      typing_to: null,
      last_seen: new Date().toISOString(),
    });

    await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user.id)
      .eq("sender_id", receiverId)
      .eq("type", "message");

    window.dispatchEvent(new Event("notifications-updated"));

    const { data: receiverData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, major")
      .eq("id", receiverId)
      .single();

    if (receiverData) setReceiver(receiverData);

    const { data: existingMembers } = await supabase
      .from("conversation_members")
      .select("conversation_id, user_id");

    let existingConversation = "";
    const grouped: Record<string, string[]> = {};

    (existingMembers || []).forEach((item) => {
      if (!grouped[item.conversation_id]) grouped[item.conversation_id] = [];
      grouped[item.conversation_id].push(item.user_id);
    });

    Object.entries(grouped).forEach(([chatId, users]) => {
      if (users.includes(user.id) && users.includes(receiverId)) {
        existingConversation = chatId;
      }
    });

    if (existingConversation) {
      setConversationId(existingConversation);
      setLoading(false);
      return;
    }

    const { data: newConversation } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();

    if (!newConversation) {
      setLoading(false);
      return;
    }

    await supabase.from("conversation_members").insert([
      { conversation_id: newConversation.id, user_id: user.id },
      { conversation_id: newConversation.id, user_id: receiverId },
    ]);

    setConversationId(newConversation.id);
    setLoading(false);
  };

  const setOffline = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("user_presence").upsert({
      user_id: user.id,
      is_online: false,
      is_typing: false,
      typing_to: null,
      last_seen: new Date().toISOString(),
    });
  };

  const loadReceiverPresence = async () => {
    const { data } = await supabase
      .from("user_presence")
      .select("*")
      .eq("user_id", receiverId)
      .single();

    setReceiverPresence(data || null);
  };

  const loadMessages = async (id: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    setMessages(data || []);

    const unreadMessages =
      data?.filter(
        (message) =>
          message.sender_id !== currentUserId && message.is_read === false
      ) || [];

    if (unreadMessages.length > 0) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .in(
          "id",
          unreadMessages.map((message) => message.id)
        );
    }
  };

  const handleTyping = async (value: string) => {
    setMessageText(value);

    if (!currentUserId) return;

    await supabase.from("user_presence").upsert({
      user_id: currentUserId,
      is_online: true,
      is_typing: true,
      typing_to: receiverId,
      last_seen: new Date().toISOString(),
    });

    if (typingTimer) clearTimeout(typingTimer);

    const timer = setTimeout(async () => {
      await supabase.from("user_presence").upsert({
        user_id: currentUserId,
        is_online: true,
        is_typing: false,
        typing_to: null,
        last_seen: new Date().toISOString(),
      });
    }, 1200);

    setTypingTimer(timer);
  };

  const uploadFile = async () => {
    if (!selectedFile || !conversationId) return { fileUrl: "", fileType: "" };

    setUploading(true);

    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${conversationId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("chat-files")
      .upload(fileName, selectedFile);

    if (error) {
      console.log(error);
      setUploading(false);
      return { fileUrl: "", fileType: "" };
    }

    const { data } = supabase.storage.from("chat-files").getPublicUrl(fileName);

    setUploading(false);

    return {
      fileUrl: data.publicUrl,
      fileType: selectedFile.type || "file",
    };
  };

  const uploadAudio = async (audioBlob: Blob) => {
    if (!conversationId) return "";

    const fileName = `${conversationId}/voice-${Date.now()}.webm`;

    const { error } = await supabase.storage
      .from("chat-files")
      .upload(fileName, audioBlob, {
        contentType: "audio/webm",
      });

    if (error) {
      console.log(error);
      return "";
    }

    const { data } = supabase.storage.from("chat-files").getPublicUrl(fileName);

    return data.publicUrl;
  };

  const sendMessage = async () => {
    if ((!messageText.trim() && !selectedFile) || !conversationId || !receiver) {
      return;
    }

    const text = messageText;
    const fileBeforeSend = selectedFile;

    setMessageText("");

    await supabase.from("user_presence").upsert({
      user_id: currentUserId,
      is_online: true,
      is_typing: false,
      typing_to: null,
      last_seen: new Date().toISOString(),
    });

    const uploaded = await uploadFile();

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: text || (fileBeforeSend ? fileBeforeSend.name : ""),
      is_read: false,
      file_url: uploaded.fileUrl || null,
      file_type: uploaded.fileType || null,
      audio_url: null,
    });

    if (error) {
      console.log(error);
      return;
    }

    setSelectedFile(null);

    await supabase.from("notifications").insert({
      user_id: receiver.id,
      sender_id: currentUserId,
      type: "message",
      content: fileBeforeSend ? "sent you a file." : "sent you a new message.",
      is_read: false,
    });

    await loadMessages(conversationId);
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const startRecording = async () => {
    if (!conversationId || !receiver) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const audioUrl = await uploadAudio(audioBlob);

      if (!audioUrl) return;

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: "Voice message",
        is_read: false,
        file_url: null,
        file_type: null,
        audio_url: audioUrl,
      });

      await supabase.from("notifications").insert({
        user_id: receiver.id,
        sender_id: currentUserId,
        type: "message",
        content: "sent you a voice message.",
        is_read: false,
      });

      await loadMessages(conversationId);
      window.dispatchEvent(new Event("notifications-updated"));

      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const formatLastSeen = () => {
    if (!receiverPresence?.last_seen) return "Offline";
    return `Last seen ${new Date(receiverPresence.last_seen).toLocaleString()}`;
  };

  if (loading) {
    return <main className="chat-page">Loading chat...</main>;
  }

  return (
    <main className="chat-page">
      <section className="chat-container single-chat">
        <section className="chat-window">
          <div className="chat-header">
            <Link href="/chat" className="back-link">
              ←
            </Link>

            <div className="chat-avatar-wrapper">
              {receiver?.avatar_url ? (
                <img src={receiver.avatar_url} alt={receiver.full_name} />
              ) : (
                <span>
                  {receiver?.full_name
                    ? receiver.full_name.charAt(0).toUpperCase()
                    : "D"}
                </span>
              )}

              {receiverPresence?.is_online && <i className="online-dot"></i>}
            </div>

            <div>
              <h2>{receiver?.full_name || "Developer"}</h2>

              {receiverPresence?.is_typing &&
              receiverPresence.typing_to === currentUserId ? (
                <p className="typing-text">typing...</p>
              ) : receiverPresence?.is_online ? (
                <p className="online-text">Online</p>
              ) : (
                <p>{formatLastSeen()}</p>
              )}
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="chat-empty">No messages yet. Say hello 👋</p>
            ) : (
              messages.map((message, index) => {
                const isMine = message.sender_id === currentUserId;
                const isLastMine = isMine && index === messages.length - 1;
                const isImage = message.file_type?.startsWith("image/");

                return (
                  <div
                    key={message.id}
                    className={`chat-message ${
                      isMine ? "my-message" : "their-message"
                    }`}
                  >
                    {message.audio_url && (
                      <audio controls src={message.audio_url} className="chat-audio" />
                    )}

                    {message.file_url && isImage && (
                      <a href={message.file_url} target="_blank" rel="noreferrer">
                        <img
                          src={message.file_url}
                          alt="Chat upload"
                          className="chat-image"
                        />
                      </a>
                    )}

                    {message.file_url && !isImage && (
                      <a
                        href={message.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="chat-file-link"
                      >
                        📎 {message.content || "Open File"}
                      </a>
                    )}

                    {message.content &&
                      !message.file_url &&
                      !message.audio_url && <p>{message.content}</p>}

                    {isLastMine && (
                      <small className="seen-label">
                        {message.is_read ? "Seen" : "Delivered"}
                      </small>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {selectedFile && (
            <div className="selected-file-preview">
              <span>{selectedFile.name}</span>
              <button onClick={() => setSelectedFile(null)}>Remove</button>
            </div>
          )}

          {isRecording && (
            <div className="recording-preview">
              <span>Recording voice message...</span>
            </div>
          )}

          <div className="chat-input">
            <label className="file-upload-btn">
              +
              <input
                type="file"
                hidden
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </label>

            <button
              type="button"
              className={isRecording ? "record-btn recording" : "record-btn"}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? "Stop" : "🎤"}
            </button>

            <input
              type="text"
              placeholder="Write a message..."
              value={messageText}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button onClick={sendMessage} disabled={uploading}>
              {uploading ? "Sending..." : "Send"}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
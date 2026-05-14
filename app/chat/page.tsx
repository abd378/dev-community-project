"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type MemberRow = {
  conversation_id: string;
  user_id: string;
};

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
};

type Presence = {
  user_id: string;
  is_online: boolean;
};

export default function ChatInboxPage() {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState("");
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInbox();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("chat-inbox-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        async () => {
          await loadInbox();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
        },
        async () => {
          await loadInbox();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const loadInbox = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUserId(user.id);

    const { data: myConversations } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", user.id);

    const conversationIds =
      myConversations?.map((item) => item.conversation_id) || [];

    if (conversationIds.length === 0) {
      setMembers([]);
      setProfiles([]);
      setMessages([]);
      setPresence([]);
      setLoading(false);
      return;
    }

    const { data: allMembers } = await supabase
      .from("conversation_members")
      .select("conversation_id, user_id")
      .in("conversation_id", conversationIds);

    setMembers(allMembers || []);

    const otherUserIds =
      allMembers
        ?.filter((member) => member.user_id !== user.id)
        .map((member) => member.user_id) || [];

    if (otherUserIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, major")
        .in("id", otherUserIds);

      setProfiles(profileData || []);

      const { data: presenceData } = await supabase
        .from("user_presence")
        .select("user_id, is_online")
        .in("user_id", otherUserIds);

      setPresence(presenceData || []);
    }

    const { data: messageData } = await supabase
      .from("messages")
      .select("*")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    setMessages(messageData || []);
    setLoading(false);
  };

  const getOtherUser = (conversationId: string) => {
    const otherMember = members.find(
      (member) =>
        member.conversation_id === conversationId &&
        member.user_id !== currentUserId
    );

    return profiles.find((profile) => profile.id === otherMember?.user_id);
  };

  const getPresence = (userId: string) => {
    return presence.find((item) => item.user_id === userId);
  };

  const getLastMessage = (conversationId: string) => {
    return messages.find((message) => message.conversation_id === conversationId);
  };

  const getUnreadCount = (conversationId: string) => {
    return messages.filter(
      (message) =>
        message.conversation_id === conversationId &&
        message.sender_id !== currentUserId &&
        message.is_read === false
    ).length;
  };

  const conversationIds = Array.from(
    new Set(members.map((member) => member.conversation_id))
  ).sort((a, b) => {
    const aMsg = getLastMessage(a);
    const bMsg = getLastMessage(b);

    return (
      new Date(bMsg?.created_at || 0).getTime() -
      new Date(aMsg?.created_at || 0).getTime()
    );
  });

  if (loading) {
    return <main className="chat-page">Loading chats...</main>;
  }

  return (
    <main className="chat-page">
      <section className="chat-inbox-card">
        <div className="chat-inbox-header">
          <p className="posts-badge">Messages</p>
          <h1>Your Chats</h1>
          <p>Open saved conversations and continue messaging developers.</p>
        </div>

        {conversationIds.length === 0 ? (
          <p className="chat-empty">
            No conversations yet. Go to Developers and click Message.
          </p>
        ) : (
          <div className="chat-inbox-list">
            {conversationIds.map((conversationId) => {
              const user = getOtherUser(conversationId);
              const lastMessage = getLastMessage(conversationId);
              const unreadCount = getUnreadCount(conversationId);
              const userPresence = user ? getPresence(user.id) : null;

              if (!user) return null;

              return (
                <Link
                  href={`/chat/${user.id}`}
                  className="chat-inbox-item"
                  key={conversationId}
                >
                  <div className="chat-inbox-avatar">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} />
                    ) : (
                      <span>
                        {user.full_name
                          ? user.full_name.charAt(0).toUpperCase()
                          : "D"}
                      </span>
                    )}

                    {userPresence?.is_online && <i></i>}
                  </div>

                  <div className="chat-inbox-content">
                    <h3>{user.full_name || "Developer"}</h3>

                    <p className={unreadCount > 0 ? "unread-preview" : ""}>
                      {lastMessage
                        ? lastMessage.sender_id === currentUserId
                          ? `You: ${lastMessage.content}`
                          : lastMessage.content
                        : "Open conversation"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <strong className="unread-badge">{unreadCount}</strong>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
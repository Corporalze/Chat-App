import React, { useEffect, useRef, useState } from 'react';
import "./chat.css";
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import { formatDistanceToNow } from 'date-fns';

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState();
  const [message, setMessage] = useState('');
  const { chatId, user } = useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setMessage((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (message === "") return;

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          sendId: currentUser.id,
          text: message,
          createdAt: new Date(),
        })
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userChat", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();
          const chatIndex = userChatData.chats.findIndex(c => c.chatId === chatId);

          userChatData.chats[chatIndex].lastMessage = message;
          userChatData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatData.chats,
          });
        }
      });

      const userChatsRef = doc(db, "userChat", currentUser.id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatData = userChatsSnapshot.data();
        const chatIndex = userChatData.chats.findIndex(c => c.chatId === chatId);

        userChatData.chats[chatIndex].lastMessage = message;
        userChatData.chats[chatIndex].isSeen = true;
        userChatData.chats[chatIndex].updatedAt = Date.now();

        await updateDoc(userChatsRef, {
          chats: userChatData.chats,
        });
      }

      // Clear the message input after sending
      setMessage('');

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className='chat'>

      <div className="top">
        <div className="user">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <span>Ibtihaj Irfan</span>
            <p>dumbass, sassy bitch, baby, princess</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="info.png" alt="" />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div className={`message ${message.sendId === currentUser.id ? "own" : ""}`} key={index}>
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              <span>{formatDistanceToNow(new Date(message.createdAt.seconds * 1000))} ago</span>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder='Type a message...'
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSend(e);
            }
          }}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          {open && (
            <div className="picker">
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <button className='sendButton' onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chat;

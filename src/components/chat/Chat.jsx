import React, { useEffect, useRef, useState } from 'react';
import "./chat.css";
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';
import uploadVideo from '../../lib/uploadVideo';
import Detail from '../detail/Detail';

const Chat = ({ onToggleDetail }) => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState();
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [vid, setVid] = useState({
    file: null,
    url: "",
  });
  const { chatId, user } = useChatStore();
  const { currentUser } = useUserStore();
  const [detailVisible, setDetailVisible] = useState(false);
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

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
      e.target.value = ''; // Clear the input value
    }
  };

  const handleVid = (e) => {
    if (e.target.files[0]) {
      setVid({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
      e.target.value = ''; // Clear the input value
    }
  };

  const handleEmoji = (e) => {
    setMessage((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (message === "" && !img.file && !vid.file) return;

    let imgUrl = null;
    let vidUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      if (vid.file) {
        vidUrl = await uploadVideo(vid.file);
      }
      const newMessage = {
        sendId: currentUser.id,
        text: message,
        createdAt: new Date(),
        ...(imgUrl && { img: imgUrl }),
        ...(vidUrl && { video: vidUrl }),
      };

      if (replyTo) {
        newMessage.replyTo = replyTo;
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(newMessage)
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

      setMessage('');
      setReplyTo(null);

    } catch (err) {
      console.log(err);
    }

    setImg({
      file: null,
      url: ""
    });
    setVid({
      file: null,
      url: "",
    });
  };

  const toggleDetailVisibility = () => {
    setDetailVisible((prev) => !prev);
  };

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username || "Unknown User"}</span>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="info.png" alt="" onClick={onToggleDetail} />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div
            className={`message ${message.sendId === currentUser.id ? "own" : ""}`}
            key={index}
            onClick={() => setReplyTo(message)}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              {message.replyTo && (
                <div className={`reply ${message.sendId === currentUser.id ? 'left' : 'right'}`}>
                  <p><strong>Replying to:</strong> {message.replyTo.text}</p>
                </div>
              )}
              <p>{message.text}</p>
              {index === chat.messages.length - 1 && (
                <span>{formatDistanceToNow(new Date(message.createdAt.seconds * 1000))} ago</span>
              )}
            </div>
          </div>
        ))}

        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        {vid.url && (
          <div className="message own">
            <div className="texts">
              <video src={vid.url} controls />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        {replyTo && (
          <div className="replying">
            <p>Reply: {replyTo.text.length > 19 ? replyTo.text.substring(0, 19) + '...' : replyTo.text} <span onClick={() => setReplyTo(null)}>Cancel</span></p>
          </div>
        )}
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id='file' style={{ display: "none" }} onChange={handleImg} />
          <label htmlFor="vid">
            <img src="./camera.png" alt="" />
          </label>
          <input type="file" id='vid' style={{ display: "none" }} onChange={handleVid} />
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

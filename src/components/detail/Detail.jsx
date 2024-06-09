import React, { useState, useEffect } from 'react';
import './detail.css';
import { auth, db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { doc, getDoc } from 'firebase/firestore';

const Detail = () => {
  const { user, chatId } = useChatStore();
  const [sharedPhotos, setSharedPhotos] = useState([]);
  const [photosVisible, setPhotosVisible] = useState(true);

  useEffect(() => {
    const fetchSharedPhotos = async () => {
      if (!chatId) return;

      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const photos = chatData.messages
          .filter((message) => message.img)
          .map((message) => ({ url: message.img, text: message.text }));

        setSharedPhotos(photos);
      }
    };

    fetchSharedPhotos();
  }, [chatId]);

  const handleDownload = (imageUrl, imageName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='detail'>
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username || "Unknown User"}</h2>
      </div>

      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title" onClick={() => setPhotosVisible(!photosVisible)}>
            <span>Shared photos</span>
            <img src={photosVisible ? "./arrowDown.png" : "./arrowUp.png"} alt="" />
          </div>
          {photosVisible && (
            <div className="photos">
              {sharedPhotos.map((photo, index) => (
                <div className="photoItem" key={index}>
                  <div className="photoDetail">
                    <img src={photo.url} alt={`shared-photo-${index}`} />
                    <span>{photo.text}</span>
                  </div>
                  <img
                    src="./download.png"
                    alt="download"
                    className='icon'
                    onClick={() => handleDownload(photo.url, `shared-photo-${index}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button>Block User</button>
        <button className='logout' onClick={() => auth.signOut()}>Logout</button> 
      </div>
    </div>
  );
}

export default Detail;
import { useEffect, useState } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [detailVisible, setDetailVisible] = useState(false);
  const [listVisible, setListVisible] = useState(true);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  const toggleDetailVisibility = () => {
    setDetailVisible((prev) => !prev);
  };
  const toggleListVisibility = () => {
    setListVisible((prev) => !prev);
  }

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className='container'>
      {
        currentUser ? (
        <>
          {listVisible && <List/>}
          {chatId && <Chat onToggleDetail={toggleDetailVisibility} onToggleList={toggleListVisibility} />}  {/* Pass the toggle function */}
          {chatId && detailVisible && <Detail />}  {/* Conditionally render the Detail component */}
        </>
        ) : (<Login />)
      }
      <Notification/>
    </div>
  );
};

export default App;

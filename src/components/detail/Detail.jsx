import React from 'react'
import "./detail.css"
import { auth } from '../../lib/firebase'

const Detail = () => {
  return (
    <div className='detail'>
      <div className="user">
        <img src="./avatar.png" alt="" />
        <h2>Ibtihaj Irfan</h2>
        <p>wifey</p>
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
          <div className="title">
            <span>Shared photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./bg.jpg" alt="" />
                <span>background.jpg</span> 
              </div>
              <img src="./download.png" alt="" className='icon'/>
            </div>
          </div>
        </div>
        
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button>Block User</button>
        <button className='logout' onClick={()=>auth.signOut()}>Logout</button> 
      </div>
    </div>
  )
}

export default Detail
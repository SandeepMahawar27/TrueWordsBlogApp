import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ReactTimeAgo from "react-time-ago";
import TimeAgo from "javascript-time-ago";

import en from 'javascript-time-ago/locale/en.json';
import ru from 'javascript-time-ago/locale/ru.json';

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(ru);

const PostAuther = ({ createdAt, authorID }) => {
  const [author, setAuthor] = useState([]);

  useEffect(() => {
    const getAuthor = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/${authorID}`);
        setAuthor(response?.data);
      } catch (err) {
        console.log(err);
      } 
    };
    // Call the getAuthor function when the component mounts
    getAuthor();
  }, [authorID]); 

  const avatarUrl = `${process.env.REACT_APP_ASSETS_URL}/uploads/${author?.avatar}`
  // console.log(avatarUrl);

  return (
    <div>
      <Link to={`/posts/users/${authorID}`} className="post_author"> 
        <div className="post_author-avtar">
          <img src={avatarUrl} alt="" />
        </div>
        <div className="post_author-details">
          {/* Display the author's name dynamically */}
          <h4>By: {author?.name}</h4>
          <small><ReactTimeAgo date={new Date(createdAt)} locale="en-US" /></small>
        </div>
      </Link>
    </div>
  );
};

export default PostAuther;

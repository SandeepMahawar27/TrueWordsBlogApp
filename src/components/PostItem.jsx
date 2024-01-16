// PostItem.js

import React from 'react';
import { Link } from 'react-router-dom'; 
import PostAuther from './PostAuther';

const PostItem = ({ postID, category, title, description, authorID, thumbnail, createdAt }) => {
  const shortDescription = description.length > 145 ? description.substr(0, 145) + ' ...' : description;
  const postTitle = title.length > 30 ? title.substr(0, 30) + '...' : title;

  // const imageUrl = `${process.env.REACT_APP_ASSETS_URL}/uploads/${thumbnail}`;
  // console.log(imageUrl);
  // const thumbnailStyle = {
  //   backgroundImage: `url(${imageUrl})`,
  //   backgroundSize: 'cover',
  //   backgroundPosition: 'center',
  //   width: '100%',
  //   height: '200px', // Adjust the height as needed
  //   // Add any additional styling properties here
  //   borderRadius: '8px', // Example: rounded corners
  //   boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Example: box shadow
  // };
  // style={thumbnailStyle}

  return (
    <article className='post'>
      <div className="post_thumbnail" >
        <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${thumbnail}`} alt={postTitle} />
      </div>
      <div className="post_content">   
        <Link to={`/posts/${postID}`}>
          <h3>{postTitle}</h3>
        </Link>
        <p dangerouslySetInnerHTML={{ __html: shortDescription }}/>
        <div className="post_footer">
          <PostAuther authorID={authorID} createdAt={createdAt} />
          <Link to={`/posts/categories/${category}`} className='btn category'>{category}</Link>
        </div>
      </div>
    </article>
  );
};

export default PostItem;

import React, { useEffect, useState } from "react";
import PostItem from "./PostItem";
import Loader from "../components/Loader";
import axios from 'axios';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`);
        setPosts(response.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Error fetching posts. Please try again later.");
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="posts">
      <div className="container posts_container">
        {error ? (
          <h2 className="center">{error}</h2>
        ) : posts.length > 0 ? (
          posts.map((post) => {
            const { _id: id, thumbnail, category, title, description, creator, createdAt } = post;
            return (
              <PostItem
                key={id}
                postID={id}
                thumbnail={thumbnail}
                category={category}
                title={title}
                description={description}
                authorID={creator} 
                createdAt={createdAt}
              />
            );
          })
        ) : (
          <h2 className="center">No Posts Found...</h2>
        )}
      </div>
    </section>
  );
};

export default Posts;

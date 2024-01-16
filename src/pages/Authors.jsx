import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../components/Loader'
 
const Authors = () => {
  const [authors, setAuthors] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect( () => {
      const getAuthors = async () => {
        setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users`);
        setAuthors(response.data);
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    }
    getAuthors();
  }, [])
  if(isLoading){
    return <Loader/>
  }
  return (
    <section className='authors'>
      {authors.length > 0 ? <div className="container authors_container">
        {
          authors.map( (author) => {
            const { _id: id, avatar, name, posts } = author;
            return <Link to={`/posts/users/${id}`} key={id} className='author'>
              <div className="author_avatar">
                <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${avatar}`} alt={`${name}`} /> 
              </div>
              <div className='author_info'>
                 <h4>{name}</h4>
                 <p>{posts}</p>
              </div>
            </Link>
          })
        }
      </div>: <h2 className='center'>No Users/authors found.</h2>}

    </section>
  )
}

export default Authors
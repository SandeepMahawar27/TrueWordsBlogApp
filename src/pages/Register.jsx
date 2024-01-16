import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    password2: ""
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // New state for loading
  const navigate = useNavigate();

  const changeInputHandler = (e) => {
    setUserData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
  }

  const registerUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Set loading state to true

    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/users/register`, userData);
      const newUser = response.data;

      if (!newUser) {
        setError("Couldn't register user. Please try again.");
      } 
      else {
        // Redirect to a different page on successful registration
        navigate('/login');
      }
    } catch (err) {
      setError(err.response.data.message);
    } 
    // finally {
    //   setLoading(false); // Reset loading state
    // }
  }

  return (
    <section className='register'>
      <div className="container">
        <h2>Sign Up</h2>
        <form action="" className="form register_form" onSubmit={registerUser}>
          {error && <p className="form_error-message">{error}</p>}
          <input type="text" placeholder='Full Name' name='name' value={userData.name} 
            onChange={changeInputHandler} autoFocus
          />
          <input type="email" placeholder='Email' name='email' value={userData.email} 
            onChange={changeInputHandler} autoFocus
          />
          <input type="password" placeholder='Password' name='password' value={userData.password} 
            onChange={changeInputHandler} autoFocus
          />
          <input type="password" placeholder='Confirm Password' name='password2'  value={userData.password2}
            onChange={changeInputHandler} autoFocus
          />
          <button type='submit' className={`btn primary ${loading ? 'disabled' : ''}`} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <small>Already have an account? <Link to="/login">Sign In</Link></small>
      </div>
    </section>
  );
}

export default Register;

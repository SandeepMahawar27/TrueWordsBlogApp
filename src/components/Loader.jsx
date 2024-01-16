import React from 'react'
import LoadingGif from '../assests/loading.gif'

const Loader = () => {
  return (
    <div className='loder'>
    <div className="loader_image">
        <img src={LoadingGif} alt="" />
    </div>
    </div>
  )
}

export default Loader
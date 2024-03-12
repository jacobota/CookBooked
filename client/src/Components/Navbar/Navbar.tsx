import React from 'react'
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div>
      <Link className="nav-link" to='/'>Wall</Link>
      <Link className='nav-link' to='/login'>Login</Link>
      <Link className='nav-link' to='/account'>Account</Link>
      <Link className='nav-link' to='/browse'>Browse Recipes</Link>
      <Link className='nav-link' to='/recipe'>Recipe</Link>
      <Link className='nav-link' to='/review'>Review</Link>
    </div>
  )
}

export default Navbar
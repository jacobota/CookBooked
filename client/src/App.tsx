import React from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { Route, Routes } from "react-router-dom";
import Wall from './Components/Wall/Wall';
import Login from './Components/Login/Login';
import Account from './Components/Account/Account';
import BrowseRecipes from './Components/BrowseRecipes/BrowseRecipes';
import Recipe from './Components/Recipe/Recipe';
import Review from './Components/Review/Review';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path='/' element={<Wall />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/account' element={<Account />}></Route>
        <Route path='/browse' element={<BrowseRecipes />}></Route>
        <Route path='/recipe' element={<Recipe />}></Route>
        <Route path='/review' element={<Review />}></Route>
      </Routes>
    </div>
  );
}

export default App;

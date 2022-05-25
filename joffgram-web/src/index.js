import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from '@chakra-ui/react'

import HomePage from './pages/HomePage';
import AccDetailPage from './pages/AccDetailPage';
import PostDetailPage from './pages/PostDetailPage';
import ExplorePage from './pages/ExplorePage';
import PrivateChatPage from './pages/PrivateChatPage';

import 'bootstrap/dist/css/bootstrap.min.css';


const homePageEl = document.getElementById('home-page')
if (homePageEl) {
  const homePage = ReactDOM.createRoot(homePageEl)
  homePage.render(<ChakraProvider>
    <React.StrictMode>
        <HomePage dataset={homePageEl.dataset} />
    </React.StrictMode>
  </ChakraProvider>)
} 

const accDetailEl = document.getElementById('acc-detail')
if (accDetailEl) {
  const accDetailPage = ReactDOM.createRoot(accDetailEl)
  accDetailPage.render(<ChakraProvider>
    <React.StrictMode>
        <AccDetailPage dataset={accDetailEl.dataset} />
    </React.StrictMode>
  </ChakraProvider>)
} 

const postDetailEl = document.getElementById('post-detail')
if (postDetailEl) {
  const postDetailPage = ReactDOM.createRoot(postDetailEl)
  postDetailPage.render(<ChakraProvider>
    <React.StrictMode>
        <PostDetailPage dataset={postDetailEl.dataset} />
    </React.StrictMode>
  </ChakraProvider>)
} 

const privateChatEl = document.getElementById('private-chat')
if (privateChatEl) {
  const privateChatPage = ReactDOM.createRoot(privateChatEl)
  privateChatPage.render(<ChakraProvider>
    <React.StrictMode>
        <PrivateChatPage dataset={privateChatEl.dataset} />
    </React.StrictMode>
  </ChakraProvider>)
} 

const explorePageEl = document.getElementById('explore-page')
if (explorePageEl) {
  const explorePage = ReactDOM.createRoot(explorePageEl)
  explorePage.render(<ChakraProvider>
    <React.StrictMode>
        <ExplorePage dataset={explorePageEl.dataset} />
    </React.StrictMode>
  </ChakraProvider>)
} 


reportWebVitals();

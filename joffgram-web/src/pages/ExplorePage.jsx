import React, { useEffect, useState } from 'react'
import { fetchGetExplorePosts } from '../utils'
import PostTileList from '../components/post/PostTileList'


const ExplorePage = ({ dataset }) => {
    const { userId } = dataset
    const [posts, setPosts] = useState([])

    useEffect(() => {
        fetchGetExplorePosts((response, status) => {
            if (status === 200) {
                setPosts(response)
            }
        })
    }, [])


  return (
    <div>
        <br /><br /><br /><br />
        <PostTileList posts={posts} showPostInModal userId={userId} />
    </div>
  )
}

export default ExplorePage
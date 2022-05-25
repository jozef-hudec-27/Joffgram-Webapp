import React, { useState, useEffect } from 'react'
import { fetchGetAccountDetail, makeToast, fetchRemoveFollowee, errorToast, fetchGetUserFollowers, fetchGetUserFollowing, fetchGetSavedPosts,
    fetchGetUserStories } from '../utils'
import Loading from '../components/Loading'
import { Box, useToast, VStack, Text, Button } from '@chakra-ui/react'
import ProfileDetailBadge from '../components/ProfileDetailBadge'
import PostTileList from '../components/post/PostTileList'
import AccListModal from '../components/AccListModal'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import AlertDialogComponent from '../components/AlertDialogComponent'
import ModalComponent from '../components/ModalComponent'
import StoryComponent from '../components/stories/StoryComponent'
import AddStoryModal from '../components/stories/AddStoryModal'


const AccDetailPage = ({ dataset }) => {
    const { path, userId } = dataset // userId => US
    const [details, setDetails] = useState(null)
    const toast = useToast()
    const [error, setError] = useState(false)
    const [openRemoveFol, setOpenRemoveFol] = useState(false)
    const [fake, setFake] = useState(0)
    const [loadingButtons, setLoadingButtons] = useState({
        accept: false, decline: false, follow: false, cancel: false, remove: false
    })
    let accId = path.split('/')[2] // accId => THEM
    const [savedPosts, setSavedPosts] = useState([])

    const [stories, setStories] = useState([])
    const [storyIndex, setStoryIndex] = useState(0)
    const [browsingStories, setBrowsingStories] = useState(false)
    const [storyComment, setStoryComment] = useState('')
    const [storyFile, setStoryFile] = useState(null)
    const [seeAddStoryModal, setSeeAddStoryModal] = useState(false)
    const [seeExitAddStory, setSeeExitAddStory] = useState(false)

    const [followers, setFollowers] = useState([])
    const [nextFollowersUrl, setNextFollowersUrl] = useState(null)
    const [seeFollowers, setSeeFollowers] = useState(false)

    const [following, setFollowing] = useState([])
    const [nextFollowingUrl, setNextFollowingUrl] = useState(null)
    const [seeFollowing, setSeeFollowing] = useState(false)


    useEffect(() => {
        fetchGetAccountDetail(accId, (response, status) => {
            if (status === 200) {
                setDetails(response)
            } else {
                makeToast(toast, 'errorFetchUser', 'Error!', 'Could not find user profile. Make sure the profile exists or try again later.', 'error', 10000)
            }
        })

        fetchGetUserFollowers(accId, (response, status) => {
            if (status === 200) {
                setFollowers(response.results)
                setNextFollowersUrl(response.next)
            } else {
                console.log('cannot fetch followers')
        }
        })

        fetchGetUserFollowing(accId, (response, status) => {
            if (status === 200) {
                setFollowing(response.results)
                setNextFollowingUrl(response.next)
            } else {
                console.log('cannot fetch following')
            }
        })

        if (accId === userId) {
            fetchGetSavedPosts(accId, (response, status) => {
                if (status === 200) {
                    setSavedPosts(response)
                }
            })
        }      
    }, [])

    useEffect(() => {
        if (accId === userId || details?.we_follow_them === true) { 
            fetchGetUserStories(accId, (response, status) => {
                if (status === 200) {
                    setStories(response)
                }
            })
        }
    }, [details?.we_follow_them])

  return (
    <Box>
        <br /><br /><br /> <br />
        {error === false && details === null && <Loading />}
        {error === false && details !== null && <Box align='center'>
                <br />
                <Box className='profileDetails' ml='25%'>
                    <ProfileDetailBadge details={details} loadingButtons={loadingButtons} setLoadingButtons={setLoadingButtons} fake={fake}
                        setFake={setFake} toast={toast} setOpenRemoveFol={setOpenRemoveFol} seeFollowers={seeFollowers} setSeeFollowers={setSeeFollowers}
                        seeFollowing={seeFollowing} setSeeFollowing={setSeeFollowing} stories={stories} setBrowsingStories={setBrowsingStories} 
                        setSeeAddStoryModal={setSeeAddStoryModal} />
                </Box>
                <br />
                {(!details.is_private || (details.is_private && details.we_follow_them) || details.is_self) ? (
                    <Box className='posts'>
                        <Tabs w='62%'>
                            <TabList>
                                <Tab>Posts</Tab>
                                {details.is_self && <Tab>Saved</Tab>}
                            </TabList>

                            <TabPanels>
                                <TabPanel>
                                {details.posts.length ? (
                                    <PostTileList posts={details.posts} />) :
                                    <Text as='sup'>No posts...</Text>}
                                </TabPanel>
                                
                                {details.is_self && <TabPanel>
                                        {savedPosts.length ? (
                                            <PostTileList posts={savedPosts} />) :
                                            <Text as='sup'>No saved posts...</Text>}
                                    </TabPanel>
                                }
                                
                            </TabPanels>
                        </Tabs><br />
                        

                    </Box>
                ) : <>
                    <hr width='62%'/><br />
                    <VStack spacing={2}>
                        <Text style={{fontWeight: 'bold'}}>This Account is Private</Text>
                        <Text>Follow to see their photos</Text>
                    </VStack>
                </>}
                <br />
        </Box>}

        <AlertDialogComponent isOpen={openRemoveFol} onClose={() => setOpenRemoveFol(false)} header='Cancel Follow'
            body={`Are you sure you want to stop following @${details?.username}?`} cancelBtnName='No' mainBtn={
                <Button colorScheme='red' onClick={e => {
                    setLoadingButtons({ ...loadingButtons, remove: true })
                    fetchRemoveFollowee(details.id, (response, status) => {
                        setLoadingButtons({ ...loadingButtons, remove: false })
                        if (status === 200) {
                            details.we_follow_them = false         
                            details.is_message_allowed = false                   
                            setOpenRemoveFol(false)
                        } else { setOpenRemoveFol(false); errorToast(toast) }
                    })
                }} ml={3} isLoading={loadingButtons.remove}>
                    Yes
                </Button>
            } />

        <AccListModal isOpen={seeFollowers === true} onClose={() => setSeeFollowers(false)} users={followers} nextUsersUrl={nextFollowersUrl}
            header='Followers' isFollowerList setFollowers={setFollowers} isSelf={details?.is_self} details={details} />
        <AccListModal isOpen={seeFollowing === true} onClose={() => setSeeFollowing(false)} users={following} nextUsersUrl={nextFollowingUrl}
            header='Following' />
        
        <ModalComponent isOpen={browsingStories} onClose={() => {
            setBrowsingStories(false); setStoryComment('')
        }} size='full' body={
            <StoryComponent stories={stories} details={details} storyIndex={storyIndex} setStoryIndex={setStoryIndex}
                storyComment={storyComment} setStoryComment={setStoryComment} />
        } />

        <AddStoryModal storyFile={storyFile} setStoryFile={setStoryFile} isOpen={seeAddStoryModal} setSeeExitAddStory={setSeeExitAddStory}
            setSeeAddStoryModal={setSeeAddStoryModal} stories={stories} setStories={setStories} />

        <AlertDialogComponent isOpen={seeExitAddStory} onClose={() => setSeeExitAddStory(false)} header='Exit adding story' body="Are you sure? You can't undo this action afterwards."
            cancelBtnName='Cancel' mainBtn={
            <Button colorScheme='red' onClick={() => {
                setStoryFile(null)
                setSeeExitAddStory(false)
                setSeeAddStoryModal(false)
            }} ml={3}>
                Exit
            </Button>
        } />
    </Box>   
  )
}

export default AccDetailPage
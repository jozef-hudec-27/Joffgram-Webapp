import React from 'react'
import { fetchAcceptOrDeclineFollowRequest, fetchCancelFollowRequest, fetchSendFollowRequest, makeToast, errorToast } from '../utils'
import { Box, HStack, Avatar, VStack, Text, ButtonGroup, Button, IconButton } from '@chakra-ui/react'
import { FaUserCheck } from 'react-icons/fa'
import { CustomToggle } from './CustomToggle'
import PopoverComponent from './PopoverComponent'
import DropdownComponent from './DropdownComponent'


const ProfileDetailBadge = ({ details, loadingButtons, setLoadingButtons, fake, setFake, toast, setOpenRemoveFol, setSeeFollowers, setSeeFollowing,
     stories, setBrowsingStories, setSeeAddStoryModal }) =>  (
    <HStack spacing={5}>
        <Box className='avatarBox'>
            <Avatar name={details.username} src={details.profile_image} size='2xl' border={stories?.length > 0 ? '3px solid red' : '1px solid grey'} borderStyle={stories?.length > 0 && 'dobule'}
                cursor={stories?.length > 0 && 'pointer'} onClick={() => {
                    if (stories?.length > 0) {
                        setBrowsingStories(true)
                    }
                }} />
        </Box>

        <Box className='detailsBox'>
            <HStack spacing={8}>
                <VStack spacing='1px'>
                    <Text fontSize='2xl'>{details.username}</Text>
                    <Text fontSize='sm'>{details.fullname}</Text>
                </VStack>

                {!details.is_self && details.is_message_allowed === true && <Button onClick={() => window.location.href = '/chat/' + details.id}>Message</Button>}

                {details.is_self === false && <>
                    {[1, 12].includes(details.request_status) && <VStack spacing={1}>
                        <Text as='sup'>{details.username} wants to follow you</Text>
                        <ButtonGroup isAttached colorScheme='blue'>
                            <Button onClick={e => {
                                setLoadingButtons({ ...loadingButtons, accept: true })
                                fetchAcceptOrDeclineFollowRequest('accept', details.id, (response, status) => {
                                    setLoadingButtons({ ...loadingButtons, accept: false })
                                    if (status === 200) {
                                        details.they_follow_us = true
                                        details.request_status = details.request_status === 12 ? 2 : 3
                                        if (details.we_follow_them) { details.is_message_allowed = true }
                                        setFake(fake+1)
                                        makeToast(toast, 'acceptedRequest', '', `${details.username} now follows you!`, 'info', 5000, 'bottom-right')
                                    } else { errorToast(toast) }
                                })
                            }} isLoading={loadingButtons.accept}>Accept</Button>
                            <Button onClick={e => {
                                setLoadingButtons({ ...loadingButtons, decline: true })
                                fetchAcceptOrDeclineFollowRequest('decline', details.id, (response, status) => {
                                    setLoadingButtons({ ...loadingButtons, decline: false })
                                    if (status === 200) {
                                        details.request_status = details.request_status === 12 ? 2 : 3
                                        setFake(fake+1)
                                    } else { errorToast(toast) }
                                })
                            }} isLoading={loadingButtons.decline}>Decline</Button>
                        </ButtonGroup>
                    </VStack>
                    }

                    {details.request_status === 2 && <Button colorScheme='blue' onClick={e => {
                        setLoadingButtons({ ...loadingButtons, cancel: true })
                        fetchCancelFollowRequest(details.id, (response, status) => {
                            setLoadingButtons({ ...loadingButtons, cancel: false })
                            if (status === 200) {
                                details.request_status = 3
                                setFake(fake+1)
                            } else { errorToast(toast) }
                        })
                    }} isLoading={loadingButtons.cancel}>Cancel Request</Button>}

                    {details.request_status === 3 && <>
                        {!details.we_follow_them && <Button colorScheme='blue' onClick={e => {
                            setLoadingButtons({ ...loadingButtons, follow: true })
                            fetchSendFollowRequest(details.id, (response, status) => {
                                setLoadingButtons({ ...loadingButtons, follow: false })
                                if (status === 200) {
                                    const isPrivate = response.is_active
                                    if (isPrivate) {
                                        details.request_status = 2
                                        setFake(fake+1)
                                    } else {
                                        details.request_status = 3
                                        details.we_follow_them = true
                                        if (details.they_follow_us) { details.is_message_allowed = true }
                                        setFake(fake+1)
                                    }
                                } else { errorToast(toast) }
                            })
                        }} isLoading={loadingButtons.follow}>
                            {details.they_follow_us ? 'Follow Back' : 'Follow'}
                        </Button>
                        }

                        {details.we_follow_them && <IconButton aria-label='Cancel Follow' icon={<FaUserCheck />} onClick={() => setOpenRemoveFol(true)} />}
                    </>}
                </>}

                {details.is_self === true && (
                    <DropdownComponent toggle={CustomToggle} dropdownItemsActions={[
                        ['Add Story', () => setSeeAddStoryModal(true)],
                        ['Edit Profile', () => {window.location.href = `/accounts/${details.id}/edit/`}]
                ]} />
                )}
            </HStack>

            <HStack spacing={8} mt='5'>
                <Box><a style={{fontWeight: 'bold'}}>{details.posts.length} </a>posts</Box>
                <Box cursor='pointer' onClick={() => setSeeFollowers(true)}><a style={{fontWeight: 'bold'}}>{details.followers.length} </a>followers</Box>
                <Box cursor='pointer' onClick={() => setSeeFollowing(true)}><a style={{fontWeight: 'bold'}}>{details.following.length} </a>following</Box>
            </HStack>

            <Box align='left'>
                {details.bio && <>
                    <br />
                    <Text>{details.bio.substring(0, 50)}{details.bio.length > 50 && '... '}
                        {details.bio.length > 50 && <PopoverComponent btn='[See all]' header={`${details.username}'s BIO`} body={details.bio} />}
                    </Text>
                </>}
            </Box>
        </Box>
    </HStack>
)

export default ProfileDetailBadge
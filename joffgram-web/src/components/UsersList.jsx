import React from 'react'
import { Box, WrapItem, Avatar, Text } from '@chakra-ui/react'
import { fetchRemoveFollowee, fetchAcceptOrDeclineFollowRequest, fetchCancelFollowRequest, fetchSendFollowRequest } from '../utils'
import FollowOptionsBtn from './FollowOptionsBtn'


const UsersList = ({ users, fake, setFake }) => (
  users.map(user => (
     <Box>
      <WrapItem m='1'>
        <Avatar src={user.profile_image} name={user.username} style={{cursor: 'pointer', border: '1px solid grey'}} size='sm' onClick={() => window.location.href = '/accounts/' + user.id} />
        <Text mt='1' ml='1' style={{cursor: 'pointer'}} onClick={() => window.location.href = '/accounts/' + user.id}>{user.username}</Text>

        {user.we_follow_them === true && 
          <FollowOptionsBtn onBtnClick={
            () => {
              fetchRemoveFollowee(user.id, (response, status) => {
                if (status === 200) {
                  user.we_follow_them = false
                  setFake(fake+1)
                }
              })
            }
          } action='Remove Follow' />
        }
        
        {user.we_follow_them === false && [1, 12].includes(user.request_status) ? 
          <FollowOptionsBtn onBtnClick={
            () => {
              fetchAcceptOrDeclineFollowRequest('accept', user.id, (response ,status) => {
                if (status === 200) {
                  user.they_follow_us = true
                  user.request_status = user.request_status == 12 ? 2 : 3
                  setFake(fake+1)
                }
              })
            }
          } action='Accept' />
        : user.request_status == 2 ?

        <FollowOptionsBtn onBtnClick={
          () => {
            fetchCancelFollowRequest(user.id, (response, status) => {
              if (status === 200) {
                user.request_status = 3
                setFake(fake+1)
              }
            })
          }
        } action='Cancel Request' />
        : !user.we_follow_them &&
        
        <FollowOptionsBtn onBtnClick={
          () => {
            fetchSendFollowRequest(user.id, (response, status) => {
              if (status === 200) {
                const isPrivate = response.is_active
                if (isPrivate) {
                  user.request_status = 2
                  setFake(fake+1)
                } else {
                  user.we_follow_them = true
                  user.request_status = 3
                  setFake(fake+1)
                }
              }
            })
          }
        } action={user.they_follow_us ? 'Follow Back' : 'Follow'} />
        }
      </WrapItem>
    </Box>
))
)

export default UsersList
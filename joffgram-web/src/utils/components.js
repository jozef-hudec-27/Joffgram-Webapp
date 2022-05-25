import { axiosInstance } from '../axios';


export const backendLookup = (method, endpoint, callback, data) => {
    axiosInstance.request({
        url: endpoint,
        method: method,
        data: data
    })
    .then(data => {
        console.log(`RESPONSE AFTER FETCHING ${endpoint} => ${data}, STATUS => ${data.status}`)

        if (data.status === 403) {
            if (window.location.href.indexOf('login') === -1) {
                window.location.href = '/login'
            }
        } else {
            callback(data.data, data.status)
        }
    })
    .catch(err => callback({ response: err.response?.data || err }, 400))
}   


// ACCOUNT

export const fetchGetAccountDetail = (accountId, callback) => {
    backendLookup('GET', `/accounts/${accountId}/`, callback)
}

export const fetchGetSuggestedUsers = (callback) => {
    backendLookup('GET', '/accounts/suggested-users/', callback)
}

export const fetchGetSavedPosts = (accountId, callback) => {
    backendLookup('GET', `/accounts/${accountId}/saved-posts/`, callback)
}

export const fetchGetMyFriends = (callback) => {
    backendLookup('GET', '/accounts/my-friends/', callback)
}
export const fetchReadMyUnreadMessagesInChat = (callback, theirId) => {
    backendLookup('POST', '/accounts/read-my-unread-messages-in-chat/', callback, { theirId: theirId })
}


// FOLLOWER

export const fetchSendFollowRequest  = (receiverId, callback) => {
    backendLookup('POST', '/follows/send-follow-request/', callback, { receiver_id: receiverId })
}

export const fetchAcceptOrDeclineFollowRequest = (action, senderId, callback) => {
    backendLookup('POST', '/follows/accept-or-decline-follow-request/', callback, { action: action, sender_id: senderId })
}

export const fetchCancelFollowRequest = (receiverId, callback) => {
    backendLookup('POST', '/follows/cancel-follow-request/', callback, { receiver_id: receiverId })
}

export const fetchRemoveFollower = (followerId, callback) => {
    backendLookup('POST', '/follows/remove-follower/', callback, { follower_id: followerId })
}

export const fetchRemoveFollowee = (followeeId, callback) => {
    backendLookup('POST', '/follows/remove-followee/', callback, { followee_id: followeeId })
}

export const fetchGetUserFollowers = (userId, callback) => {
    backendLookup('GET', `/follows/${userId}/followers/`, callback)
}

export const fetchGetUserFollowing = (userId, callback) => {
    backendLookup('GET', `/follows/${userId}/following/`, callback)
}


// POST

export const fetchGetPersonalizedPosts = (callback) => {
    backendLookup('GET', '/posts/personalized/', callback)
}

export const fetchGetPostDetail = (postId, callback) => {
    backendLookup('GET', `/posts/${postId}/`, callback)
}

export const fetchDeletePost = (postId, callback) => {
    backendLookup('DELETE', `/posts/${postId}/delete/`, callback)
}

export const fetchDeletePostComment = (commentId, callback) => {
    backendLookup('DELETE', `/posts/comments/${commentId}/delete/`, callback)
}

export const fetchDeletePostCommentReply = (replyId, callback) => {
    backendLookup('DELETE', `/posts/comments/reply/${replyId}/delete/`, callback)
}

export const fetchGetPostComments = (postId, callback) => {
    backendLookup('GET', `/posts/${postId}/comments/`, callback)
}

export const fetchCreatePost = (data, callback) => {
    backendLookup('POST', '/posts/create/', callback, data)
}

export const fetchLikePostToggle = (postId, action, callback) => {
    backendLookup('POST', '/posts/like-post-toggle/', callback, { post_id: postId, action: action })
}

export const fetchCreatePostComment = (postId, commentBody, callback) => {
    backendLookup('POST', '/posts/comments/create/', callback, { post_id: postId, comment_body: commentBody })
}

export const fetchLikeCommentToggle = (commentId, action, callback) => {
    backendLookup('POST', '/posts/comments/like-comment-toggle/', callback, { comment_id: commentId, action: action })
}

export const fetchCreatePostCommentReply = (commentId, replyBody, callback) => {
    backendLookup('POST', '/posts/comments/reply/', callback, { comment_id: commentId, reply_body: replyBody })
}

export const fetchLikeReplyToggle = (replyId, action, callback) => {
    backendLookup('POST', '/posts/comments/reply/like-reply-toggle/', callback, { reply_id: replyId, action: action })
}

export const fetchSavePost = (postId, callback) => {
    backendLookup('GET', `/posts/${postId}/save/`, callback)
}

export const fetchUnsavePost = (postId, callback) => {
    backendLookup('GET', `/posts/${postId}/unsave/`, callback)
}

export const fetchSharePost = (postId, accId, origin, callback) => {
    backendLookup('POST', '/posts/share/', callback, { postId: postId, accId: accId, origin: origin })
}

export const fetchGetExplorePosts = (callback) => {
    backendLookup('GET' ,'/posts/explore/', callback)
}


// PRIVATE CHAT

export const fetchGetPrivateChatMessages = (theirId, callback) => {
    backendLookup('GET', `/chat/${theirId}/messages/`, callback)
}


// STORY

export const fetchGetUserStories = (userId, callback) => {
    backendLookup('GET', `/stories/${userId}/all/`, callback)
}

export const fetchCommentOnStory = (storyId, body, callback) => {
    backendLookup('POST', '/stories/comment/', callback, { storyId: storyId, body: body })
}

export const fetchAddStory = (data, callback) => {
    backendLookup('POST', '/stories/add/', callback, data)
}


// OTHERS

export const  timeSince = (date, short=false) => {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " YEARS".substring(0, short ? 2 : 6);
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " MONTHS".substring(0, short ? 3 : 7);
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " DAYS".substring(0, short ? 2 : 5);
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " HOURS".substring(0, short ? 2 : 6);
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " MINUTES".substring(0, short ? 4 : 9);
    }
    return Math.floor(seconds) + " SECONDS".substring(0, short ? 2 : 8);
}

export const changeColor = (e, color) => {
    e.target.style.color = color;
}

export const changeOpacity = (e, opacity) => {
    e.target.style.opacity = opacity;
}

export const changeBoxShadow = (e, boxShadow) => {
    e.target.style.boxShadow = boxShadow
}

export const makeToast = (toast, id, title, description, status, duration, position='bottom') => {
    if (!toast.isActive(id)) {
        toast({
            id: id,
            title: title,
            description: description,
            status: status,
            duration: duration,
            position: position,
            isClosable: true
            })
    }
}

export const errorToast = toast => {
    if (!toast.isActive('errorToast')) {
        toast({
            id: 'errorToast',
            title: 'Error!',
            description: 'There was an error. Please try again later.',
            status: 'error',
            duration: 10000,
            position: 'bottom',
            isClosable: true
            })
    }
}

export const dividePosts = (posts, rowNum) => {
    let res = [[]]
    for (let i = 0; i < posts.length; i++) {
        res[res.length - 1].push(posts[i])
        if (res[res.length - 1].length === rowNum) {
            res.push([])
        }
    }

    return res
}

export const isFileSizeValid = file => {
    if (!file) return [null, null]

    const extension = (file.substring(0, 20).split(';')[0].split('/')[1])
    
    const startIndex = file.indexOf('base64,') + 7
    const base64str = file.substr(startIndex)
    const decoded = atob(base64str)

    if (decoded.length >= 10485760){
        return [null, null]
    }
    return [base64str, extension]
}

export const getBase64StringFromFile = file => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
}

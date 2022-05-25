import React from 'react'
import GeneralCommentComponent from './GeneralCommentComponent'


const GeneralCommentList = ({ objs, setSelectedComment, userId, funcAfterDelete, toast, fake, setFake,
  fetchLikeObjToggle, fetchDeleteObj, isReply }) => (

  objs?.map(obj => (
    <GeneralCommentComponent obj={obj} setSelectedComment={setSelectedComment} userId={userId} funcAfterDelete={funcAfterDelete}
    toast={toast} fake={fake} setFake={setFake} fetchLikeObjToggle={fetchLikeObjToggle} fetchDeleteObj={fetchDeleteObj} isReply={isReply} />
  ))
  
)

export default GeneralCommentList
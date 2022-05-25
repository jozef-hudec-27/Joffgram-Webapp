import React from "react";
import { BsThreeDots } from 'react-icons/bs'


const changeColor = (e, color) => {
    e.target.style.color = color;
}

export const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <>
      {!children ?
      <a
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
        }} style={{cursor: 'pointer'}}>
        <BsThreeDots size={30} onMouseOver={e => changeColor(e, 'grey')} 
          onMouseOut={e => changeColor(e, 'black')} />
      </a> 

    : 

    <a
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }} style={{cursor: 'pointer'}}>
      <BsThreeDots size={30} color='grey' />
    </a>
    }
    </>
  ));



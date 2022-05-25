import React from 'react'
import Dropdown from 'react-bootstrap/Dropdown'


const DropdownComponent = ({ toggle, toggleColor, children, dropdownItemsActions }) => {
  return (
    <Dropdown>
        <Dropdown.Toggle as={toggle} id="dropdown-custom-components" color={toggleColor}>
            {children && 'children'}
        </Dropdown.Toggle>
        <Dropdown.Menu>
            {dropdownItemsActions.map(item => (
                <Dropdown.Item onClick={item[1]}>
                    {item[0]}
                </Dropdown.Item>
            ))}
        </Dropdown.Menu>
    </Dropdown>
  )
}

export default DropdownComponent
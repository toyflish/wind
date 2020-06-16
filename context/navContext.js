import { useState, createContext, useEffect } from "react"

export const NavContext = createContext()

export const NavContextProvider = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    setIsOpen(!!JSON.parse(window.localStorage.getItem('isOpen')))
    console.log("useEffect set initai isOPen", isOpen, { realIsOpen: !!JSON.parse(window.localStorage.getItem('isOpen'))})
  },[])

  useEffect(() => {
    console.log("isOpen Effect run", {isOpen});
    window.localStorage.setItem('isOpen', JSON.stringify(isOpen) )

  },[isOpen])
  return (
    <NavContext.Provider value={[isOpen, setIsOpen]} >
      {props.children}
    </NavContext.Provider>
  )
}

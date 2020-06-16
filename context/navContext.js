import { useState, createContext, useEffect } from "react"

export const NavContext = createContext()

export const NavContextProvider = (props) => {
  const [isOpen, setIsOpen] = useState(
    () => {
      let initialState = false
      if (typeof window === "undefined") {
        console.log("useState init on SERVER", initialState)
      } else {
        initialState = JSON.parse(window.localStorage.getItem('isOpen'))
        console.log("useState init on CLIENT", initialState)
      }
      return initialState
    })

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

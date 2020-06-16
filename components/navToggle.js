import { NavContext } from "../context/navContext"
import { useContext, useEffect, useState} from "react"

export default function NavToggle({classList}){
  const [isOpen, setIsOpen] =  useContext(NavContext)

  const [svgClassList, setSvgClassList] = useState(`transition ease-in-out duration-200`)

  useEffect( () => {
    setSvgClassList(`transition ease-in-out duration-200 ${isOpen ? 'transform rotate-90' : ''}`)
    console.log('update', { svgClassList });
  }, [isOpen])
  console.log("NavToggle Render", { svgClassList });

  return (
    <button className={`focus:outline-none ${classList}`} onClick={() => setIsOpen(!isOpen)}>
      <svg className={svgClassList} height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path className="heroicon-ui" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" /></svg>
    </button>
  )
}
import { useContext, useState, useEffect } from "react"
import {NavContext} from '../context/navContext'
import Link from "next/link"

const pages = [
  {name: 'home', href: '/'},
  {name: 'Kellenhusen', href: '/kellenhusen'}
]
function NavDrawer() {
  const [isOpen, setIsOpen] = useContext(NavContext)
  console.log("NavDrawer run", { isOpen });

  const baseClassList = `nav-drawer fixed right-0 bg-white shadow z-20 h-full p-4 transform duration-300`
  const [classList, setClassList] = useState( baseClassList )
  useEffect(() => {
    setClassList( `${baseClassList} ${ isOpen ? 'nav-drawer--open' : '' }`)
  }, [isOpen])

  return (
    <div className={classList}>
      NavDrawer
      <nav className="relative">
        {pages.map(({name, href}) =>
          <div key={href} className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <Link href={href}>
              <a className="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">{name}</a>
            </Link>
          </div>
        )}
      </nav>
      <style jsx>{`
        .nav-drawer {
          width: 300px;
          transform: translateX(300px);
        }
        .nav-drawer--open {
          transform: translateX(0);
        }
      `}</style>
    </div>
  )
}

export default NavDrawer

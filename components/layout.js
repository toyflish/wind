import Header from "./header";
import Footer from "./footer";
import NavDrawer from "./navDrawer";
import {NavContextProvider} from '../context/navContext'
import NavToggle from "./navToggle";

function Layout(props) {
  return (
    <main className="relative bg-black text-white">
      <NavContextProvider>
        <div className="absolute bg-white opacity-50 w-24 h-full right-0 top-0 z-10">
        </div>
        <NavDrawer />
        <NavToggle classList="absolute top-0 right-0 m-2 z-30"/>
        {props.children}
      </NavContextProvider>
    </main>
  );
}

export default Layout;

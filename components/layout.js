import Header from "./header";
import Footer from "./footer";

function Layout(props) {
  return (
    <main className="relative bg-black text-white">
      <div className="absolute bg-white opacity-50 w-24 h-full right-0 top-0 z-10">
      </div>
      {props.children}
    </main>
  );
}

export default Layout;

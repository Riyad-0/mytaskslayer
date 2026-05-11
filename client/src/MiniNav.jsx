import { useState, useEffect } from "react";
import closeIcon from "./assets/close.svg";
import menuIcon from "./assets/menu.svg";
import { Link } from "react-router-dom";

function MiniNav() {
  const [menuOpened, setMenuOpened] = useState(false);

  useEffect(() => {
    /** @type {(this: Document, ev: MouseEvent) => any} */
    const onMouseDown = () => {
      setMenuOpened(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  /** @type {React.MouseEventHandler<HTMLButtonElement>} */
  const onMenuButtonClick = () => {
    setMenuOpened(!menuOpened);
  }

  /** @type {React.MouseEventHandler<HTMLButtonElement>} */
  const onMenuButtonMouseDown = e => {
    e.stopPropagation();
  }

  /** @type {React.MouseEventHandler<HTMLElement>} */
  const onMiniNavMouseDown = e => {
    e.stopPropagation();
  }

    /** @type {React.MouseEventHandler<HTMLAnchorElement>} */
  const onMiniNavLinkClick = () => {
    setMenuOpened(false);
  }

  return (
    <>
      <div className="mini-nav">
        <button className="menu-button" onClick={onMenuButtonClick} onMouseDown={onMenuButtonMouseDown}>
          {
            menuOpened ?
              <img className="menu-icon" alt="close" src={closeIcon}></img> :
              <img className="menu-icon" alt="menu" src={menuIcon}></img>
          }
        </button>
        {
          menuOpened ?
            <nav className="mini-nav-links" onMouseDown={onMiniNavMouseDown}>
              <Link className="mini-nav-link" to="/" onClick={onMiniNavLinkClick}>Home</Link>
              <Link className="mini-nav-link" to="/class" onClick={onMiniNavLinkClick}>Class</Link>
            </nav> :
            <></>
        }
      </div>
    </>
  );
}

export default MiniNav;
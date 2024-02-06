import { FiSearch, FiUser } from 'react-icons/fi';
import { PiPaperPlane } from 'react-icons/pi';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="p-6 flex justify-between">
      <a
        className="flex items-center gap-1"
        href="
  "
      >
        <span>
          <PiPaperPlane />
        </span>
        <span className="font-bold text-xl">airbnb</span>
      </a>
      <div className="flex border gap-2 rounded-full  border-gray-300 py-2 px-4 shadow-md shadow-gray-300">
        <div>Anywhere</div>
        <div className="border-l border-gray-300" />
        <div>Any week</div>
        <div className="border-l border-gray-300" />
        <div>Add guestts</div>
        <button className="bg-primary text-white rounded-full p-1">
          <FiSearch />
        </button>
      </div>
      <Link
        to={'/login'}
        className="flex border gap-2 rounded-full items-center border-gray-300 py-2 px-4  "
      >
        <div className="p-1">
          <GiHamburgerMenu />
        </div>
        <div className="rounded-full border border-gray-400 bg-gray-400 p-1 text-white">
          <FiUser />
        </div>
      </Link>
    </header>
  );
};

import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { CustomButton } from './CustomButton';

import { BsMoon, BsSunFill } from 'react-icons/bs';

import { SetTheme } from '../redux/theme';
import { Logout } from '../redux/userSlice';

export const TopBar = () => {
  const { theme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const handleTheme = () => {
    const themeValue = theme === 'light' ? 'dark' : 'light';

    dispatch(SetTheme(themeValue));
  };

  return (
    <div className="topbar w-full rounded-b-xl flex items-center justify-between py-3 md:py-6 px-6 bg-primary">
      <Link to="/" className="flex gap-2 items-center">
        <span className="text-xl md:text-2xl text-[#065ad8] font-semibold">
          Social App
        </span>
      </Link>

      <div className="flex gap-4 items-center text-accent-1 text-md md:text-xl">
        <button onClick={() => handleTheme()}>
          {theme == 'light' ? <BsMoon /> : <BsSunFill />}
        </button>

        <div>
          <CustomButton
            onClick={() => dispatch(Logout())}
            title="Log Out"
            containerStyles="text-sm text-accent-1 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { NoProfile } from '../assets';

export const FriendsCard = ({ friends }) => {
  return (
    <div>
      <div className="w-full bg-primary shadow-sm rounded-lg px-6 py-5">
        <div className="flex items-center justify-between text-xl text-accent-1 pb-2 border-b font-bold border-[#66666645]">
          <span> Friends</span>
          <span>{friends ? friends?.length : '0'} </span>
        </div>

        <div className="w-full flex flex-col gap-4 pt-4">
          {friends?.map((friend) => (
            <Link
              to={'/profile/' + friend?.userId}
              key={friend?.userId}
              className="w-full flex gap-4 items-center cursor-pointer"
            >
              <img
                src={friend?.profileUrl ?? NoProfile}
                alt={friend?.userFirstName}
                className="w-10 h-10 object-cover rounded-full"
              />
              <div className="flex-1">
                <p className="text-base font-medium text-accent-1">
                  {friend?.userFirstName} {friend?.userLastName}
                </p>
                <span className="text-sm text-accent-2">
                  {friend?.userProfession ?? 'No Profession'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

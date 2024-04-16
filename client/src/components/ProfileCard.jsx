import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { LiaEditSolid } from 'react-icons/lia';
import {
  BsBriefcase,
  BsFacebook,
  BsInstagram,
  BsPersonFillAdd,
} from 'react-icons/bs';
import { FaTwitterSquare } from 'react-icons/fa';
import { CiLocationOn } from 'react-icons/ci';
import moment from 'moment';

import { NoProfile } from '../assets';
import { UpdateProfile } from '../redux/userSlice';

export const ProfileCard = ({ user }) => {
  const { user: data, edit } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  console.log(user);

  return (
    <div>
      <div className="w-full bg-primary flex flex-col items-center shadow-sm rounded-xl px-6 py-4 ">
        <div className="w-full flex items-center justify-between  border-b pb-5 border-[#66666645]">
          <Link to={'/profile/' + user?.id} className="flex gap-2">
            <img
              src={user?.profileurl ?? NoProfile}
              alt={user?.email}
              className="w-14 h-14 object-cover rounded-full"
            />

            <div className="flex flex-col justify-center">
              <p className="text-lg font-medium text-accent-1">
                {user.firstname} {user?.lastname}
              </p>
              <span className="text-accent-2">
                {user?.profession ?? 'No Profession'}
              </span>
            </div>
          </Link>

          <div>
            {user?.id === data?.id ? (
              <LiaEditSolid
                size={22}
                className="text-blue cursor-pointer hover:text-white"
                onClick={() => dispatch(UpdateProfile(true))}
              />
            ) : (
              <button
                className="bg-[#0444a430] text-sm text-white p-1 rounded"
                onClick={() => {}}
              >
                <BsPersonFillAdd size={20} className="text-[#0f52b6]" />
              </button>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col gap-2 py-4 border-b border-[#66666645]">
          <div className="flex gap-2 items-center text-accent-2">
            <CiLocationOn className="text-xl text-accent-1" />
            <span>{user?.location ?? 'Add Location'}</span>
          </div>

          <div className="flex gap-2 items-center text-accent-2">
            <BsBriefcase className=" text-lg text-accent-1" />
            <span>{user?.profession ?? 'Add Profession'}</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2 py-4 border-b border-[#66666645]">
          <p className="text-xl text-accent-1 font-semibold">
            {user?.friends?.length ?? '0'} Friends
          </p>

          <span className="text-base text-blue">
            {user?.verified ? 'Verified Account' : 'Not Verified'}
          </span>

          <div className="flex items-center justify-between">
            <span className="text-accent-2">Joined</span>
            <span className="text-accent-1 text-base">
              {moment(user?.createdat).fromNow()}
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-4 py-4 pb-6">
          <p className="text-accent-1 text-lg font-semibold">Social Profile</p>

          <div className="flex gap-2 items-center text-accent-2">
            <BsInstagram className=" text-xl text-accent-1" />
            <span>Instagram</span>
          </div>
          <div className="flex gap-2 items-center text-accent-2">
            <FaTwitterSquare className=" text-xl text-accent-1" />
            <span>Twitter</span>
          </div>
          <div className="flex gap-2 items-center text-accent-2">
            <BsFacebook className=" text-xl text-accent-1" />
            <span>Facebook</span>
          </div>
        </div>
      </div>
    </div>
  );
};

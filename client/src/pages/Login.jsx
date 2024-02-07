import { TbSocial } from "react-icons/tb";

export const Login = () => {
  return (
    <section className="bg-bgColor w-full h-full flex items-center justify-center p-6">
      <div className="w-full md:w-2/3 h-fit lg:h-full 2xl:h-5/6 py-8 lg:py-0 flex bg-primary rounded-xl overflow-hidden shadow-lg">
        <div className="h-full w-full lg:w-1/2 p-10 2xl:px-20 flex flex-col justify-center">
          <div className="w-full flex gap-2 items-center mb-6">
            <div className="p-2 bg-[#065ad8] rounded text-white">
              <TbSocial />
              <span className="text-2xl text-[#065ad8] font-semibold">
                Social APpp
              </span>
            </div>
            <p className="text-accent-1 text-base font-semibold">
              Log in to your account
            </p>
            <span className="tex-sm mt-2 text-accent-2">Welcome Back</span>
            <form className="py-8 flex flex-cik gap-5">
              <TextInput />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

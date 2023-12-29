import React from "react";

const Loader = ({ active }: { active: boolean }) => {
  if (active) {
    return (
      <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="custom-loader"></div>
      </div>
    );
  } else {
    return null;
  }
};

export default Loader;

import React from "react";

const Loader = ({ active }: { active: boolean }) => {
  if (active) {
    return (
      <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div className="loadingio-spinner-blocks-ze2azvm6n5k">
          <div className="ldio-qn9b7rx0c5">
            <div style={{ left: "4px", top: "4px", animationDelay: "0s" }} />
            <div
              style={{
                left: "35px",
                top: "4px",
                animationDelay: "0.14204545454545456s",
              }}
            />
            <div
              style={{
                left: "66px",
                top: "4px",
                animationDelay: "0.2840909090909091s",
              }}
            />
            <div
              style={{
                left: "4px",
                top: "35px",
                animationDelay: "0.9943181818181818s",
              }}
            />
            <div
              style={{
                left: "66px",
                top: "35px",
                animationDelay: "0.42613636363636365s",
              }}
            />
            <div
              style={{
                left: "4px",
                top: "66px",
                animationDelay: "0.8522727272727273s",
              }}
            />
            <div
              style={{
                left: "35px",
                top: "66px",
                animationDelay: "0.7102272727272727s",
              }}
            />
            <div
              style={{
                left: "66px",
                top: "66px",
                animationDelay: "0.5681818181818182s",
              }}
            />
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default Loader;

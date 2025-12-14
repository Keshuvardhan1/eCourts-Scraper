import React from "react";

const Avatar: React.FC<{ name?: string; size?: number }> = ({ name, size = 32 }) => {
  const char = name ? name.charAt(0).toUpperCase() : "?";
  return (
    <div style={{ width: size, height: size }} className="rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-white">
      {char}
    </div>
  );
};

export default Avatar;

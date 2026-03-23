/**
 * AnimatedBackground.jsx
 * ----------------------
 * Floating gradient orbs and mesh background.
 * Creates an immersive ambient atmosphere.
 */

import React from "react";

const AnimatedBackground = () => {
  return (
    <>
      {/* Gradient mesh overlay */}
      <div className="app-bg-mesh" />

      {/* Floating ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </>
  );
};

export default AnimatedBackground;

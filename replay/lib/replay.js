import React, { useCallback, useState } from "react";

const sleep = ms => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  })
}

function cloneMouseEvent(reactEvent) {
  //this seems to work in Chrome, Firefox, Safari
  const cloneEvent = document.createEvent("MouseEvent"); // should this be PointerEvent on IE/Others? 
  cloneEvent.initEvent('click', true, false);
  cloneEvent.stopPropagation(); //allow default event, don't notify listeners
  return cloneEvent;
}

export function ReplayAncestor({ children }) {

  const [completed, setCompleted] = useState(null);

  const sendToAti = async () => {
    setCompleted(false);
    await sleep(50);
    setCompleted(true);
  }

  const handleClick = useCallback(async reactEvent => {
    try {
      if (!(reactEvent.defaultPrevented || reactEvent.nativeEvent.alreadyPaused)) {
        reactEvent.persist();
        reactEvent.preventDefault(); //prevent default event, but continue to notify listeners
        //handle case that preventDefault called by a later listener?
        const cloneEvent = cloneMouseEvent(reactEvent);
        cloneEvent.alreadyPaused = true;
        await sendToAti() //pretends to be ATI
        const cancelled = !reactEvent.target.dispatchEvent(cloneEvent);
      }
    }
    catch (e) {
      console.log(e);
    }
  });

  return <div onClick={handleClick}>
    {children}
    {completed === false && <p>PAUSING</p>}
  </div>
}
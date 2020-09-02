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
  return cloneEvent;
}

export function ReplayAncestor({ children }) {

  const [completed, setCompleted] = useState(null);

  const sendToAti = async () => {
    setCompleted(false);
    await sleep(2000);
    setCompleted(true);
  }

  function mightNavigate(target) {
    if (target.tagName && target.getAttribute) {
      const tagName = target.tagName && target.tagName.toLowerCase();
      const targetMightNavigate = (tagName === "a" && target.getAttribute("href")) ||
        ((tagName === "button" || tagName === "input") && (!target.getAttribute("type") || target.getAttribute("type") === "submit"));
      return targetMightNavigate;
    }
  }

  const handleClick = useCallback(async reactEvent => {
    if ((reactEvent.defaultPrevented || reactEvent.nativeEvent.isResumedEvent) || !mightNavigate(reactEvent.target)) {
      return;
    }

    reactEvent.persist();
    reactEvent.preventDefault();

    //spy on later calls to preventDefault
    let preventedLater = false;
    const oldPreventDefault = reactEvent.preventDefault.bind(reactEvent);
    const newPreventDefault = (...args) => {
      preventedLater = true;
      oldPreventDefault(...args);
    }
    reactEvent.preventDefault = newPreventDefault;

    await sendToAti() //pretends to be ATI

    if (!preventedLater) { //no-one else halted the event, we must resume it
      const cloneEvent = cloneMouseEvent(reactEvent);
      cloneEvent.stopPropagation(); //don't notify listeners - they saw it the first time
      cloneEvent.isResumedEvent = true; //remind ourselves this is artificial
      reactEvent.target.dispatchEvent(cloneEvent);
    }
  });

  return <div onClick={handleClick}>
    {children}
    {completed === false && <p>PAUSING</p>}
  </div>
}
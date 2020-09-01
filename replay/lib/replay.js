import React, { useCallback, useState } from "react";

const sleep = ms => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  })
}

function copyForInternetExplorer(fromEvent, toEvent) {
  const propNames = [
    'type',
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget'
  ];
  for (const propName of propNames) {
    toEvent[propName] = fromEvent[propName];
  }
}

function cloneMouseEvent(reactEvent, legacyMode = true, internetExplorer = false) {
  if (legacyMode) {
    //this seems to work in Chrome, Firefox, Safari
    const cloneEvent = document.createEvent("MouseEvent"); // should this be PointerEvent on IE/Others? 
    if (internetExplorer) copyForInternetExplorer(reactEvent.nativeEvent, cloneEvent);
    cloneEvent.initEvent('click', true, false);
    cloneEvent.stopPropagation(); //allow default event, don't notify listeners
    return cloneEvent;
  }
  else {
    //this doesn't work anywhere, but maybe I made a mistake
    const nativeEvent = reactEvent.nativeEvent;
    const cloneEvent = new MouseEvent(nativeEvent.type, nativeEvent);
    return cloneEvent;
  }
}

export function ReplayAncestor({ children }) {

  const [completed, setCompleted] = useState(null);

  const completeTask = async () => {
    setCompleted(false);
    await sleep(2000);
    setCompleted(true);
  }

  const handleClick = useCallback(async reactEvent => {
    try {
      if (!(reactEvent.defaultPrevented || reactEvent.nativeEvent.alreadyPaused)) {
        reactEvent.persist();
        reactEvent.preventDefault(); //prevent default event, but continue to notify listeners
        //handle case that preventDefault called by a later listener?
        const cloneEvent = cloneMouseEvent(reactEvent, true);
        cloneEvent.alreadyPaused = true;
        await completeTask()
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
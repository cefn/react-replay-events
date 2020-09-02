# react-replay-events

The `replay` package contains a next server useful for experimentation. 

It incorporates a simple component test which proves click interception from a link and from a form button submission, and has been demonstrated to work on recent versions of Chrome, Firefox, Safari and Edge.

Both of these cases are handled with the same code path of 'resuming' a DOM event (with no ATI or other click-modelling logic). It is hoped that all click cases are covered by it.

```
cd replay
npx next dev
open http://localhost:3000
```


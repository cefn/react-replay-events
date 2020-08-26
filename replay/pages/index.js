import { ReplayAncestor as InterceptingAncestor } from "../lib/replay";

export default function Home() {
  return (
    <InterceptingAncestor>
      <a href="https://www.bbc.co.uk" >Link to BBC</a>
      <hr />
      <form action="https://www.google.com" >
        <span>Submit to Google </span>
        <input name="q" />
        <button> Search </button>
      </form>
    </InterceptingAncestor>
  )
}

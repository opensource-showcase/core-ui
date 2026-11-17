export function NotebookDiagram() {
  return <section className="notebook-diagram" aria-labelledby="flow-title">
    <h2 id="flow-title">Contribution flow ( high level )</h2>
    <svg viewBox="0 0 900 144" role="img" aria-labelledby="flow-label">
      <title id="flow-label">Developer to fork, local changes, pull request, review, and merged contribution</title>
      <defs><marker id="ink-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M1 1 L7 4 L1 7" fill="none" stroke="currentColor" strokeWidth="1.4"/></marker></defs>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="46" cy="28" r="13"/><path d="M23 78 Q22 46 46 46 Q72 46 70 78"/>
        <path d="M88 53 L133 54 M246 54 L285 53 M402 54 L443 55 M561 54 L600 53 M722 54 L762 55" markerEnd="url(#ink-arrow)"/>
        <path d="M151 24 L229 25 L228 81 L150 80 Z M166 43 L180 53 L166 64 M190 65 L215 65"/>
        <path d="M306 17 L375 18 L388 31 L386 84 L305 83 Z M374 18 L374 33 L387 32 M320 48 L369 49 M321 61 L361 60 M321 73 L352 74"/>
        <path d="M464 17 L540 18 L542 86 L465 85 Z M484 33 L484 68 L519 68 M518 37 L518 68 M478 38 L484 32 L490 38 M512 43 L518 36 L524 43"/>
        <path strokeDasharray="6 5" d="M615 12 L708 13 L710 92 L614 91 Z"/>
        <path d="M633 38 L641 46 L658 29 M633 68 L641 76 L658 59 M669 39 L692 40 M669 69 L693 68"/>
        <circle cx="818" cy="49" r="31"/><path d="M801 49 L813 61 L836 36"/>
      </g>
      <g textAnchor="middle" fill="currentColor" fontSize="23"><text x="46" y="120">Developer</text><text x="190" y="120">Fork / clone</text><text x="347" y="120">Changes</text><text x="503" y="120">Pull request</text><text x="662" y="120">Review</text><text x="818" y="120">Merged!</text></g>
    </svg>
  </section>;
}

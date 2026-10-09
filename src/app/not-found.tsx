import Link from "next/link";

const links = [
  ["/", "Home"],
  ["/pdf-compressor", "PDF Compressor"],
  ["/image-compressor", "Image Compressor"],
  ["/temp-mail", "Temp Mail"],
];

export default function NotFound() {
  return (
    <main className="relative min-h-[80vh] overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary">
            404
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            This page is not on the site
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-foreground/70">
            The link is old or mistyped. Search a tool, or open one below.
          </p>
          <form
            action="/all-tools"
            className="mt-6 flex max-w-md overflow-hidden rounded-full border bg-background shadow-sm"
          >
            <input
              name="q"
              placeholder="Search tools"
              className="h-12 w-full bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-foreground/40"
            />
            <button className="m-1 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground">
              Search
            </button>
          </form>
          <div className="mt-6 flex flex-wrap gap-2">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border bg-background px-4 py-2 text-sm text-foreground/80 shadow-sm hover:border-primary/40"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <svg viewBox="0 0 360 280" className="h-72 w-full max-w-md">
            <text
              x="36"
              y="176"
              fontSize="128"
              fontWeight="700"
              className="fill-primary/15"
            >
              4
            </text>
            <text
              x="226"
              y="176"
              fontSize="128"
              fontWeight="700"
              className="fill-primary/15"
            >
              4
            </text>
            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 0 -8; 0 0"
                dur="3.4s"
                repeatCount="indefinite"
              />
              <circle cx="180" cy="124" r="64" className="fill-primary/10" />
              <rect
                x="144"
                y="100"
                width="72"
                height="50"
                rx="18"
                className="fill-primary"
              />
              <circle cx="168" cy="124" r="5" className="fill-background">
                <animate
                  attributeName="opacity"
                  values="1;0.25;1"
                  dur="2.6s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="194" cy="124" r="5" className="fill-background">
                <animate
                  attributeName="opacity"
                  values="1;0.25;1"
                  dur="2.6s"
                  repeatCount="indefinite"
                />
              </circle>
              <rect
                x="176"
                y="74"
                width="4"
                height="18"
                rx="2"
                className="fill-primary"
              />
              <circle cx="178" cy="70" r="5" className="fill-primary">
                <animate
                  attributeName="opacity"
                  values="0.35;1;0.35"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              </circle>
              <rect
                x="150"
                y="154"
                width="60"
                height="36"
                rx="12"
                className="fill-primary/80"
              />
            </g>
          </svg>
        </div>
      </div>
    </main>
  );
}

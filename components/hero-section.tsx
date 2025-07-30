import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight, Monitor, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: {
    regular: string
    gradient: string
  }
  description?: string
  ctaText?: string
  ctaHref?: string
  bottomImage?: string
  gridOptions?: {
    angle?: number
    cellSize?: number
    opacity?: number
    lineColor?: string
  }
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lineColor = "gray",
}) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--line-color": lineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
        `opacity-[var(--opacity)]`,
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--line-color)_1px,transparent_0),linear-gradient(to_bottom,var(--line-color)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent to-90%" />
    </div>
  )
}

const ScreenSizeNotice = () => {
  return (
    <>
      {/* Notice for mobile devices (visible on sm and below) */}
      <div className="block md:hidden mb-6 mx-4">
        <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-orange-300 mb-1">
                Best Experience on Desktop
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                For the optimal experience with all features, we recommend using this application on a desktop or laptop computer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notice for tablet devices (visible on md to lg) */}
      <div className="hidden md:block lg:hidden mb-6 mx-4">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-3">
            <Monitor className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-gray-300 text-center">
              <span className="text-blue-300 font-medium">Pro tip:</span> Use a larger screen for the best experience with all features
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = "AI-Powered PDF Learning Platform & Blogging",
      subtitle = {
        regular: "Create better content with ",
        gradient: "AI writing and PDF learning tools.",
      },
      description = "Write better blogs with AI assistance and turn any PDF into an interactive learning experience. Create, learn, and publish with intelligence.",
      ctaText = "Explore",
      ctaHref = "/login",
      bottomImage = "/hero-image.png",
      gridOptions,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("relative bg-black text-white min-h-screen", className)} ref={ref} {...props}>
        {/* Background gradient overlay */}
        <div className="absolute top-0 z-[0] h-full w-full bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <section className="relative w-full z-1">
          <RetroGrid {...gridOptions} />

          {/* Main content container */}
          <div className="relative z-10 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Screen Size Notice */}
            <div className="pt-4 sm:pt-6">
              <ScreenSizeNotice />
            </div>

            {/* Text content section */}
            <div className="pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-8 sm:pb-12 md:pb-16">
              <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
                {/* Title badge */}
                <div className="flex justify-center">
                  <h1 className="inline-flex items-center text-xs sm:text-sm text-gray-400 font-geist px-3 sm:px-4 md:px-5 py-2 bg-gradient-to-tr from-zinc-300/5 via-gray-400/5 to-transparent border-[2px] border-white/5 rounded-2xl sm:rounded-3xl group cursor-default">
                    <span className="text-center leading-tight break-words max-w-[280px] sm:max-w-none">
                      {title}
                    </span>
                    <ChevronRight className="inline w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 duration-300 flex-shrink-0" />
                  </h1>
                </div>

                {/* Main heading */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tight font-geist bg-clip-text text-transparent mx-auto bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] leading-tight sm:leading-tight md:leading-tight lg:leading-tight xl:leading-tight px-2 sm:px-0">
                  <span className="block sm:inline">
                    {subtitle.regular}
                  </span>
                  <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-orange-200">
                    {subtitle.gradient}
                  </span>
                </h2>

                {/* Description */}
                <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-xs sm:max-w-md md:max-2xl mx-auto leading-relaxed px-4 sm:px-0">
                  {description}
                </p>

                {/* CTA Button */}
                <div className="flex items-center justify-center pt-2 sm:pt-4">
                  <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-950 text-xs sm:text-sm font-medium backdrop-blur-3xl">
                      <Link
                        href={ctaHref}
                        className="inline-flex rounded-full text-center group items-center justify-center bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/10 hover:via-purple-400/30 hover:to-transparent transition-all duration-300 py-3 sm:py-4 px-6 sm:px-8 md:px-10 min-w-[120px] sm:min-w-[140px]"
                      >
                        {ctaText}
                      </Link>
                    </div>
                  </span>
                </div>
              </div>
            </div>

            {/* Image section */}
            {bottomImage && (
              <div className="pb-8 sm:pb-12 md:pb-16 lg:pb-20">
                <div className="relative z-10 mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-10">
                  <div className="relative w-full aspect-video sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[16/8] overflow-hidden rounded-lg border border-gray-800 shadow-2xl">
                    <Image
                      src={bottomImage}
                      alt="Dashboard preview"
                      fill
                      className="object-cover object-top"
                      priority
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 95vw, (max-width: 1024px) 90vw, 85vw"
                    />
                  </div>
                  {/* Optional: Add a subtle glow effect */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500/20 to-orange-500/20 blur-3xl transform scale-105 opacity-30" />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    )
  },
)
HeroSection.displayName = "HeroSection"

export { HeroSection }

// import * as React from "react"
// import { cn } from "@/lib/utils"
// import { ChevronRight } from "lucide-react"
// import Link from "next/link"
// import Image from "next/image" // Add this import

// interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
//   title?: string
//   subtitle?: {
//     regular: string
//     gradient: string
//   }
//   description?: string
//   ctaText?: string
//   ctaHref?: string
//   bottomImage?: string
//   gridOptions?: {
//     angle?: number
//     cellSize?: number
//     opacity?: number
//     lineColor?: string
//   }
// }

// const RetroGrid = ({
//   angle = 65,
//   cellSize = 60,
//   opacity = 0.5,
//   lineColor = "gray",
// }) => {
//   const gridStyles = {
//     "--grid-angle": `${angle}deg`,
//     "--cell-size": `${cellSize}px`,
//     "--opacity": opacity,
//     "--line-color": lineColor,
//   } as React.CSSProperties

//   return (
//     <div
//       className={cn(
//         "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
//         `opacity-[var(--opacity)]`,
//       )}
//       style={gridStyles}
//     >
//       <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
//         <div className="animate-grid [background-image:linear-gradient(to_right,var(--line-color)_1px,transparent_0),linear-gradient(to_bottom,var(--line-color)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
//       </div>
//       <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent to-90%" />
//     </div>
//   )
// }

// const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
//   (
//     {
//       className,
//       title = "AI-Powered PDF Learning Platform & Blogging",
//       subtitle = {
//         regular: "Create better content with ",
//         gradient: "AI writing and PDF learning tools.",
//       },
//       description = "Write better blogs with AI assistance and turn any PDF into an interactive learning experience. Create, learn, and publish with intelligence.",
//       ctaText = "Explore",
//       ctaHref = "/login",
//       bottomImage = "/hero-image.png", // Change this to your image filename
//       gridOptions,
//       ...props
//     },
//     ref,
//   ) => {
//     return (
//       <div className={cn("relative bg-black text-white", className)} ref={ref} {...props}>
//         <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
//         <section className="relative max-w-full mx-auto z-1">
//           <RetroGrid {...gridOptions} />
//           <div className="max-w-screen-xl z-10 mx-auto px-4 py-28 gap-12 md:px-8">
//             <div className="space-y-5 max-w-3xl leading-0 lg:leading-5 mx-auto text-center">
//               <h1 className="text-sm text-gray-400 group font-geist mx-auto px-5 py-2 bg-gradient-to-tr from-zinc-300/5 via-gray-400/5 to-transparent border-[2px] border-white/5 rounded-3xl w-fit">
//                 {title}
//                 <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
//               </h1>
//               <h2 className="text-4xl tracking-tighter font-geist bg-clip-text text-transparent mx-auto md:text-6xl bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
//                 {subtitle.regular}
//                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-orange-200">
//                   {subtitle.gradient}
//                 </span>
//               </h2>
//               <p className="max-w-2xl mx-auto text-gray-300">
//                 {description}
//               </p>
//               <div className="items-center justify-center gap-x-3 space-y-3 sm:flex sm:space-y-0">
//                 <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
//                   <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
//                   <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-950 text-xs font-medium backdrop-blur-3xl">
//                     <Link
//                       href={ctaHref}
//                       className="inline-flex rounded-full text-center group items-center w-full justify-center bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/10 hover:via-purple-400/30 hover:to-transparent transition-all sm:w-auto py-4 px-10"
//                     >
//                       {ctaText}
//                     </Link>
//                   </div>
//                 </span>
//               </div>
//             </div>
//             {bottomImage && (
//               <div className="mt-32 mx-10 relative z-10">
//                 <Image
//                   src={bottomImage}
//                   alt="Dashboard preview"
//                   width={1200}
//                   height={600}
//                   className="w-full shadow-lg rounded-lg border border-gray-800"
//                   priority
//                 />
//               </div>
//             )}
//           </div>
//         </section>
//       </div>
//     )
//   },
// )
// HeroSection.displayName = "HeroSection"

// export { HeroSection }

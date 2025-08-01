"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Github, Twitter, Linkedin, Youtube, Mail, Heart } from "lucide-react";
import Link from "next/link";

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  ({ className, ...props }, ref) => {
    const [email, setEmail] = React.useState("");

    const handleSubscribe = (e: React.FormEvent) => {
      e.preventDefault();
      if (email.trim()) {
        console.log("Subscribing email:", email);
        // TODO: Implement email subscription logic
        setEmail("");
      }
    };

    return (
             <footer className={cn("relative bg-black text-white border-t border-white/10 mb-0", className)} ref={ref} {...props}>
        {/* Background gradient overlay */}
        <div className="absolute top-0 z-[0] h-full w-full bg-purple-950/5 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

                 {/* Subtle branding watermark */}
         <div className="absolute inset-0 z-[1] opacity-10">
           <div className="h-full w-full flex items-end justify-center pb-8">
             <span className="text-[10rem] font-bold text-white/20 tracking-wider">Learn-Scribe</span>
           </div>
         </div>

                 <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">

                         {/* Left Section - Navigation Links */}
             <div className="space-y-8">
               {/* Features */}
               <div>
                 <h3 className="text-sm font-semibold text-white mb-4">Features</h3>
                 <ul className="space-y-2 text-sm text-gray-300">
                   <li><Link href="/dashboard" className="hover:text-white transition-colors">Overview</Link></li>
                   <li><Link href="/pdf" className="hover:text-white transition-colors">PDF Learning</Link></li>
                   <li><Link href="/blogs" className="hover:text-white transition-colors">Blog Platform</Link></li>
                   <li><Link href="/editor" className="hover:text-white transition-colors">AI Editor</Link></li>
                   <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                 </ul>
               </div>
             </div>

             {/* Middle Section - Resources */}
             <div className="space-y-8">
               <div>
                 <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
                 <ul className="space-y-2 text-sm text-gray-300">
                   <li><Link href="https://github.com/yashdarbar" className="hover:text-white transition-colors">Github</Link></li>
                   <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
                   <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                   <li><Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                 </ul>
               </div>
             </div>

             {/* Right Section - Interactive Elements & Socials */}
             <div className="space-y-6">
               {/* Social Media Icons */}
               <div className="flex justify-end gap-4">
                 <Link href="https://twitter.com" className="p-2 text-gray-400 hover:text-white transition-colors">
                   <Twitter className="w-5 h-5" />
                 </Link>
                 <Link href="https://github.com" className="p-2 text-gray-400 hover:text-white transition-colors">
                   <Github className="w-5 h-5" />
                 </Link>
                 <Link href="https://linkedin.com" className="p-2 text-gray-400 hover:text-white transition-colors">
                   <Linkedin className="w-5 h-5" />
                 </Link>
                 <Link href="https://youtube.com" className="p-2 text-gray-400 hover:text-white transition-colors">
                   <Youtube className="w-5 h-5" />
                 </Link>
                 <Link href="mailto:contact@learn-scribe.com" className="p-2 text-gray-400 hover:text-white transition-colors">
                   <Mail className="w-5 h-5" />
                 </Link>
               </div>

               {/* Email Subscription */}
               <div className="space-y-3">
                 <form onSubmit={handleSubscribe} className="flex gap-2">
                   <input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="Enter your email"
                     className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                   />
                   <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                     <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                     <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-950 text-xs font-medium backdrop-blur-3xl">
                       <button
                         type="submit"
                         className="inline-flex rounded-full text-center group items-center justify-center bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/10 hover:via-purple-400/30 hover:to-transparent transition-all duration-300 py-2 px-4 text-sm"
                       >
                         Subscribe
                       </button>
                     </div>
                   </span>
                 </form>
               </div>
             </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                © 2025 Learn-Scribe. All rights reserved.
              </div>
                             <div className="text-sm text-gray-400 flex items-center gap-1">
                 Made with <Heart className="w-3 h-3 mt-1" /> for better learning
               </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
);

Footer.displayName = "Footer";

export { Footer };
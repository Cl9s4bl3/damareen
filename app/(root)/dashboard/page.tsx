export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }
  return (
      <div className="flex flex-col sm:flex-row items-center justify-center min-h-screen w-full p-4 gap-12">
          {/* Bal */}
          <div className="flex justify-center w-full sm:w-1/2">
              <Link
                  href="/jatekvalasztas"
                  className="
  w-[clamp(250px,40vw,400px)]
  h-[clamp(250px,40vw,400px)]
  min-w-[220px] min-h-[220px]
  relative flex flex-col items-center justify-center
  text-[clamp(1.5rem,3vw,3rem)]
  font-mono font-bold text-blue-500
  border-2 border-blue-800 rounded-lg
  transition-all duration-300 transform
  hover:bg-blue-900/20
  hover:shadow-[0_0_30px_rgba(16,130,187,0.6)]
  hover:border-blue-600
  hover:scale-105
  active:scale-95
  group
"

              >
      <pre className="flex items-center justify-center h-full text-center leading-none font-mono text-lg">
{`  ..--=-:::.       
..==:.....-=..      
.+:.........=:.     
-=..........-+.     
-=..........-#:     
.*:........:**.     
..*=.....:+#**#-.   
  ..=*###*-*@@#+#:. 
          ..#@@%**#.
            ..%@@%**
              .:@@+.`}
      </pre>

                  Játék keresés
              </Link>
          </div>

          {/* Jobb */}
          <div className="flex justify-center w-full sm:w-1/2">
              <Link
                  href="/letrehozas"
                  className="
  w-[clamp(250px,40vw,400px)]
  h-[clamp(250px,40vw,400px)]
  min-w-[220px] min-h-[220px]
  relative flex flex-col items-center justify-center
  text-[clamp(1.5rem,3vw,3rem)]
  font-mono font-bold text-green-300
  border-2 border-green-800 rounded-lg
  transition-all duration-300 transform
  hover:bg-green-900/20
  hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]
  hover:border-green-500
  hover:scale-105
  active:scale-95
  group
"

              >
      <pre className="flex items-center justify-center h-full text-center leading-none font-mono text-lg">
{`                    
        .::..       
        --:#.       
        --:#.       
   -****#-:******.  
   =-:::::::::::+.  
   .::::=-:#::::..  
        --:#.       
        --:#.       
        .....       
                    `}
      </pre>
                  Létrehozás
              </Link>
          </div>
      </div>
  );
};
export default Page;

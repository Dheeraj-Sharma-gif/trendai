
import { useEffect, useState } from "react";
import { AuroraBackground } from "./components/Aurorabg";
import { motion } from "motion/react";
import { PointerHighlight } from "./components/Ptr";
import { WorldMap } from "./components/Wmap";
import { HeroSectionOne } from "./components/Hero";
import {fetchEventSource} from '@microsoft/fetch-event-source'
import { MT } from "./components/mt";





export default function App(){


  return (
  <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative z-20 flex h-[80vh] flex-col items-center justify-center px-4 text-center"
      >
     

        <HeroSectionOne/>
      
      </motion.div>
    </AuroraBackground>
  )
}



import { motion } from 'framer-motion';

interface FloppyNode {
  anchorClass: string;
  sizeClass: string;
  hue: string;
  delay: number;
}

const floppyNodes: FloppyNode[] = [
  { anchorClass: 'left-[10%] top-[20%]', sizeClass: 'w-[90px] h-[90px] sm:w-[120px] sm:h-[120px]', hue: 'from-purple-400/40 to-pink-400/40', delay: 0 },
  { anchorClass: 'left-[80%] top-[15%]', sizeClass: 'w-[70px] h-[70px] sm:w-[100px] sm:h-[100px]', hue: 'from-blue-400/40 to-cyan-400/40', delay: 0.2 },
  { anchorClass: 'left-[15%] top-[70%]', sizeClass: 'w-[110px] h-[110px] sm:w-[160px] sm:h-[160px]', hue: 'from-emerald-400/30 to-teal-400/30', delay: 0.4 },
  { anchorClass: 'left-[75%] top-[75%]', sizeClass: 'w-[100px] h-[100px] sm:w-[140px] sm:h-[140px]', hue: 'from-amber-400/40 to-orange-400/40', delay: 0.1 },
  { anchorClass: 'left-[45%] top-[10%]', sizeClass: 'w-[60px] h-[60px] sm:w-[80px] sm:h-[80px]', hue: 'from-rose-400/30 to-red-400/30', delay: 0.3 },
  { anchorClass: 'left-[60%] top-[60%]', sizeClass: 'w-[80px] h-[80px] sm:w-[110px] sm:h-[110px]', hue: 'from-indigo-400/40 to-violet-400/40', delay: 0.5 },
];

export default function FloatingFloppyItems() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {floppyNodes.map((node, index) => (
        <motion.div
          key={index}
          className={`absolute ${node.anchorClass} pointer-events-auto cursor-grab active:cursor-grabbing`}
          drag
          dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
          dragElastic={0.5}
          initial={{ y: 20, opacity: 0, scale: 0.8 }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
            opacity: 1,
            scale: 1,
          }}
          transition={{
            y: {
              duration: 4 + index * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            },
            rotate: {
              duration: 5 + index * 0.2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            opacity: { duration: 0.8 },
            scale: { duration: 0.8 }
          }}
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9, rotate: -15, cursor: "grabbing" }}
        >
          <div
            className={`floppy-chip w-full h-full bg-gradient-to-br ${node.hue} shadow-2xl backdrop-blur-xl`}
          />
        </motion.div>
      ))}
    </div>
  );
}

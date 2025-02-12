"use client";

import React, { useEffect, useState } from "react";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarIcon } from "@nextui-org/react";

export const FollowerPointerCard = ({
  children,
  className,
  name,
  image,
}: {
  children: React.ReactNode;
  image?: string;
  className?: string;
  name?: string;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isInside, setIsInside] = useState<boolean>(false);

  useEffect(() => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rect) {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      x.set(e.clientX - rect.left + scrollX);
      y.set(e.clientY - rect.top + scrollY);
    }
  };
  const handleMouseLeave = () => {
    setIsInside(false);
  };

  const handleMouseEnter = () => {
    setIsInside(true);
  };
  return (
    <div
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      style={{
        cursor: "none",
      }}
      ref={ref}
      className={cn("relative", className)}
    >
      <AnimatePresence mode="wait">
        {isInside && <FollowPointer x={x} y={y} name={name} image={image} />}
      </AnimatePresence>
      {children}
    </div>
  );
};

export const FollowPointer = ({
  x,
  y,
  name,
  image,
}: {
  x: MotionValue<number> | undefined;
  y: MotionValue<number> | undefined;
  image?: string;
  name?: string;
}) => {
  return (
    <motion.div
      className="absolute z-50 mt-4 h-4 w-4 rounded-full"
      style={{
        top: y,
        left: x,
        pointerEvents: "none",
      }}
      initial={{
        scale: 1,
        opacity: 1,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
    >
      <motion.div
        initial={{
          scale: 0.5,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.5,
          opacity: 0,
        }}
        className={
          "min-w-max whitespace-nowrap rounded-full bg-sky-500 px-2 py-2 text-xs text-white shadow-md"
        }
      >
        <div className="flex items-center gap-2">
          <Avatar
            icon={image ? undefined : <AvatarIcon />}
            src={image ?? ""}
            classNames={{
              base: "bg-gradient-to-br from-[#FFB457] to-[#FF705B] w-6 h-6",
              icon: "text-black/80",
            }}
          />
          <div>{name}</div>
        </div>
      </motion.div>
    </motion.div>
  );
};
